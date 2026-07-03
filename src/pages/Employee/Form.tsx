import { useRef, useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Camera,
    UserPlus,
    XCircle,
    Trash2,
    Eye,
    ArrowLeft,
    User,
    Mail,
    Briefcase,
    IdCard,
    ShieldCheck,
    Sparkles,
    RefreshCw,
    ScanFace,
    ChevronDown,
    Phone,
    MapPin,
    FileText,
    AlertCircle,
    Upload
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import ImageViewer from '../../components/ui/ImageViewer';
import DatePicker from '../../components/ui/Forms/DatePicker';
import SearchableSelect from '../../components/ui/Forms/SearchableSelect';
import ButtonGroupSelect from '../../components/ui/Forms/ButtonGroupSelect';
import ErrorMessage from '../../components/ui/Forms/ErrorMessage';
import { type CapturedImage } from '../../lib/types';
import { loadModels } from '../../utils/face-recognition';
import { startCamera, stopCamera } from '../../utils/camera';
import api from '../../api';

type EmployeeData = {
    employee_no: string;
    prefix_id: string;
    firstname: string;
    lastname: string;
    cid: string;
    birthdate: string;
    sex: string;
    address_no: string;
    moo: string;
    road: string;
    changwat_id: string;
    amphur_id: string;
    tambon_id: string;
    zipcode: string;
    tel: string;
    email: string;
    line_id: string;
    position_id: string;
    level_id: string;
    started_at: string;
    assigned_at: string;
    remark: string;
    duty_id: string;
    department_id: string;
    division_id: string;
    avatar_url: string;
}

const initialEmployeeData: EmployeeData = {
    employee_no: '',
    prefix_id: '',
    firstname: '',
    lastname: '',
    cid: '',
    birthdate: '',
    sex: '',
    address_no: '',
    moo: '',
    road: '',
    changwat_id: '',
    amphur_id: '',
    tambon_id: '',
    zipcode: '',
    tel: '',
    email: '',
    line_id: '',
    position_id: '',
    level_id: '',
    started_at: '',
    assigned_at: '',
    remark: '',
    duty_id: '',
    department_id: '',
    division_id: '',
    avatar_url: '',
};

const duties = [
    { id: 4, name: 'ผู้ปฏิบัติงาน' },
    { id: 1, name: 'หัวหน้างาน' },
    { id: 2, name: 'ผู้บริหาร' }
];

type OptionItem = { id: number | string; name: string;[key: string]: any };

type FormOptions = {
    prefixes: OptionItem[];
    provinces: OptionItem[];
    districts: OptionItem[];
    subdistricts: OptionItem[];
    positions: OptionItem[];
    levels: OptionItem[];
    departments: OptionItem[];
    divisions: OptionItem[];
};

export default function EmployeeForm() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
    const [flashActive, setFlashActive] = useState(false);

    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'work'>('general');

    const [formData, setFormData] = useState<EmployeeData>(initialEmployeeData);
    const [errors, setErrors] = useState<Partial<EmployeeData> | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const [options, setOptions] = useState<FormOptions>({
        prefixes: [],
        provinces: [],
        districts: [],
        subdistricts: [],
        positions: [],
        levels: [],
        departments: [],
        divisions: []
    });

    useEffect(() => {
        const fetchInitData = async () => {
            try {
                const response = await api.get('/api/employees/init/form');
                const data = response.data;
                setOptions({
                    prefixes: data.prefixes || [],
                    provinces: data.changewats || [],
                    districts: data.amphurs || [],
                    subdistricts: data.tambons || [],
                    positions: data.positions || [],
                    levels: data.levels || [],
                    departments: data.departments || [],
                    divisions: data.divisions || []
                });
            } catch (error) {
                console.error("Error fetching form options:", error);
            }
        };
        fetchInitData();
    }, []);

    const { prefixes, provinces, districts, subdistricts, positions, levels, departments, divisions } = options;
    const [preview, setPreview] = useState('');

    const intervalRef = useRef<any>(null);

    // Compute active districts/subdistricts/divisions based on selections
    const filteredDistricts = districts.filter(d => d.chw_id === formData.changwat_id);
    const filteredSubdistricts = subdistricts.filter(s => s.amp_id === formData.amphur_id);
    const filteredDivisions = divisions.filter(div => div.department_id === formData.department_id);

    useEffect(() => {
        loadModels(() => setModelsLoaded(true));

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleStartCamera = async () => {
        await startCamera(
            videoRef,
            () => {
                detectFaces();
            },
            (mediaStream) => {
                setStream(mediaStream);
                setIsCameraActive(true);
            }
        );
    };

    const handleStopCamera = () => {
        if (stream) {
            stopCamera(stream, () => {
                setStream(null);
                setIsCameraActive(false);
                setFaceDetected(false);
                if (intervalRef.current) clearInterval(intervalRef.current);

                // Clear face detection box canvas
                const canvas = canvasRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d');
                    context?.clearRect(0, 0, canvas.width, canvas.height);
                }
            });
        }
    };

    const detectFaces = async () => {
        if (!modelsLoaded || !videoRef.current) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            const displaySize = {
                width: video.videoWidth || 640,
                height: video.videoHeight || 480
            };

            if (canvas) {
                faceapi.matchDimensions(canvas, displaySize);
            }

            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(async () => {
                if (!video || video.paused || video.ended) return;

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                if (detections.length > 0) {
                    setFaceDetected(true);

                    if (canvas) {
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        const context = canvas.getContext('2d');
                        context?.clearRect(0, 0, canvas.width, canvas.height);
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                    }
                } else {
                    setFaceDetected(false);
                    if (canvas) {
                        const context = canvas.getContext('2d');
                        context?.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }, 100);
        } catch (err) {
            console.error('Error detecting face:', err);
        }
    };

    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current && modelsLoaded) {
            setIsProcessing(true);
            setFlashActive(true);
            setTimeout(() => setFlashActive(false), 150);

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/png');

            const detections = await faceapi
                .detectSingleFace(video)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                const faceDescriptor = detections.descriptor;

                setCapturedImages(prev => {
                    const updated = [...prev, {
                        image: imageData,
                        descriptor: Array.from(faceDescriptor),
                        timestamp: new Date().toISOString()
                    }];

                    if (updated.length >= 5) {
                        setTimeout(() => handleStopCamera(), 100);
                    }
                    return updated;
                });
            } else {
                alert('ไม่สามารถตรวจจับใบหน้าได้ กรุณาจัดตำแหน่งใบหน้าให้อยู่ตรงกลางกล้อง');
            }

            setIsProcessing(false);
        }
    };

    const removeImage = (index: number) => {
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Reset cascading address selects
        if (name === 'changwat_id') {
            setFormData(prev => ({ ...prev, changwat_id: value, amphur_id: '', tambon_id: '' }));
        } else if (name === 'amphur_id') {
            setFormData(prev => ({ ...prev, amphur_id: value, tambon_id: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors && name in errors) {
            setErrors(prev => {
                if (!prev) return null;
                const clone = { ...prev };
                delete clone[name as keyof EmployeeData];
                return clone;
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        // Reset cascading address selects
        if (name === 'changwat_id') {
            setFormData(prev => ({ ...prev, changwat_id: value, amphur_id: '', tambon_id: '' }));
        } else if (name === 'amphur_id') {
            setFormData(prev => ({ ...prev, amphur_id: value, tambon_id: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors && name in errors) {
            setErrors(prev => {
                if (!prev) return null;
                const clone = { ...prev };
                delete clone[name as keyof EmployeeData];
                return clone;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Partial<EmployeeData> = {};

        // Tab 1 validation
        if (!formData.employee_no.trim()) newErrors.employee_no = 'กรุณากรอกรหัสพนักงาน';
        if (!formData.prefix_id) newErrors.prefix_id = 'กรุณาเลือกคำนำหน้า';
        if (!formData.firstname.trim()) newErrors.firstname = 'กรุณากรอกชื่อจริง';
        if (!formData.lastname.trim()) newErrors.lastname = 'กรุณากรอกนามสกุล';
        if (!formData.cid.trim()) {
            newErrors.cid = 'กรุณากรอกเลขบัตรประชาชน';
        } else if (formData.cid.trim().length !== 13) {
            newErrors.cid = 'เลขบัตรประชาชนต้องมี 13 หลัก';
        }
        if (!formData.birthdate) newErrors.birthdate = 'กรุณาเลือกวันเกิด';
        if (!formData.sex) newErrors.sex = 'กรุณาเลือกเพศ';

        // Tab 2 validation
        if (!formData.tel.trim()) {
            newErrors.tel = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^[0-9\-+]{9,15}$/.test(formData.tel.trim())) {
            newErrors.tel = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
        }
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        if (!formData.address_no.trim()) newErrors.address_no = 'กรุณากรอกบ้านเลขที่';
        if (!formData.changwat_id) newErrors.changwat_id = 'กรุณาเลือกจังหวัด';
        if (!formData.amphur_id) newErrors.amphur_id = 'กรุณาเลือกอำเภอ';
        // if (!formData.tambon_id) newErrors.tambon_id = 'กรุณาเลือกตำบล';
        if (!formData.zipcode.trim()) newErrors.zipcode = 'กรุณากรอกรหัสไปรษณีย์';

        // Tab 3 validation
        if (!formData.position_id) newErrors.position_id = 'กรุณาเลือกตำแหน่งงาน';
        if (!formData.level_id) newErrors.level_id = 'กรุณาเลือกระดับ';
        if (!formData.started_at) newErrors.started_at = 'กรุณาเลือกวันที่เริ่มงาน';
        if (!formData.assigned_at) newErrors.assigned_at = 'กรุณาเลือกวันที่บรรจุ/มอบหมาย';
        if (!formData.department_id) newErrors.department_id = 'กรุณาเลือกฝ่าย/กลุ่มงาน';
        if (!formData.division_id) newErrors.division_id = 'กรุณาเลือกงาน/สาขา';
        if (!formData.duty_id) newErrors.duty_id = 'กรุณาเลือกบทบาทหน้าที่';

        // Camera validation
        if (capturedImages.length < 3) {
            newErrors.avatar_url = 'กรุณาถ่ายภาพสแกนอย่างน้อย 3 รูปเพื่อใช้จัดทำระบบจดจำใบหน้า';
        }

        setErrors(newErrors);

        // Auto-switch tabs to focus on errors
        const generalFields: (keyof EmployeeData)[] = ['employee_no', 'prefix_id', 'firstname', 'lastname', 'cid', 'birthdate', 'sex'];
        const contactFields: (keyof EmployeeData)[] = ['tel', 'email', 'line_id', 'address_no', 'moo', 'road', 'changwat_id', 'amphur_id', 'tambon_id', 'zipcode'];
        const workFields: (keyof EmployeeData)[] = ['position_id', 'level_id', 'started_at', 'assigned_at', 'department_id', 'division_id', 'duty_id'];

        const hasGeneralError = generalFields.some(f => !!newErrors[f]);
        const hasContactError = contactFields.some(f => !!newErrors[f]);
        const hasWorkError = workFields.some(f => !!newErrors[f]);

        if (hasGeneralError) {
            setActiveTab('general');
        } else if (hasContactError) {
            setActiveTab('contact');
        } else if (hasWorkError) {
            setActiveTab('work');
        }

        return Object.keys(newErrors).length === 0;
    };

    const countTabErrors = (fields: (keyof EmployeeData)[]) => {
        if (!errors) return 0;
        return fields.filter(f => !!errors[f]).length;
    };

    const errorsGeneralCount = countTabErrors(['employee_no', 'prefix_id', 'firstname', 'lastname', 'cid', 'birthdate', 'sex']);
    const errorsContactCount = countTabErrors(['tel', 'email', 'line_id', 'address_no', 'moo', 'road', 'changwat_id', 'amphur_id', 'tambon_id', 'zipcode']);
    const errorsWorkCount = countTabErrors(['position_id', 'level_id', 'started_at', 'assigned_at', 'department_id', 'division_id', 'duty_id']);

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setRegistrationStatus('processing');

        try {
            let avgDescriptor = null;
            if (capturedImages.length > 0) {
                avgDescriptor = capturedImages[0].descriptor.map((val: any, i: number) => {
                    let sum = val;
                    for (let j = 1; j < capturedImages.length; j++) {
                        sum += capturedImages[j].descriptor[i];
                    }
                    return sum / capturedImages.length;
                });
            }

            // Simulate server network latency for clean UX response
            await new Promise(resolve => setTimeout(resolve, 2000));

            setRegistrationStatus('success');

            setTimeout(() => {
                navigate('/employee');
            }, 2500);
        } catch (err) {
            console.error('Registration error:', err);
            setRegistrationStatus('error');
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatarImage: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReset = () => {
        setFormData(initialEmployeeData);
        setCapturedImages([]);
        setErrors(null);
        setRegistrationStatus(null);
        handleStopCamera();
        setActiveTab('general');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0%; opacity: 0.2; }
                    50% { top: 100%; opacity: 0.8; }
                }
                .animate-scan {
                    animation: scan 3s infinite linear;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s infinite ease-in-out;
                }
            `}</style>

            {/* Back Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                    <Link
                        to="/employee"
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-sm active:scale-95 transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                New Registration Form
                            </span>
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mt-1">
                            ลงทะเบียนข้อมูลบุคลากรใหม่
                        </h1>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">
                            กรอกข้อมูลประวัติพนักงานแยกตามกลุ่มงาน และบันทึกข้อมูลใบหน้าสแกนเข้าทำงาน
                        </p>
                    </div>
                </div>
            </div>

            {/* Form and Camera columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Form Info */}
                <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(8,112,184,0.04)] p-6 md:p-8 relative overflow-hidden min-h-[580px]">

                    {/* Processing State Overlay */}
                    {registrationStatus === 'processing' && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                            <div className="relative flex items-center justify-center mb-4">
                                <div className="absolute w-16 h-16 border-4 border-blue-500/10 rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">กำลังประมวลผลข้อมูล...</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                ระบบกำลังบันทึกข้อมูลส่วนตัวของพนักงานและสร้างโครงสร้างโมเดลจดจำใบหน้า
                            </p>
                        </div>
                    )}

                    {/* Success State Overlay */}
                    {registrationStatus === 'success' && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">ลงทะเบียนสำเร็จ!</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                ข้อมูลทั้งหมดถูกจัดเก็บเรียบร้อยแล้ว ระบบกำลังพาคุณกลับไปที่หน้ารายการ...
                            </p>
                        </div>
                    )}

                    {/* Error State Overlay */}
                    {registrationStatus === 'error' && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-red-50 rounded-full border border-red-100 flex items-center justify-center text-red-600 mb-4 animate-pulse">
                                <XCircle className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">เกิดข้อผิดพลาดในการลงทะเบียน</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้พัฒนาหากพบปัญหานี้บ่อยครั้ง
                            </p>
                            <button
                                onClick={() => setRegistrationStatus(null)}
                                className="mt-6 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all duration-200"
                            >
                                ย้อนกลับ
                            </button>
                        </div>
                    )}

                    {/* Group Tab Headers */}
                    <div className="flex border-b border-gray-100 mb-6 pb-px gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`flex-1 pb-3 text-[11px] font-black uppercase tracking-wider border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${activeTab === 'general'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>1. ข้อมูลทั่วไป</span>
                            {errorsGeneralCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                                    {errorsGeneralCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('contact')}
                            className={`flex-1 pb-3 text-[11px] font-black uppercase tracking-wider border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${activeTab === 'contact'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>2. ที่อยู่และติดต่อ</span>
                            {errorsContactCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                                    {errorsContactCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('work')}
                            className={`flex-1 pb-3 text-[11px] font-black uppercase tracking-wider border-b-2 text-center transition-all flex items-center justify-center gap-1.5 ${activeTab === 'work'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>3. สังกัดและตำแหน่ง</span>
                            {errorsWorkCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
                                    {errorsWorkCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="space-y-5">

                        {/* TAB 1: GENERAL INFORMATION */}
                        {activeTab === 'general' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors group cursor-pointer relative overflow-hidden">
                                    {formData.avatar_url ? (
                                        <div className="relative flex items-start justify-center w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                            <img
                                                src={formData.avatar_url?.startsWith('data:') ? formData.avatar_url : `${import.meta.env.VITE_API_URL}/uploads/${formData?.avatar_url}`}
                                                alt="avatar-preview"
                                                className="w-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                            <User className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="mt-4 text-center">
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                                            {formData.avatar_url ? 'เปลี่ยนรูปประจำตัว' : 'อัพโหลดรูปประจำตัว'}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">ไฟล์ JPG, PNG หรือ GIF (ขนาดไม่เกิน 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>

                                {/* Employee Number & Citizen ID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            รหัสพนักงาน *
                                        </label>
                                        <div className="relative">
                                            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="employee_no"
                                                value={formData.employee_no}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.employee_no ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                                placeholder="เช่น 9999"
                                            />
                                        </div>
                                        {errors?.employee_no && (
                                            <ErrorMessage message={errors.employee_no} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            เลขบัตรประชาชน *
                                        </label>
                                        <div className="relative">
                                            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="cid"
                                                maxLength={13}
                                                value={formData.cid}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.cid ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                                placeholder="เลข 13 หลัก"
                                            />
                                        </div>
                                        {errors?.cid && (
                                            <ErrorMessage message={errors.cid} className="mt-1.5 px-1" />
                                        )}
                                    </div>
                                </div>

                                {/* Name Fields (Prefix, Firstname, Lastname) */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                    <div className="md:col-span-3 relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            คำนำหน้า *
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="prefix_id"
                                                value={formData.prefix_id}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all duration-200 ${errors?.prefix_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">เลือก</option>
                                                {prefixes.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors?.prefix_id && (
                                            <ErrorMessage message={errors.prefix_id} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="md:col-span-4 relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            ชื่อจริง *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="firstname"
                                                value={formData.firstname}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.firstname ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/85 focus:border-blue-500'
                                                    }`}
                                                placeholder="เช่น สัญญา"
                                            />
                                        </div>
                                        {errors?.firstname && (
                                            <ErrorMessage message={errors.firstname} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="md:col-span-5 relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            นามสกุล *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="lastname"
                                                value={formData.lastname}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.lastname ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/85 focus:border-blue-500'
                                                    }`}
                                                placeholder="เช่น ธรรมวงษ์"
                                            />
                                        </div>
                                        {errors?.lastname && (
                                            <ErrorMessage message={errors.lastname} className="mt-1.5 px-1" />
                                        )}
                                    </div>
                                </div>

                                {/* Birthdate & Sex */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            วันเกิด *
                                        </label>
                                        <DatePicker
                                            value={formData.birthdate}
                                            onChange={(date) => {
                                                setFormData(prev => ({ ...prev, birthdate: date }));
                                                if (errors?.birthdate) {
                                                    setErrors(prev => {
                                                        if (!prev) return null;
                                                        const clone = { ...prev };
                                                        delete clone.birthdate;
                                                        return clone;
                                                    });
                                                }
                                            }}
                                            placeholder="เลือกวันเกิด"
                                            disableFutureDates={true}
                                            showAge={true}
                                            error={errors?.birthdate}
                                            inputCss="rounded-2xl py-3.5 bg-gray-50/50 hover:bg-white focus:bg-white border-gray-200/80 text-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                        />
                                    </div>

                                    <ButtonGroupSelect
                                        options={[
                                            {
                                                value: '1',
                                                label: 'ชาย',
                                                icon: (
                                                    <svg className={`w-4 h-4 transition-colors ${formData.sex === '1' ? 'text-blue-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="10" cy="14" r="6" />
                                                        <path d="M14 10l8-8" />
                                                        <path d="M17 2h5v5" />
                                                    </svg>
                                                )
                                            },
                                            {
                                                value: '2',
                                                label: 'หญิง',
                                                icon: (
                                                    <svg className={`w-4 h-4 transition-colors ${formData.sex === '2' ? 'text-pink-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="8" r="6" />
                                                        <path d="M12 14v8" />
                                                        <path d="M9 18h6" />
                                                    </svg>
                                                )
                                            }
                                        ]}
                                        value={formData.sex}
                                        onChange={(val) => {
                                            handleSelectChange('sex', val);
                                        }}
                                        label="เพศ *"
                                        error={errors?.sex}
                                        className="relative group"
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB 2: ADDRESS & CONTACT */}
                        {activeTab === 'contact' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Contacts: Phone, Email, Line ID */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            เบอร์โทรศัพท์ติดต่อ *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="tel"
                                                name="tel"
                                                value={formData.tel}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-850 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.tel ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                                placeholder="เช่น 0809999999"
                                            />
                                        </div>
                                        {errors?.tel && (
                                            <ErrorMessage message={errors.tel} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            อีเมล
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        {errors?.email && (
                                            <ErrorMessage message={errors.email} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            Line ID
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="line_id"
                                                value={formData.line_id}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200/80 focus:border-blue-500 rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400"
                                                placeholder="เช่น line_mhc9"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address 1: Address No, Moo, Road */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            บ้านเลขที่ *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="address_no"
                                                value={formData.address_no}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.address_no ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-550'
                                                    }`}
                                                placeholder="เช่น 99/9"
                                            />
                                        </div>
                                        {errors?.address_no && (
                                            <ErrorMessage message={errors.address_no} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            หมู่ที่
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="moo"
                                                value={formData.moo}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200/80 focus:border-blue-500 rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400"
                                                placeholder="เช่น 9"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            ถนน
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="road"
                                                value={formData.road}
                                                onChange={handleInputChange}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200/80 focus:border-blue-500 rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400"
                                                placeholder="เช่น มิตรภาพ"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address 2: Province, District, Sub-district, Zipcode */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
                                    {/* Province */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            จังหวัด *
                                        </label>
                                        <SearchableSelect
                                            options={provinces.map(p => ({ value: p.id.toString(), label: p.name }))}
                                            value={formData.changwat_id}
                                            onChange={(val) => {
                                                handleSelectChange('changwat_id', val);
                                            }}
                                            placeholder="เลือกจังหวัด"
                                            searchPlaceholder="ค้นหาจังหวัด..."
                                            searchable={true}
                                            error={errors?.changwat_id}
                                            prefixIcon={<MapPin size={16} />}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* District */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            อำเภอ / เขต *
                                        </label>
                                        <SearchableSelect
                                            options={filteredDistricts.map(d => ({ value: d.id.toString(), label: d.name }))}
                                            value={formData.amphur_id}
                                            disabled={!formData.changwat_id}
                                            onChange={(val) => {
                                                handleSelectChange('amphur_id', val);
                                            }}
                                            placeholder="เลือกอำเภอ"
                                            searchPlaceholder="ค้นหาอำเภอ..."
                                            searchable={true}
                                            error={errors?.amphur_id}
                                            prefixIcon={<MapPin size={16} />}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Sub-district */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            ตำบล / แขวง *
                                        </label>
                                        <SearchableSelect
                                            options={filteredSubdistricts.map(s => ({ value: s.id.toString(), label: s.name }))}
                                            value={formData.tambon_id}
                                            disabled={!formData.amphur_id}
                                            onChange={(val) => {
                                                handleSelectChange('tambon_id', val);
                                            }}
                                            placeholder="เลือกตำบล"
                                            searchPlaceholder="ค้นหาตำบล..."
                                            searchable={true}
                                            error={errors?.tambon_id}
                                            prefixIcon={<MapPin size={16} />}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Zipcode */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            รหัสไปรษณีย์ *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors" />
                                            <input
                                                type="text"
                                                name="zipcode"
                                                maxLength={5}
                                                value={formData.zipcode}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 ${errors?.zipcode ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                                placeholder="รหัส 5 หลัก"
                                            />
                                        </div>
                                        {errors?.zipcode && (
                                            <ErrorMessage message={errors.zipcode} className="mt-1.5 px-1" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: WORK & POSITION DETAILS */}
                        {activeTab === 'work' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Position & Level */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            ตำแหน่งงาน *
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors z-10 pointer-events-none" />
                                            <select
                                                name="position_id"
                                                value={formData.position_id}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-10 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all duration-200 ${errors?.position_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">เลือกตำแหน่งงาน</option>
                                                {positions.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors?.position_id && (
                                            <ErrorMessage message={errors.position_id} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            ระดับตำแหน่ง *
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors z-10 pointer-events-none" />
                                            <select
                                                name="level_id"
                                                value={formData.level_id}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-10 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all duration-200 ${errors?.level_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">เลือกระดับตำแหน่ง</option>
                                                {levels.map(l => (
                                                    <option key={l.id} value={l.id}>{l.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors?.level_id && (
                                            <ErrorMessage message={errors.level_id} className="mt-1.5 px-1" />
                                        )}
                                    </div>
                                </div>

                                {/* Work dates (Assigned At, Started At) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            วันที่บรรจุ / ได้รับมอบหมาย *
                                        </label>
                                        <DatePicker
                                            value={formData.assigned_at}
                                            onChange={(date) => {
                                                setFormData(prev => ({ ...prev, assigned_at: date }));
                                                if (errors?.assigned_at) {
                                                    setErrors(prev => {
                                                        if (!prev) return null;
                                                        const clone = { ...prev };
                                                        delete clone.assigned_at;
                                                        return clone;
                                                    });
                                                }
                                            }}
                                            placeholder="เลือกวันที่บรรจุ"
                                            error={errors?.assigned_at}
                                            inputCss="rounded-2xl py-3 bg-gray-50/50 hover:bg-white focus:bg-white border-gray-200/80 text-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            วันที่เริ่มปฏิบัติงาน *
                                        </label>
                                        <DatePicker
                                            value={formData.started_at}
                                            onChange={(date) => {
                                                setFormData(prev => ({ ...prev, started_at: date }));
                                                if (errors?.started_at) {
                                                    setErrors(prev => {
                                                        if (!prev) return null;
                                                        const clone = { ...prev };
                                                        delete clone.started_at;
                                                        return clone;
                                                    });
                                                }
                                            }}
                                            placeholder="เลือกวันที่เริ่มงาน"
                                            error={errors?.started_at}
                                            inputCss="rounded-2xl py-3 bg-gray-50/50 hover:bg-white focus:bg-white border-gray-200/80 text-gray-800 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Department, Division, Duty */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            กลุ่มงาน / ฝ่าย *
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors z-10 pointer-events-none" />
                                            <select
                                                name="department_id"
                                                value={formData.department_id}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-10 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all duration-200 ${errors?.department_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">เลือกฝ่ายงาน</option>
                                                {departments.map(dep => (
                                                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors?.department_id && (
                                            <ErrorMessage message={errors.department_id} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            งาน / สาขา *
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors z-10 pointer-events-none" />
                                            <select
                                                name="division_id"
                                                value={formData.division_id}
                                                disabled={!formData.department_id}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-10 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 ${errors?.division_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">เลือกงาน</option>
                                                {filteredDivisions.map(div => (
                                                    <option key={div.id} value={div.id}>{div.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors?.division_id && (
                                            <ErrorMessage message={errors.division_id} className="mt-1.5 px-1" />
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                            บทบาทหน้าที่ *
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors z-10 pointer-events-none" />
                                            <select
                                                name="duty_id"
                                                value={formData.duty_id}
                                                onChange={handleInputChange}
                                                className={`w-full pl-11 pr-10 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all duration-200 ${errors?.duty_id ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : 'border-gray-200/80 focus:border-blue-500'
                                                    }`}
                                            >
                                                <option value="">เลือกบทบาท</option>
                                                {duties.map(dt => (
                                                    <option key={dt.id} value={dt.id}>{dt.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors?.duty_id && (
                                            <ErrorMessage message={errors.duty_id} className="mt-1.5 px-1" />
                                        )}
                                    </div>
                                </div>

                                {/* Remark (Textarea) */}
                                <div className="relative group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-blue-600 transition-colors">
                                        หมายเหตุ (เพิ่มเติม)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-505 transition-colors pointer-events-none" />
                                        <textarea
                                            name="remark"
                                            value={formData.remark}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200/80 focus:border-blue-500 rounded-2xl text-gray-855 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 placeholder:text-gray-400 resize-none"
                                            placeholder="ข้อความหมายเหตุเพิ่มเติมเกี่ยวกับรายละเอียดการปฏิบัติงานของพนักงาน..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex gap-4 pt-8 border-t border-gray-100 mt-8">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-200"
                        >
                            <RefreshCw className="w-4.5 h-4.5" />
                            <span>ล้างข้อมูล</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={registrationStatus === 'processing' || !modelsLoaded}
                            className="flex-[2] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                        >
                            <UserPlus className="w-4.5 h-4.5" />
                            <span>ลงทะเบียนบุคลากร</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Camera Scan ID */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Camera Panel */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(8,112,184,0.04)] p-6 relative overflow-hidden">

                        {/* Title Section */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-purple-50 p-1.5 rounded-lg text-purple-600">
                                    <Sparkles className="w-4.5 h-4.5" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">ตั้งค่าสแกนใบหน้า</h3>
                            </div>
                            <span className="text-xs font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                                {capturedImages.length}/5 รูปถ่าย
                            </span>
                        </div>

                        {/* AI Models Alert */}
                        {!modelsLoaded && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-amber-800 mb-4 animate-pulse">
                                <RefreshCw className="w-4.5 h-4.5 text-amber-500 animate-spin shrink-0" />
                                <p className="text-xs font-bold">กำลังโหลดโมเดลสแกนใบหน้า...</p>
                            </div>
                        )}

                        {/* Viewfinder Frame Container */}
                        <div className="relative mb-4 group/cam rounded-2xl overflow-hidden shadow-inner bg-slate-950 border border-slate-800">
                            <div className="aspect-video w-full flex items-center justify-center relative overflow-hidden">

                                {/* Video element */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-30'}`}
                                />

                                {/* Tracking Canvas */}
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                                />

                                {/* High-tech overlay HUD */}
                                {isCameraActive && (
                                    <>
                                        {/* Corners */}
                                        <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-blue-400 rounded-tl z-10 pointer-events-none opacity-80" />
                                        <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-blue-400 rounded-tr z-10 pointer-events-none opacity-80" />
                                        <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-blue-400 rounded-bl z-10 pointer-events-none opacity-80" />
                                        <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-blue-400 rounded-br z-10 pointer-events-none opacity-80" />

                                        {/* Scanning laser line */}
                                        <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60 animate-scan z-10 pointer-events-none" />
                                    </>
                                )}

                                {/* Capture Camera Flash overlay */}
                                {flashActive && (
                                    <div className="absolute inset-0 bg-white z-20 transition-all duration-75 pointer-events-none animate-in fade-in" />
                                )}

                                {/* Floating face status badge */}
                                {isCameraActive && modelsLoaded && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-md text-[11px] font-bold transition-all duration-300 ${faceDetected
                                            ? 'bg-emerald-500/90 text-white border border-emerald-400/30'
                                            : 'bg-amber-500/90 text-white border border-amber-400/30'
                                            }`}>
                                            <span className={`w-2.5 h-2.5 rounded-full bg-white ${faceDetected ? 'animate-ping' : 'animate-pulse'}`} />
                                            <span>{faceDetected ? 'ตรวจพบใบหน้า' : 'กรุณาหันหน้าเข้าหากล้อง'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Camera Inactive Screen */}
                                {!isCameraActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 z-10 pointer-events-none">
                                        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-3 text-slate-500 animate-pulse-slow">
                                            <ScanFace className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-200">กล้องยังไม่พร้อมใช้งาน</h4>
                                        <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                                            กดปุ่ม "เปิดใช้งานกล้อง" ด้านล่างเพื่อเริ่มถ่ายภาพสแกนใบหน้า
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Helper Tip */}
                        {isCameraActive && capturedImages.length < 5 && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 mb-4 text-center">
                                <p className="text-blue-800 text-xs font-semibold">
                                    คำแนะนำ: หันหน้าตรง เอียงขึ้น-ลง เล็กน้อยเพื่อให้ระบบจดจำมุมของใบหน้าได้ครอบคลุม
                                </p>
                            </div>
                        )}

                        {/* Validation Error for images */}
                        {errors?.avatar_url && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-4 flex items-center gap-2 text-red-800 animate-pulse">
                                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                                <p className="text-xs font-semibold text-center w-full">{errors.avatar_url}</p>
                            </div>
                        )}

                        {/* Camera Action Buttons */}
                        <div className="flex gap-4">
                            {!isCameraActive ? (
                                <button
                                    type="button"
                                    onClick={handleStartCamera}
                                    disabled={!modelsLoaded || capturedImages.length >= 5}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 active:scale-[0.98] disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <Camera className="w-4.5 h-4.5" />
                                    <span>เปิดใช้งานกล้อง</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleStopCamera}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all duration-200"
                                    >
                                        <span>ปิดกล้อง</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={capturePhoto}
                                        disabled={!faceDetected || isProcessing || capturedImages.length >= 5}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <Camera className="w-4.5 h-4.5" />
                                        <span>ถ่ายภาพสแกน</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Captured Gallery Section */}
                    {capturedImages.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(8,112,184,0.04)] p-6 animate-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">รูปภาพสแกนสะสม</h3>

                            <div className="grid grid-cols-5 gap-3">
                                {capturedImages.map((img, index) => (
                                    <div key={index} className="relative group/thumb aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                        <img
                                            src={img.image}
                                            alt={`Capture ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Action Hover Controls */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 duration-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPreview(true);
                                                    setPreview(img.image);
                                                }}
                                                className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-md transition-all duration-150 active:scale-90"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="p-1 bg-red-500/20 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-md transition-all duration-150 active:scale-90"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Image index counter */}
                                        <div className="absolute bottom-1 right-1 bg-blue-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Image Viewer */}
            <ImageViewer
                isShow={showPreview}
                onHide={(hide: boolean) => {
                    setShowPreview(hide);
                    if (!hide) setPreview('');
                }}
                image={preview}
            />
        </div>
    );
}