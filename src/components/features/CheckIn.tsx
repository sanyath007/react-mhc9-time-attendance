import { useRef, useEffect, useState } from 'react';
import { Camera, CheckCircle, XCircle, User, X, AlertCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';
import moment from 'moment';
import api from '../../api';
import { loadModels } from '../../utils/face-recognition';
import { dataURLtoBlob } from '../../utils/image';
import { type DetectedEmployee, type Employee } from '../../lib/types';
import { ComparationStatus } from '../../lib/constants';

type EmployeeModel = {
    employee: Employee;
    distance: number;
}

export default function CheckIn({ distance }: { distance: number }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
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
            setVideoDimensions(prev => ({
                width: isMobile ? window.innerWidth - 32 : 640,
                height: isMobile ? (window.innerWidth - 32) * 4 / 3 : 480
            }));
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
                console.log(bestMatch);

                /** Recognition threshold that can adjust based on your needs */
                const threshold = 0.6;
                if (bestMatch.distance < threshold) {
                    /** If compareation is success */
                    setCompared(ComparationStatus.SUCCESS);
                    setDetectedEmployee({
                        id: bestMatch?.employee?.id,
                        name: bestMatch?.employee?.fullname,
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
            formData.append('check_in_time', moment().format('YYYY-MM-DD HH:mm:ss'));
            formData.append('check_in_image', dataURLtoBlob(capturedImage), "captured_image.png");
            formData.append('check_in_score', '5');

            const response = await api.post('/api/time-attendance/check-in', formData);
            console.log(response);

            if (response.statusText === 'OK') {
                setCheckInStatus('success');
            } else {
                setCheckInStatus('error');
            }

            setCheckInStatus('success');

            // setTimeout(() => {
            //     setCapturedImage(null);
            //     setDetectedEmployee(null);
            //     setCheckInStatus(null);
            //     setIsProcessing(false);
            //     setCompared(ComparationStatus.IDLE);

            //     startCamera();
            // }, 3000);
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
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6 max-md:p-3 max-md:mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Detected Employee</p>
                            <p className="text-2xl max-md:text-xl font-bold text-blue-900">{detectedEmployee?.name}</p>
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
                            <p className="text-md text-red-600 font-semibold">Employee not found!</p>
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
                        Please position your face in the center of the frame and ensure good lighting
                    </p>
                </div>
            )}

            {/* Success Message */}
            {checkInStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-md:p-3 max-md:mb-3">
                    <div className="flex items-center justify-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium max-md:text-sm">Check-in successful! Have a great day!</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {checkInStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-md:p-3">
                    <div className="flex items-center justify-center gap-2 text-red-800">
                        <XCircle className="w-5 h-5" />
                        <p className="font-medium max-md:text-sm">Check-in failed. Please try again.</p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div
                className="flex gap-4 mx-auto w-full"
                style={{ maxWidth: videoDimensions.width > 640 ? '100%' : videoDimensions.width }}
            >
                {!capturedImage ? (
                    <button
                        onClick={capturePhoto}
                        disabled={!faceDetected || !isCameraActive || !modelsLoaded || isProcessing || distance > 500}
                        className="flex w-full justify-center items-center gap-2 px-8 max-md:px-4 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                    >
                        <Camera className="w-5 h-5" />
                        {isProcessing ? 'Processing...' : 'Capture & Recognize'}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleCancel}
                            disabled={checkInStatus === 'processing'}
                            className="flex flex-1 justify-center items-center gap-2 px-8 max-md:px-4 py-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                        >
                            <XCircle className="w-5 h-5" />
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={checkInStatus === 'processing' || !detectedEmployee}
                            className="flex flex-1 justify-center items-center gap-2 px-8 max-md:px-4 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                        >
                            <CheckCircle className="w-5 h-5" />
                            {checkInStatus === 'processing' ? 'Processing...' : 'Check In'}
                        </button>
                    </>
                )}
            </div>

            {/* Info Panel */}
            <div className="mt-8 max-md:mt-3 grid grid-cols-4 gap-3">
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Models</p>
                    <p className={`text-lg max-md:text-sm font-bold ${modelsLoaded ? 'text-green-600' : 'text-gray-600'}`}>
                        {modelsLoaded ? 'Loaded' : 'Loading'}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className={`text-lg max-md:text-sm font-bold ${modelsLoaded ? 'text-green-600' : 'text-gray-600'}`}>
                        {capturedImage ? 'Ready' : 'Capturing'}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Face <span className="max-md:hidden">Detection</span></p>
                    <p className={`text-lg max-md:text-sm font-bold ${modelsLoaded ? 'text-green-600' : 'text-gray-600'}`}>
                        {faceDetected ? 'Active' : 'Inactive'}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 max-md:p-2 rounded-lg text-center">
                    <p className="text-gray-600 text-sm">Camera</p>
                    <p className={`text-lg max-md:text-sm font-bold ${modelsLoaded ? 'text-green-600' : 'text-gray-600'}`}>
                        {isCameraActive ? 'On' : 'Off'}
                    </p>
                </div>
            </div>
        </>
    );
}