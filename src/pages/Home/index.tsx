import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    House,
    Users,
    UserCheck,
    UserX,
    ScanFace,
    ClipboardList,
    UsersRound,
    Clock,
    ChevronRight,
    Activity,
    UserMinus,
    Briefcase
} from 'lucide-react';
import moment from 'moment';
import api from '../../api';
import HeaderIcon from '../../components/ui/HeaderIcon';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';
import { type Employee } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';

export default function Home() {
    const { oauthToken } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [duties, setDuties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState<string>(moment().format('YYYY-MM-DD'));

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch active employees
                const empRes = await api.get('/api/employees');
                const activeEmployees = (empRes.data || []).filter((e: Employee) => e.status === 1);
                setEmployees(activeEmployees);

                // Fetch today's attendances
                const attRes = await api.get(`/api/attendances/check-time/${currentDate}/daily`);
                setAttendances(attRes.data.daily || []);

                // Fetch leaves
                const leavesRes = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/leaves?sdate=${currentDate}&edate=${currentDate}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${oauthToken}`
                    },
                });
                if (leavesRes.ok) {
                    const leavesData = await leavesRes.json();
                    setLeaves(leavesData || []);
                }

                // Fetch official duties
                const dutiesRes = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/events?sdate=${currentDate}&edate=${currentDate}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${oauthToken}`
                    },
                });
                if (dutiesRes.ok) {
                    const dutiesData = await dutiesRes.json();
                    let _employees: any = [];
                    if (dutiesData && Array.isArray(dutiesData)) {
                        dutiesData.forEach((event: any) => {
                            const isDuplicate = _employees.some((emp: any) => emp.EmId === event.employee?.EmId);
                            if (!isDuplicate) {
                                _employees.push(event.employee);
                            }
                        });
                        setDuties(_employees);
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (oauthToken) {
            fetchDashboardData();
        }
    }, [oauthToken, currentDate]);

    // Calculate Dashboard Stats
    const stats = useMemo(() => {
        const total = employees.length;

        // Group attendances by employee to count unique check-ins today
        const checkedInIds = new Set();
        attendances && attendances.forEach(att => {
            const empId = att.employee?.id || att.employee?.EmId || att.employee?.employee_no;
            if (empId) checkedInIds.add(empId);
        });

        const present = checkedInIds.size;
        const absent = Math.max(0, total - present);

        return {
            total,
            present,
            absent,
            leave: leaves?.length || 0,
            officialDuty: duties?.length || 0
        };
    }, [employees, attendances, leaves, duties]);

    // Extract recent 5 check-ins (filtering by 'เข้า' to show arrivals)
    const recentCheckIns = useMemo(() => {
        return [...attendances]
            .filter(a => a.CheTmType === 'เข้า')
            .sort((a, b) => new Date(b.CheTmDate).getTime() - new Date(a.CheTmDate).getTime())
            .slice(0, 5);
    }, [attendances]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md shadow-blue-500/20">
                        <HeaderIcon Icon={House} cssClass="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            หน้าหลัก (Dashboard)
                        </h1>
                        <p className="text-sm text-gray-500">ระบบลงเวลาปฏิบัติงานและจัดการบุคลากร MHC9</p>
                    </div>
                </div>

                {/* Date Display */}
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium tracking-wider">วันที่ปัจจุบัน</p>
                        <p className="text-sm font-bold text-gray-800">
                            {new Date().toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Area */}
            <div className="space-y-4">
                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <UsersRound className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-blue-100 font-medium text-sm mb-1 uppercase tracking-wider">บุคลากรทั้งหมด</p>
                            <h3 className="text-4xl font-black">{loading ? '...' : stats.total}</h3>
                            <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" /> <span>พนักงานที่มีสถานะ Active ในระบบ</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <UserCheck className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">ลงเวลาแล้ววันนี้</p>
                            <h3 className="text-4xl font-black">{loading ? '...' : stats.present}</h3>
                            <p className="text-xs text-emerald-200 mt-2 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" /> <span>บุคลากรที่เข้างานเรียบร้อยแล้ว</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <UserX className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-rose-100 font-medium text-sm mb-1 uppercase tracking-wider">ยังไม่ลงเวลา</p>
                            <h3 className="text-4xl font-black">{loading ? '...' : stats.absent}</h3>
                            <p className="text-xs text-rose-200 mt-2 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" /> <span>พนักงานที่ยังไม่สแกนเข้างาน</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Second Row Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
                    <Link to="/leave" className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <UserMinus className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 font-medium text-sm mb-1 uppercase tracking-wider">ลางาน</p>
                                <h3 className="text-3xl font-black">{loading ? '...' : stats.leave}</h3>
                                <p className="text-xs text-amber-200 mt-2 flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5" /> <span>พนักงานที่มีสถานะลางาน</span>
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <UserMinus className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Link>

                    <Link to="/official-duty" className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 block">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Briefcase className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 font-medium text-sm mb-1 uppercase tracking-wider">ไปราชการ</p>
                                <h3 className="text-3xl font-black">{loading ? '...' : stats.officialDuty}</h3>
                                <p className="text-xs text-purple-200 mt-2 flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5" /> <span>พนักงานที่มีสถานะไปราชการ</span>
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">เมนูลัด (Quick Actions)</h2>
                            <p className="text-xs text-gray-500">เข้าถึงฟังก์ชันที่ใช้งานบ่อยอย่างรวดเร็ว</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
                        <Link
                            to="/attendance/check-in"
                            className="group p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-start gap-4"
                        >
                            <div className="bg-indigo-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-indigo-200">
                                <ScanFace className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-950 group-hover:text-indigo-700 transition-colors">ลงเวลาปฏิบัติงาน</h3>
                                <p className="text-xs text-indigo-600/70 mt-1 line-clamp-2">เปิดหน้าสแกนใบหน้าสำหรับเข้า-ออกงาน</p>
                            </div>
                        </Link>

                        <Link
                            to="/employee/register"
                            className="group p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-start gap-4"
                        >
                            <div className="bg-emerald-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-emerald-200">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">ลงทะเบียนใบหน้า</h3>
                                <p className="text-xs text-emerald-600/70 mt-1 line-clamp-2">เพิ่มข้อมูลพนักงานใหม่และสแกนใบหน้า</p>
                            </div>
                        </Link>

                        <Link
                            to="/attendance"
                            className="group p-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-start gap-4"
                        >
                            <div className="bg-blue-500 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-blue-200">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-950 group-hover:text-blue-700 transition-colors">ตรวจสอบเวลาเข้างาน</h3>
                                <p className="text-xs text-blue-600/70 mt-1 line-clamp-2">ดูรายงานการลงเวลาประจำวันของทุกคน</p>
                            </div>
                        </Link>

                        <Link
                            to="/employee"
                            className="group p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/50 to-gray-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-start gap-4"
                        >
                            <div className="bg-slate-700 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-sm shadow-slate-200">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">จัดการบุคลากร</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">ดูรายชื่อ ค้นหา หรือแก้ไขข้อมูลพนักงาน</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">เข้างานล่าสุด</h2>
                            <p className="text-xs text-gray-500">5 รายการล่าสุดของวันนี้</p>
                        </div>
                        <Link to="/attendance" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentCheckIns.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {recentCheckIns.map((att, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group">
                                        <div className="shrink-0 p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                                            <EmployeeAvatar
                                                image={`https://mhc9dmh.com/DATA/Photo/${att.employee.EmImg}`}
                                                alt={att.employee?.EmName || att.employee?.firstname || 'Unknown'}
                                                width="40px"
                                                height="40px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                                                {att.employee?.EmName || att.employee?.firstname || 'ไม่ทราบชื่อ'}
                                            </p>
                                            <p className="text-[11px] text-gray-500 truncate">
                                                {att.employee?.PositionName || att.employee?.position?.name || 'พนักงาน'}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                                <Clock className="w-3 h-3" />
                                                {moment(att.CheTmDate).format('HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 h-full min-h-[200px]">
                                <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-300">
                                    <ScanFace className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-semibold text-gray-700">ยังไม่มีใครเข้างาน</p>
                                <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                                    ยังไม่มีข้อมูลการสแกนใบหน้าเข้างานในวันนี้
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}