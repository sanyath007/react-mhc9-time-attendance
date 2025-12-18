import React, { useRef, useEffect, useState } from 'react';
import { Camera, UserPlus, XCircle, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';
import { useParams } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import ImageViewer from '../../components/ui/ImageViewer';
import api from '../../api';
import { loadModels } from '../../utils/face-recognition';
import { startCamera, stopCamera } from '../../utils/camera';
import EmployeePosition from '../../components/features/EmployeePosition';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';

interface CapturedImage {
    image: any;
    descriptor: any;
    timestamp: string;
};

type FaceRecognitionData = {
    id: string,
    face_descriptor: string,
}

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
    const [registrationStatus, setRegistrationStatus] = useState(null);    
    const [formData, setFormData] = useState<FaceRecognitionData>({ id: '', face_descriptor: '' });
    const [errors, setErrors] = useState<{ id: string, amountOfImage: string } | null>(null);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [preview, setPreview] = useState('');
    const [employee, setEmployee] = useState<any | null>(null);

    useEffect(() => {
        const fetchEmployee = async (id) => {
            const res = await api.get(`/api/employees/${id}`);

            if (res.status === 200) {
                setEmployee(res.data);
                setFormData(prev => ({ ...prev, id }));
            }
        }

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
                width: videoRef.current.videoWidth, 
                height: videoRef.current.videoHeight 
            };

            faceapi.matchDimensions(canvasRef.current, displaySize);

            setInterval(async () => {
                const detections = await faceapi
                    .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                if (detections.length > 0) {
                    setFaceDetected(true);

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    const context = canvasRef.current.getContext('2d');
                    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                } else {
                    setFaceDetected(false);
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
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/png');

            const detections = await faceapi
                .detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const faceDescriptor = detections.descriptor;

                setCapturedImages([...capturedImages, { 
                    image: imageData, 
                    descriptor: Array.from(faceDescriptor),
                    timestamp: new Date().toISOString()
                }]);
            }

            setIsProcessing(false);

            if (capturedImages.length >= 4) {
                stopCamera(stream, () => { setStream(null); setIsCameraActive(false); setFaceDetected(false); });
            }
        }
    };

    const removeImage = (index) => {
        setCapturedImages(capturedImages.filter((_, i) => i !== index));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData?.id.trim()) newErrors.id = 'ID is required';
        if (capturedImages.length < 3) {
            newErrors.amountOfImage = 'Please capture at least 3 photos for accurate recognition';
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
                /**
                 * ===================== Method 1 =====================
                 */
                // const avgDescriptor = capturedImages[0].descriptor.map((_, i) => {
                //     const sum = capturedImages.reduce((acc, img) => acc + img.descriptor[i], 0);

                //     return sum / capturedImages.length;
                // });

                /**
                 * ===================== Method 2 =====================
                 */
                avgDescriptor = capturedImages[0].descriptor.map((val, i) => {
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
        
                    // setTimeout(() => {
                    //     setFormData({
                    //         id: '',
                    //         face_descriptor: '',
                    //     });
                    //     setCapturedImages([]);
                    //     setRegistrationStatus(null);
                    // }, 3000);
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setRegistrationStatus('error');
        }
    };

    const handleReset = () => {
        // setFormData({
        //     id: '',
        //     face_descriptor: '',
        // });

        setCapturedImages([]);
        setErrors(null);
        setRegistrationStatus(null);
        stopCamera(stream, () => { setStream(null); setIsCameraActive(false); setFaceDetected(false); });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-3 rounded-lg">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">ลงทะเบียนใบหน้า</h1>
                        <p className="text-gray-600">Register facial recognition</p>
                    </div>
                </div>
            </div>

            {!modelsLoaded && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <p>Loading facial recognition models...</p>
                    </div>
                </div>
            )}

            {registrationStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">Employee registered successfully!</p>
                    </div>
                </div>
            )}

            {registrationStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="w-5 h-5" />
                        <p className="font-medium">Registration failed. Please try again.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลบุคลากร</h2>

                    {employee && (
                        <div className="flex flex-col items-center justify-between gap-4 h-[95%] py-6">
                            <div className="w-full flex flex-col items-center space-y-8">
                                <EmployeeAvatar
                                    image={`${process.env.REACT_APP_API_URL}/uploads/${employee?.avatar_url}`}
                                    alt={employee.firstname}
                                    width="150px"
                                    height="150px"
                                />

                                <div className="w-[90%] space-y-2">
                                    <p className="max-md:text-sm lg:text-lg">
                                        <span className="font-bold">ชื่อ-สกุล: </span>{employee.prefix?.name}{employee.firstname} {employee.lastname}
                                    </p>
                                    <p className="max-md:text-sm lg:text-lg">
                                        <span className="font-bold">ตำแหน่ง: </span>
                                        <EmployeePosition employee={employee} />
                                    </p>
                                    <p className="max-md:text-sm lg:text-lg">
                                        <span className="font-bold">ที่อยู่: </span>
                                        {employee.address_no} ต.{employee.tambon ? employee.tambon?.name : '-'} <br />
                                        อ.{employee.amphur ? employee.amphur?.name : '-'} จ.{employee.changwat ? employee.changwat?.name : '-'} {employee.zipcode ? employee.zipcode : '-'}
                                    </p>
                                    <p className="max-md:text-sm lg:text-lg">
                                        <span className="font-bold">เบอร์ติดต่อ: </span>{employee.tel}
                                    </p>
                                    <p className="max-md:text-sm lg:text-lg">
                                        <span className="font-bold">อีเมล: </span>{employee.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 w-full">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={registrationStatus === 'processing' || !modelsLoaded}
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {registrationStatus === 'processing' ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Capturing Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Facial Recognition Setup</h2>
                            <span className="text-sm text-gray-600">{capturedImages.length}/5 photos</span>
                        </div>

                        {/* Camera */}
                        <div className="relative mb-4">
                            <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
                                {/* {isCameraActive ? ( */}
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

                                        {(isCameraActive && modelsLoaded) && (
                                            <div className="absolute top-4 right-4">
                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
                                                    faceDetected ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                                                }`}>
                                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                    <span className="text-sm font-medium">{faceDetected ? 'Face Detected' : 'Detecting...'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {isProcessing && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="bg-white px-6 py-4 rounded-lg">
                                                    <p className="text-gray-800 font-medium">Capturing...</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                {/* ) : (
                                    <div className="text-center p-8">
                                        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-400">Camera not active</p>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        {isCameraActive && capturedImages.length < 5 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <p className="text-blue-800 text-sm text-center">
                                    Capture 3-5 photos from different angles for better accuracy
                                </p>
                            </div>
                        )}

                        {errors?.amountOfImage && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-red-800 text-sm text-center">{errors?.amountOfImage}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {!isCameraActive ? (
                                <button
                                    onClick={() => startCamera(videoRef, detectFaces, (mediaStream) => { setStream(mediaStream); setIsCameraActive(true); })}
                                    disabled={!modelsLoaded || capturedImages.length >= 5}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Camera className="w-5 h-5" />
                                    Start Camera
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => stopCamera(stream, () => { setStream(null); setIsCameraActive(false); setFaceDetected(false); })}
                                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                    >
                                        Stop Camera
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!faceDetected || isProcessing || capturedImages.length >= 5}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                        Capture
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Captured Images List */}
                    {capturedImages.length > 0 && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Captured Photos</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {capturedImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={img.image} 
                                            alt={`Capture ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowPreview(true);
                                                    setPreview(img.image);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Show preview button */}
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