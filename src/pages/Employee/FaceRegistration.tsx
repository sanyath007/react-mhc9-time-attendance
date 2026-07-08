import { useRef, useEffect, useState, type RefObject } from 'react';
import { Camera, UserPlus, XCircle, CheckCircle, AlertCircle, Trash2, Eye, ShieldAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import api from '../../api';
import { loadModels } from '../../lib/utils/face-recognition';
import { startCamera, stopCamera } from '../../lib/utils/camera';
import ImageViewer from '../../components/ui/ImageViewer';
import EmployeePosition from '../../components/features/EmployeePosition';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';
import { type CapturedImage, type Employee, type FaceRecognitionData } from '../../lib/types';

export default function EmployeeFaceRegistration() {
    const { id } = useParams();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [faceDetected, setFaceDetected] = useState<boolean>(false);
    const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
    const [formData, setFormData] = useState<FaceRecognitionData>({ id: '', face_descriptor: '' });
    const [errors, setErrors] = useState<{ id: string, amountOfImage: string } | null>(null);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [preview, setPreview] = useState('');
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setVideoDimensions({
                width: isMobile ? window.innerWidth - 32 : 640,
                height: isMobile ? (window.innerWidth - 32) * 4 / 3 : 480
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchEmployee = async (employeeId: string) => {
            try {
                const res = await api.get(`/api/employees/${employeeId}`);
                if (res.status === 200) {
                    setEmployee(res.data);
                    setFormData(prev => ({ ...prev, id: employeeId }));
                }
            } catch (err) {
                console.error("Error fetching employee:", err);
            }
        };

        if (id) fetchEmployee(id);
    }, [id]);

    useEffect(() => {
        loadModels(() => setModelsLoaded(true));
    }, []);

    const detectFaces = async () => {
        if (!modelsLoaded || !videoRef.current) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            /** Draw detection box on canvas */
            const displaySize = {
                width: video.videoWidth,
                height: video.videoHeight
            };

            faceapi.matchDimensions(canvas!, displaySize);

            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(async () => {
                if (!video || video.paused || video.ended) return;

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                if (detections.length > 0) {
                    setFaceDetected(true);

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    const context = canvas?.getContext('2d');
                    context?.clearRect(0, 0, canvas!.width, canvas!.height);
                    faceapi.draw.drawDetections(canvas!, resizedDetections);
                } else {
                    setFaceDetected(false);
                    const context = canvas?.getContext('2d');
                    context?.clearRect(0, 0, canvas!.width, canvas!.height);
                }
            }, 100);
        } catch (err) {
            console.error('Error detecting face:', err);
        }
    };

    // Capture photo
    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current && modelsLoaded) {
            setIsProcessing(true);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/png');

            const detections = await faceapi
                .detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const faceDescriptor = detections.descriptor;

                setCapturedImages(prev => [...prev, {
                    image: imageData,
                    descriptor: Array.from(faceDescriptor),
                    timestamp: new Date().toISOString()
                }]);
            }

            setIsProcessing(false);

            if (capturedImages.length >= 4) {
                stopCamera(stream!, () => {
                    setStream(null);
                    setIsCameraActive(false);
                    setFaceDetected(false);
                });
            }
        }
    };

    const removeImage = (index: number) => {
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData?.id.trim()) newErrors.id = 'ID is required';
        if (capturedImages.length < 3) {
            newErrors.amountOfImage = 'กรุณาถ่ายรูปสะสมให้ได้อย่างน้อย 3 รูปเพื่อใช้จัดทำโครงสร้างจดจำใบหน้า';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setRegistrationStatus('processing');

        try {
            let avgDescriptor = null;
            if (capturedImages.length > 0) {
                avgDescriptor = capturedImages[0].descriptor.map((val: number, i: number) => {
                    let sum = val;
                    for (let j = 1; j < capturedImages.length; j++) {
                        sum += capturedImages[j].descriptor[i];
                    }
                    return sum / capturedImages.length;
                });

                /** POST to api */
                const result = await api.post(`/api/employees/${id}/update/descriptor`, {
                    ...formData,
                    face_descriptor: Array.from(avgDescriptor)
                });

                if (result.status === 200) {
                    setRegistrationStatus('success');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setRegistrationStatus('error');
        }
    };

    const handleReset = () => {
        setCapturedImages([]);
        setErrors(null);
        setRegistrationStatus(null);
        if (stream) {
            stopCamera(stream, () => {
                setStream(null);
                setIsCameraActive(false);
                setFaceDetected(false);
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4 py-2">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-white shrink-0">
                    <UserPlus className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                        ลงทะเบียนใบหน้า
                    </h1>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        บันทึกรูปภาพและจัดทำข้อมูลการจดจำใบหน้าของบุคลากร
                    </p>
                </div>
            </div>

            {/* Alert / Notification Bars */}
            {!modelsLoaded && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs font-semibold">กำลังโหลดโมเดลปัญญาประดิษฐ์สแกนใบหน้า...</p>
                </div>
            )}

            {registrationStatus === 'success' && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs font-semibold">ลงทะเบียนข้อมูลใบหน้าเรียบร้อยแล้ว!</p>
                </div>
            )}

            {registrationStatus === 'error' && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-800">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-xs font-semibold">เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง</p>
                </div>
            )}

            {/* Grid Layout Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Employee Information Card */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                            ข้อมูลรายละเอียดบุคลากร
                        </h2>

                        {employee && (
                            <div className="flex flex-col items-center space-y-5">
                                {/* Avatar frame */}
                                <div className="p-1 rounded-full border border-gray-200">
                                    <EmployeeAvatar
                                        image={`${import.meta.env.VITE_API_URL}/uploads/${employee?.avatar_url}`}
                                        alt={employee.firstname}
                                        width="90px"
                                        height="90px"
                                    />
                                </div>

                                {/* Information Lists */}
                                <div className="w-full space-y-3.5 pt-2">
                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 text-xs">
                                        <span className="text-gray-400 font-semibold block mb-0.5">ชื่อ-นามสกุล</span>
                                        <span className="font-bold text-gray-800">
                                            {employee.prefix?.name || ''}{employee.firstname} {employee.lastname}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 text-xs">
                                        <span className="text-gray-400 font-semibold block mb-0.5">ตำแหน่งงาน / ระดับปฏิบัติงาน</span>
                                        <span className="font-bold text-gray-800">
                                            <EmployeePosition position={employee.position} level={employee.level} />
                                        </span>
                                    </div>

                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 text-xs">
                                        <span className="text-gray-400 font-semibold block mb-0.5">อีเมลติดต่อ</span>
                                        <span className="font-bold text-gray-800">{employee.email || 'ไม่ได้ระบุ'}</span>
                                    </div>

                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 text-xs">
                                        <span className="text-gray-400 font-semibold block mb-0.5">เบอร์โทรศัพท์</span>
                                        <span className="font-bold text-gray-800">{employee.tel || 'ไม่ได้ระบุ'}</span>
                                    </div>

                                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60 text-xs">
                                        <span className="text-gray-400 font-semibold block mb-0.5">ที่อยู่ที่ติดต่อได้</span>
                                        <span className="font-bold text-gray-800 leading-relaxed block">
                                            {employee.address_no || '-'} ตำบล{employee.tambon?.name || '-'} อำเภอ{employee.amphur?.name || '-'} จังหวัด{employee.changwat?.name || '-'} {employee.zipcode || ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons inside Profile Card */}
                    {employee && (
                        <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6 shrink-0">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl border border-gray-200 transition-all cursor-pointer text-center"
                            >
                                ยกเลิก / รีเซ็ต
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={registrationStatus === 'processing' || !modelsLoaded || capturedImages.length < 3}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed cursor-pointer text-center"
                            >
                                {registrationStatus === 'processing' ? 'กำลังบันทึก...' : 'ลงทะเบียนใบหน้า'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column - Facial Recognition Scanner Panel */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Scanner Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                กล้องบันทึกวิเคราะห์ใบหน้า
                            </h2>
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 shrink-0">
                                ถ่ายภาพ {capturedImages.length} / 5 ภาพ
                            </span>
                        </div>

                        {/* Progress Bar Status */}
                        <div className="space-y-1.5 mb-4">
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                                <span>ความก้าวหน้าการจัดทำชุดข้อมูล</span>
                                <span>{Math.round((capturedImages.length / 5) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${(capturedImages.length / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Scanner Video Viewport */}
                        <div className="relative mb-5 flex justify-center">
                            <div
                                className="bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner border border-slate-900"
                                style={{
                                    width: '100%',
                                    maxWidth: videoDimensions.width > 640 ? '100%' : videoDimensions.width,
                                    aspectRatio: `${videoDimensions.width} / ${videoDimensions.height}`
                                }}
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover animate-fade-in"
                                    onLoadedMetadata={() => {
                                        if (videoRef.current) {
                                            setVideoDimensions({
                                                width: videoRef.current.videoWidth,
                                                height: videoRef.current.videoHeight
                                            });
                                        }
                                    }}
                                />

                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                />

                                {/* Floating camera active indicator */}
                                {(isCameraActive && modelsLoaded) && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${faceDetected ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                            } shadow-md`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            <span className="text-[10px] font-bold">
                                                {faceDetected ? 'ตรวจพบใบหน้า' : 'กรุณาขยับหน้าเข้าใกล้'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                        <div className="bg-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xl animate-bounce">
                                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                                            <p className="text-gray-800 text-xs font-bold">กำลังบันทึกภาพถ่าย...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scanner Warnings / Guide messages */}
                        {isCameraActive && capturedImages.length < 5 && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 mb-4 flex items-start gap-2.5 text-blue-800">
                                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-medium leading-relaxed">
                                    กรุณามองตรงไปที่กล้อง เอียงศีรษะหรือปรับมุมเล็กน้อยในการถ่ายแต่ละครั้งเพื่อให้ได้ข้อมูลใบหน้าที่ถูกต้องครบถ้วน (ต้องการอย่างน้อย 3 ภาพ)
                                </p>
                            </div>
                        )}

                        {errors?.amountOfImage && (
                            <div className="bg-red-50 border border-red-150 rounded-2xl p-3 mb-4 flex items-start gap-2 text-red-800">
                                <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-bold leading-relaxed">{errors?.amountOfImage}</p>
                            </div>
                        )}

                        {/* Scanner Actions Trigger bar */}
                        <div className="flex gap-3">
                            {!isCameraActive ? (
                                <button
                                    onClick={() => startCamera(videoRef as RefObject<HTMLVideoElement>, detectFaces, (mediaStream) => { setStream(mediaStream); setIsCameraActive(true); })}
                                    disabled={!modelsLoaded || capturedImages.length >= 5}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Camera className="w-4.5 h-4.5" />
                                    <span>เปิดกล้องสแกน</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => stopCamera(stream!, () => { setStream(null); setIsCameraActive(false); setFaceDetected(false); })}
                                        className="flex-1 px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 font-bold text-xs rounded-xl transition-all cursor-pointer text-center animate-fade-in"
                                    >
                                        ปิดกล้อง
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!faceDetected || isProcessing || capturedImages.length >= 5}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed text-center animate-fade-in"
                                    >
                                        <Camera className="w-4.5 h-4.5" />
                                        <span>ถ่ายรูปใบหน้า</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Captured Photos Grid Gallery */}
                    {capturedImages.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                รูปถ่ายสะสมในระบบ
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5">
                                {capturedImages.map((img, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-150 shadow-sm aspect-square bg-gray-50 flex items-center justify-center transition-all hover:shadow-md">
                                        <img
                                            src={img.image}
                                            alt={`Capture ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Hover Overlay Action icons */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowPreview(true);
                                                    setPreview(img.image);
                                                }}
                                                className="p-1.5 bg-white/25 hover:bg-white/40 text-white rounded-lg transition-all cursor-pointer"
                                                title="พรีวิวรูปใหญ่"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="p-1.5 bg-red-600/95 hover:bg-red-700 text-white rounded-lg transition-all cursor-pointer"
                                                title="ลบรูปนี้"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="absolute top-1 left-1.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Overlay image viewer */}
            <ImageViewer
                isShow={showPreview}
                onHide={(hide: boolean) => {
                    setShowPreview(hide);
                    !hide && setPreview('');
                }}
                image={preview}
            />
        </div>
    );
}