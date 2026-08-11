import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';
import api from '../../api';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    ScanFace,
    Map,
    ArrowLeft
} from 'lucide-react';

export default function EmployeeDetail() {
    const { id } = useParams<{ id: string }>();
    const { user, oauthToken } = useAuth();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const hasFace = !!employee?.face_descriptor;
    const isAdmin = user?.permissions?.[0]?.role_id === 1;

    const [locationData, setLocationData] = useState<{ tambon: any; amphur: any; changwat: any } | null>(null);

    // Fetch employee data
    useEffect(() => {
        const fetchEmployee = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/api/employees/${id}`);
                if (response.data) {
                    setEmployee(response.data);
                }
            } catch (error) {
                console.error("Error fetching employee:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    // Fetch location data
    useEffect(() => {
        const fetchLocation = async () => {
            const tambonId = employee?.tambon_id;
            if (!tambonId) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/locations/${tambonId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${oauthToken}`,
                    },
                });
                const data = await response.json();
                setLocationData(data);
            } catch (error) {
                console.error('Failed to fetch location data:', error);
            }
        };

        if (employee) {
            fetchLocation();
        }
    }, [employee, oauthToken]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <User className="w-12 h-12 mb-2 text-gray-300" />
                <p>ไม่พบข้อมูลพนักงาน</p>
            </div>
        );
    }

    // Format employee ID
    const empIdStr = employee?.id
        ? `EMP-${String(employee.id).padStart(4, '0')}`
        : 'N/A';

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                    <Link to="/employee" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </Link>
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-white shrink-0">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                            รายละเอียดบุคลากร
                        </h1>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">
                            ข้อมูลส่วนบุคคลและการทำงานของพนักงาน
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card - Quick Details */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 flex flex-col items-center text-center">
                    {/* Avatar with Status Ring */}
                    <div className="relative group">
                        <div className={`p-1.5 rounded-full border-2 ${hasFace ? 'border-emerald-500/80' : 'border-amber-500/80'} transition-all duration-300`}>
                            {employee?.avatar_url ? (
                                <EmployeeAvatar
                                    image={`${import.meta.env.VITE_API_URL}/uploads/${employee.avatar_url}`}
                                    alt={`${employee.firstname} ${employee.lastname}`}
                                    width="110px"
                                    height="110px"
                                />
                            ) : (
                                <div className="w-[110px] h-[110px] bg-indigo-50/50 rounded-full flex items-center justify-center text-indigo-500">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        {/* Status Badge Pulse */}
                        <div className="absolute bottom-1 right-2">
                            <span className="relative flex h-3.5 w-3.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasFace ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white ${hasFace ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            </span>
                        </div>
                    </div>

                    {/* Name & Title */}
                    <h2 className="text-xl font-bold mt-4 text-gray-800">
                        {`${employee.prefix?.name || ''}${employee.firstname} ${employee.lastname}`}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                        {employee?.position?.name || 'ไม่ได้ระบุตำแหน่ง'}
                    </p>

                    {/* Meta Info Tags */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        <span className="px-3 py-1 bg-gray-50 border border-gray-150 text-[10px] font-bold text-gray-500 rounded-lg">
                            {empIdStr}
                        </span>
                        <span className={`px-3 py-1 border text-[10px] font-bold rounded-lg ${hasFace
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-amber-50 border-amber-100 text-amber-600'
                            }`}>
                            {hasFace ? 'ลงทะเบียนสแกนหน้าแล้ว' : 'ยังไม่สแกนใบหน้า'}
                        </span>
                    </div>

                    {/* Action Links */}
                    {isAdmin && (
                        <div className="w-full mt-6 space-y-2">
                            <Link
                                to={`/employee/${employee.id}/face`}
                                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                            >
                                <ScanFace className="w-4 h-4" />
                                <span>จัดการรูปใบหน้า</span>
                            </Link>
                            <Link
                                to={`/employee/${employee.id}/edit`}
                                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>แก้ไขข้อมูล</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Card - Detail Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Information Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-indigo-500" />
                            <span>ข้อมูลทั่วไป</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-700">
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">ชื่อ-นามสกุล</span>
                                <span className="font-bold text-gray-800">
                                    {`${employee.prefix?.name || ''}${employee.firstname} ${employee.lastname}`}
                                </span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">อีเมลติดต่อ</span>
                                <span className="font-bold text-gray-800 flex items-center gap-1.5 truncate">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    {employee?.email || 'ไม่ได้ระบุ'}
                                </span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">รหัสประจำตัวบุคลากร</span>
                                <span className="font-bold text-gray-800">{empIdStr}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">เบอร์โทรศัพท์ติดต่อ</span>
                                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    {employee?.tel || 'ไม่ได้ระบุ'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Info & Work details */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Briefcase className="w-4 h-4 text-indigo-500" />
                            <span>ตำแหน่งและการปฏิบัติงาน</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-700">
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">ตำแหน่งงาน</span>
                                <span className="font-bold text-gray-800">{employee?.position?.name || 'ไม่ได้ระบุ'}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">ระดับการปฏิบัติงาน</span>
                                <span className="font-bold text-gray-800">{employee?.level?.name || 'ไม่ได้ระบุ'}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">ฝ่าย/กลุ่มงาน</span>
                                <span className="font-bold text-gray-800">{employee?.department?.name || 'ไม่ได้ระบุ'}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">งาน/สาขา</span>
                                <span className="font-bold text-gray-800">{employee?.division?.name || 'ไม่ได้ระบุ'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Address Information Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span>ข้อมูลที่อยู่ที่ติดต่อได้</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-700">
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">บ้านเลขที่ / ถนน</span>
                                <span className="font-bold text-gray-800">{employee?.address_no || 'ไม่ได้ระบุ'}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">ตำบล / แขวง</span>
                                <span className="font-bold text-gray-800">{locationData?.tambon && locationData?.tambon.name || 'ไม่ได้ระบุ'}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">อำเภอ / เขต</span>
                                <span className="font-bold text-gray-800">{locationData?.amphur && locationData?.amphur.name || 'ไม่ได้ระบุ'}</span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-semibold block">จังหวัด</span>
                                <span className="font-bold text-gray-800 flex items-center gap-1">
                                    <Map className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    {locationData?.changwat && locationData?.changwat.name || 'ไม่ได้ระบุ'}
                                </span>
                            </div>
                            <div className="space-y-1 bg-gray-50/40 p-3 rounded-2xl border border-gray-100 md:col-span-2">
                                <span className="text-gray-400 font-semibold block">รหัสไปรษณีย์</span>
                                <span className="font-bold text-gray-800">{employee?.zipcode || 'ไม่ได้ระบุ'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
