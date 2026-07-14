import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, CheckCircle, XCircle, User, X, AlertCircle, Loader2, Image as ImageIcon, ScanFace, Eye, EyeOff, LogIn, LogOut } from 'lucide-react';
import ButtonGroupSelect from '../ui/Forms/ButtonGroupSelect';
import * as faceapi from 'face-api.js';
import moment from 'moment';
import api from '../../api';
import TimePicker from '../ui/Forms/TimePicker';
import { loadModels } from '../../lib/utils/face-recognition';
import { dataURLtoBlob } from '../../lib/utils/image';
import { type DetectedEmployee, type Employee } from '../../lib/types';
import { ComparationStatus } from '../../lib/constants';

type EmployeeModel = {
    employee: Employee;
    distance: number;
}

type CheckInProps = {
    distance?: number;
    location?: { latitude: number, longitude: number } | null;
}

export default function CheckIn({ location }: CheckInProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [checkInType, setCheckInType] = useState<'in' | 'out'>('in');
    const [checkInTime, setCheckInTime] = useState<string>(moment().format('HH:mm'));
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [checkInStatus, setCheckInStatus] = useState<string | null>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [detectedEmployee, setDetectedEmployee] = useState<DetectedEmployee | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [compared, setCompared] = useState<string>(ComparationStatus.IDLE); // "idle" | "success" | "error"
    const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
    const intervalRef = useRef<any>(null);

    // Call LoadModels on mounted
    useEffect(() => {
        loadModels(() => setModelsLoaded(true));

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

    // Start camera
    const startCamera = async () => {
        try {
            const isMobile = window.innerWidth < 768;
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: isMobile ? 480 : 640 },
                    height: { ideal: isMobile ? 640 : 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCameraActive(true);

                /** Start face detection after camera is ready */
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        setVideoDimensions({
                            width: videoRef.current.videoWidth,
                            height: videoRef.current.videoHeight
                        });
                    }
                };

                videoRef.current.onplay = () => {
                    detectFaces();
                };
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());

            setStream(null);
            setIsCameraActive(false);
            setFaceDetected(false);
        }

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Detect faces in real-time
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
            setCapturedImage(imageData);

            const detections = await faceapi
                .detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const faceDescriptor = detections.descriptor;

                /** Compare with stored employees face descriptors */
                const res = await api.get('/api/time-attendance/face/recognize');
                const employees = res.data;

                /** Find the best match using Euclidean distance */
                const matches = employees
                    .filter((employee: Employee) => employee.face_descriptor)
                    .map((employee: Employee) => ({
                        employee,
                        distance: faceapi.euclideanDistance(
                            Array.from(faceDescriptor),
                            JSON.parse(employee.face_descriptor || '') as number[]
                        )
                    }));
                const bestMatch = matches.reduce((min: EmployeeModel, curr: EmployeeModel) => curr.distance < min.distance ? curr : min);

                /** Recognition threshold that can adjust based on your needs */
                const threshold = 0.6;
                if (bestMatch.distance < threshold) {
                    /** If compareation is success */
                    setCompared(ComparationStatus.SUCCESS);
                    setDetectedEmployee({
                        id: bestMatch?.employee?.id,
                        name: bestMatch?.employee?.fullname,
                        position: `${bestMatch?.employee?.position?.name || ''} ${bestMatch?.employee?.level ? bestMatch?.employee?.level?.name : ''}`,
                        confidence: 1 - bestMatch.distance
                    });
                } else {
                    /** If compareation is failure */
                    setCompared(ComparationStatus.ERROR);
                    setDetectedEmployee(null);
                }
            }

            setIsProcessing(false);
            stopCamera();
        }
    };

    const getCheckTimeScore = (time: string) => {
        const checkTime = moment(time);
        let timeScore = 5;
        if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:00:00').toDate()) {
            timeScore = 5;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:15:00').toDate()) {
            timeScore = 4;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:30:00').toDate()) {
            timeScore = 3;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:45:00').toDate()) {
            timeScore = 2;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 09:00:00').toDate()) {
            timeScore = 1;
        } else {
            timeScore = 0;
        }
        return timeScore;
    }

    // Handle confirm check-in
    const handleConfirm = async () => {
        if (!capturedImage || !detectedEmployee) {
            alert('Please capture a photo first');
            return;
        }

        setCheckInStatus('processing');

        try {
            const formData = new FormData();
            formData.append('employee_id', detectedEmployee?.id);
            formData.append('check_time', moment().format('YYYY-MM-DD') + ' ' + checkInTime + ':00');
            formData.append('check_type', checkInType === 'in' ? '1' : '2');
            formData.append('check_image', dataURLtoBlob(capturedImage), "captured_image.png");
            formData.append('check_score', String(getCheckTimeScore(moment().format('YYYY-MM-DD') + ' ' + checkInTime + ':00')));
            if (location) {
                formData.append('latitude', location.latitude.toString());
                formData.append('longitude', location.longitude.toString());
            }

            const response = await api.post('/api/time-attendance/check-in', formData);
            if (response.statusText === 'OK') {
                setCheckInStatus('success');
            } else {
                setCheckInStatus('error');
            }

            setCheckInStatus('success');

            setTimeout(() => {
                setCapturedImage(null);
                setDetectedEmployee(null);
                setCheckInStatus(null);
                setIsProcessing(false);
                setCompared(ComparationStatus.IDLE);

                startCamera();
            }, 2000);
        } catch (err) {
            console.error('Error confirming check-in:', err);
            setCheckInStatus('error');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setCapturedImage(null);
        setDetectedEmployee(null);
        setCheckInStatus(null);
        setIsProcessing(false);
        setCompared(ComparationStatus.IDLE);

        startCamera();
    };

    // Auto-start camera on mount
    useEffect(() => {
        if (modelsLoaded) {
            startCamera();
        }

        return () => stopCamera();
    }, [modelsLoaded]);

    return (
        <>
            {/* Models Loading Status */}
            {!modelsLoaded && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-md:p-2 mb-6 max-md:mb-2">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <p>Loading facial recognition models...</p>
                    </div>
                </div>
            )}

            {/* Camera/Preview Section */}
            <div className="relative mb-6 max-md:mb-3 flex justify-center">
                <div
                    className="bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center shadow-lg relative"
                    style={{
                        width: '100%',
                        maxWidth: videoDimensions.width > 640 ? '100%' : videoDimensions.width,
                        aspectRatio: `${videoDimensions.width} / ${videoDimensions.height}`
                    }}
                >
                    {!capturedImage ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            />

                            {/* Face detection indicator */}
                            {isCameraActive && modelsLoaded && (
                                <div className="absolute top-4 right-4">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${faceDetected
                                        ? 'bg-green-500 text-white'
                                        : 'bg-yellow-500 text-white'
                                        }`}>
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        <span className="text-sm font-medium">
                                            {faceDetected ? 'Face Detected' : 'Detecting...'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-white px-6 py-4 rounded-lg">
                                        <p className="text-gray-800 font-medium">Analyzing face...</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            </div>

            {/* Employee Detection Result */}
            {detectedEmployee && (
                <div className="bg-blue-50/50 border-2 border-blue-300 rounded-lg p-4 mb-6 max-md:p-3 max-md:mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-900 font-medium">ผลการตรวจสอบ</p>
                            <p className="text-2xl max-md:text-xl font-bold text-blue-500">{detectedEmployee?.name}</p>
                            {(detectedEmployee?.position && detectedEmployee?.position !== '') && (
                                <p className="text-base max-md:text-sm text-blue-500">
                                    {detectedEmployee?.position}
                                </p>
                            )}
                        </div>
                        <div className="bg-blue-600 p-3 rounded-full">
                            <User className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Face recognition not found  */}
            {compared === ComparationStatus.ERROR && !detectedEmployee && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 max-md:p-3 max-md:mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-md text-red-600 font-semibold">ไม่พบบุคลากร!</p>
                        </div>
                        <div className="bg-red-600 p-2 rounded-full">
                            <X className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!capturedImage && isCameraActive && modelsLoaded && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-md:p-3 max-md:mb-3">
                    <p className="text-blue-800 text-center max-md:text-sm">
                        กรุณาจัดตำแหน่งใบหน้าให้อยู่กึ่งกลางกล้อง และอยู่ในที่ที่มีแสงสว่างเพียงพอ
                    </p>
                </div>
            )}

            {/* Success Message */}
            {checkInStatus === 'success' && (
                <div className="bg-emerald-50/50 border border-emerald-300 rounded-lg p-4 mb-6 max-md:p-3 max-md:mb-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-500">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium max-md:text-sm">ลงเวลาสำเร็จ! มีความสุขกับการทำงาน</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {checkInStatus === 'error' && (
                <div className="bg-rose-50/50 border border-rose-300 rounded-lg p-4 mb-6 max-md:p-3">
                    <div className="flex items-center justify-center gap-2 text-rose-500">
                        <XCircle className="w-5 h-5" />
                        <p className="font-medium max-md:text-sm">ไม่สามารถลงเวลาได้ กรุณาลองใหม่อีกครั้ง</p>
                    </div>
                </div>
            )}

            {/* Check-in Form */}
            {(detectedEmployee && checkInStatus !== 'success') && (
                <div className="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100 mx-auto w-full" style={{ maxWidth: videoDimensions.width > 640 ? '100%' : videoDimensions.width }}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">ประเภท</label>
                            <ButtonGroupSelect
                                options={[
                                    {
                                        value: 'in',
                                        label: 'เข้า',
                                        icon: <LogIn className={`w-4 h-4 transition-colors ${checkInType === 'in' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    },
                                    {
                                        value: 'out',
                                        label: 'ออก',
                                        icon: <LogOut className={`w-4 h-4 transition-colors ${checkInType === 'out' ? 'text-pink-500' : 'text-gray-400'}`} />
                                    }
                                ]}
                                value={checkInType}
                                onChange={(val) => setCheckInType(val as 'in' | 'out')}
                                containerCss="rounded-lg h-[50px]"
                                buttonCss="h-[34px] !py-2.5 !rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">เวลา</label>
                            <TimePicker
                                value={checkInTime}
                                onChange={(val) => setCheckInTime(val)}
                                use24Hour={true}
                                showSeconds={false}
                                inputCss="h-[50px]"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div
                className="flex gap-4 mx-auto w-full"
                style={{ maxWidth: videoDimensions.width > 640 ? '100%' : videoDimensions.width }}
            >
                {(capturedImage && checkInStatus !== 'success') ? (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={checkInStatus === 'processing'}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-200"
                        >
                            <XCircle className="w-4.5 h-4.5" />
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={checkInStatus === 'processing' || !detectedEmployee}
                            className="flex-[2] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                        >
                            <CheckCircle className="w-4.5 h-4.5" />
                            {checkInStatus === 'processing' ? 'Processing...' : `ลงเวลา${checkInType === 'in' ? 'เข้า' : 'ออก'}งาน`}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={capturePhoto}
                        disabled={!faceDetected || !isCameraActive || !modelsLoaded || isProcessing}
                        className="flex w-full justify-center items-center gap-2 px-8 max-md:px-4 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                    >
                        {/* || distance > 500 */}
                        <Camera className="w-5 h-5" />
                        {isProcessing ? 'Processing...' : 'Capture & Recognize'}
                    </button>
                )}
            </div >

            {/* Info Panel */}
            < div className="mt-8 max-md:mt-3 grid grid-cols-4 gap-3" >
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-[11px] md:text-sm mb-1">Models</p>
                    <div className={`${modelsLoaded ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {modelsLoaded ? <CheckCircle className="w-5 h-5 max-md:w-4 max-md:h-4" /> : <Loader2 className="w-5 h-5 max-md:w-4 max-md:h-4 animate-spin" />}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-[11px] md:text-sm mb-1">Status</p>
                    <div className={`${capturedImage ? 'text-indigo-500' : 'text-blue-500'}`}>
                        {capturedImage ? <ImageIcon className="w-5 h-5 max-md:w-4 max-md:h-4" /> : <ScanFace className="w-5 h-5 max-md:w-4 max-md:h-4 animate-pulse" />}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-[11px] md:text-sm mb-1">Face</p>
                    <div className={`${faceDetected ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {faceDetected ? <Eye className="w-5 h-5 max-md:w-4 max-md:h-4" /> : <EyeOff className="w-5 h-5 max-md:w-4 max-md:h-4" />}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-[11px] md:text-sm mb-1">Camera</p>
                    <div className={`${isCameraActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {isCameraActive ? <Camera className="w-5 h-5 max-md:w-4 max-md:h-4" /> : <CameraOff className="w-5 h-5 max-md:w-4 max-md:h-4" />}
                    </div>
                </div>
            </div >
        </>
    );
}