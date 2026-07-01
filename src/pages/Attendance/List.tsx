import { useEffect, useState, useMemo, useCallback } from 'react'
import { CalendarClock, Search, CheckCircle2, AlertCircle, Users, FileQuestion, Grid, List as ListIcon, UserMinus, Briefcase, User } from 'lucide-react';
import moment from 'moment';
import api from '../../api';
import { type AttendanceFilters } from '../../lib/types';
import { STARTING_DATE } from '../../lib/constants';
import FliteringInputs from './FliteringInputs';
import { SummaryCard } from '../../components/ui/Cards/SummaryCard';
import { useAuth } from '../../hooks/useAuth';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';
import { Pagination } from '../../components/ui/Pagination';

const AttendanceList = () => {
    const { oauthToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [duties, setDuties] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem("attendance_view_mode");
        return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, currentDate]);

    const imgUrl = moment(STARTING_DATE).diff(moment(currentDate), "day") > 1
        ? 'https://mhc9dmh.com/DATA/PhotoCheckTime'
        : `${import.meta.env.VITE_API_URL}/uploads`;

    useEffect(() => {
        getAttendances(currentDate)
        getLeaves(currentDate)
        getDuties(currentDate)
    }, [currentDate]);

    const getAttendances = async (date: string) => {
        try {
            setIsLoading(true)
            const response = await api.get(`/api/attendances/check-time/${date}/daily`);
            setAttendances(response.data.daily || []);
        } catch (error) {
            console.error("Error fetching attendances:", error);
            setAttendances([]);
        } finally {
            setIsLoading(false)
        }
    }

    const getLeaves = useCallback(async (date: string) => {
        try {
            setIsLoading(true)
            const response = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/leaves?sdate=${date}&edate=${date}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${oauthToken}`,
                },
            });

            const data = await response.json();
            console.log(data)
            setLeaves(data || [])
        } catch (error) {
            console.error("Error fetching attendances:", error);
        } finally {
            setIsLoading(false)
        }
    }, [currentDate]);

    const getDuties = useCallback(async (date: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/events?sdate=${date}&edate=${date}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${oauthToken}`
                },
            })

            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }

            const data = await response.json()
            if (data) {
                let _employees: any = [];

                /** Deduplicating data */
                data.forEach((event: any) => {
                    const isDuplicate = _employees.some((emp: any) => emp.EmId === event.employee?.EmId);

                    if (!isDuplicate) {
                        _employees.push(event.employee);
                    }
                });

                const _trips = _employees.map((employee: any) => {
                    const _filtered = data.filter((d: any) => employee.EmId === d.employee?.EmId);
                    /** Listing employee's events */
                    const events = _filtered.map((e: any) => `${e.OTName} ณ ${e.OTLocation}`).join(', ');

                    return {
                        id: employee.EmId,
                        name: `${employee.EmPerfix}${employee.EmName}`,
                        position: { id: parseInt(employee.EmPosition), name: employee.position?.PosName },
                        department: { id: parseInt(employee.EmSession), name: employee.department?.SeName },
                        events
                    };
                });

                setDuties(_trips)
            }
        } catch (error) {
            console.error("Error fetching attendances:", error);
        }
    }, [currentDate])

    // Group and combine attendances per employee
    const combinedAttendances = useMemo(() => {
        const map = new Map<string, any>();

        attendances.forEach((att: any) => {
            const empId = att.employee?.id || att.employee?.EmID || att.employee?.employee_no || att.employee?.EmName || `unknown-${att.CheTmID}`;

            if (!map.has(empId)) {
                map.set(empId, {
                    id: empId,
                    employee: att.employee,
                    checkIn: null,
                    checkOut: null
                });
            }

            const group = map.get(empId);

            if (att.CheTmType === 'เข้า') {
                if (!group.checkIn || moment(att.CheTmDate).isBefore(moment(group.checkIn.CheTmDate))) {
                    group.checkIn = att;
                }
            } else if (att.CheTmType === 'ออก') {
                if (!group.checkOut || moment(att.CheTmDate).isAfter(moment(group.checkOut.CheTmDate))) {
                    group.checkOut = att;
                }
            }
        });

        let result = Array.from(map.values()).filter(group => group.checkIn || group.checkOut);

        if (searchTerm) {
            result = result.filter(group => {
                const name = group.employee?.EmName || 'Unknown Employee';
                return name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        return result.sort((a, b) => {
            const timeA = a.checkIn ? moment(a.checkIn.CheTmDate).valueOf() : (a.checkOut ? moment(a.checkOut.CheTmDate).valueOf() : Number.MAX_SAFE_INTEGER);
            const timeB = b.checkIn ? moment(b.checkIn.CheTmDate).valueOf() : (b.checkOut ? moment(b.checkOut.CheTmDate).valueOf() : Number.MAX_SAFE_INTEGER);
            return timeA - timeB; // Sort ascending: early time first
        });
    }, [attendances, searchTerm]);

    // Calculate Stats for the current day
    const stats = useMemo(() => {
        const checkIns = combinedAttendances.filter(group => group.checkIn);
        const total = checkIns.length;

        let onTime = 0;
        let late = 0;

        checkIns.forEach(group => {
            const timeStr = moment(group.checkIn.CheTmDate).format('HH:mm:ss');
            if (timeStr <= '08:30:00') {
                onTime++;
            } else {
                late++;
            }
        });

        return { total, onTime, late, leave: leaves?.length, officialDuty: duties?.length };
    }, [combinedAttendances, leaves, duties]);

    const paginatedAttendances = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return combinedAttendances.slice(start, end);
    }, [combinedAttendances, currentPage]);

    const totalPages = Math.ceil(combinedAttendances.length / itemsPerPage);

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem("attendance_view_mode", mode);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md shadow-blue-500/20">
                        <CalendarClock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">รายการลงเวลา</h1>
                        <p className="text-sm text-gray-500">ประวัติและข้อมูลการลงเวลาทำงานรายวัน</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Overview Cards */}
            <div className="flex flex-col gap-4">
                {/* Main Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Checkins */}
                    <SummaryCard
                        title="ลงเวลาทั้งหมด"
                        value={isLoading ? '...' : stats.total}
                        subtitle="ยอดผู้เข้าปฏิบัติงาน"
                        icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" />}
                        theme="indigo"
                    />

                    {/* On Time */}
                    <SummaryCard
                        title="ตรงเวลา"
                        value={isLoading ? '...' : stats.onTime}
                        subtitle="ก่อน 08:30 น."
                        icon={<CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />}
                        theme="emerald"
                    />

                    {/* Late */}
                    <SummaryCard
                        title="มาสาย"
                        value={isLoading ? '...' : stats.late}
                        subtitle="หลัง 08:30 น."
                        icon={<AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
                        theme="rose"
                    />
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Leave */}
                    <SummaryCard
                        title="ลางาน"
                        value={isLoading ? '...' : stats.leave}
                        subtitle="จำนวนพนักงานที่ลา"
                        icon={<UserMinus className="w-6 h-6 sm:w-8 sm:h-8" />}
                        theme="amber"
                        to={`/leave?currentDate=${currentDate}`}
                    />

                    {/* Official Duty */}
                    <SummaryCard
                        title="ไปราชการ"
                        value={isLoading ? '...' : stats.officialDuty}
                        subtitle="พนักงานไปราชการ"
                        icon={<Briefcase className="w-6 h-6 sm:w-8 sm:h-8" />}
                        theme="purple"
                        to={`/official-duty?currentDate=${currentDate}`}
                    />
                </div>
            </div>

            {/* Unified Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อพนักงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-800"
                    />
                </div>

                {/* Filters & View toggler */}
                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
                    {/* Date Filter Input Component */}
                    <FliteringInputs
                        initialValues={{ toDay: currentDate }}
                        onFilter={(filters: AttendanceFilters) => {
                            setCurrentDate(filters.toDay);
                        }}
                    />

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    {/* Grid/List Toggle */}
                    <div className="flex bg-gray-50 p-1 border border-gray-200 rounded-xl">
                        <button
                            onClick={() => toggleViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="แสดงแบบการ์ด"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => toggleViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="แสดงแบบรายการ"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content area */}
            {isLoading ? (
                /* Skeleton Loader */
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center animate-pulse">
                                <div className="w-full h-40 bg-gray-100 rounded-xl mb-4"></div>
                                <div className="w-28 h-5 bg-gray-200 rounded-md mb-2"></div>
                                <div className="w-20 h-4 bg-gray-100 rounded-md mb-4"></div>
                                <div className="w-full flex gap-3 mt-auto">
                                    <div className="h-8 bg-gray-100 rounded-full flex-1"></div>
                                    <div className="h-8 bg-gray-100 rounded-full flex-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100 shadow-sm">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="w-40 h-5 bg-gray-200 rounded-md"></div>
                                    <div className="w-28 h-4 bg-gray-100 rounded-md"></div>
                                </div>
                                <div className="w-24 h-8 bg-gray-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                )
            ) : combinedAttendances.length === 0 ? (
                /* Empty logs list */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
                    <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                        <FileQuestion className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">ไม่พบข้อมูลการลงเวลา</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                        {searchTerm
                            ? "ไม่พบรายชื่อพนักงานที่ระบุสำหรับวันดังกล่าว กรุณาลองใช้ชื่ออื่นในการค้นหา"
                            : "ในวันที่เลือกยังไม่มีข้อมูลพนักงานสแกนเข้าปฏิบัติงาน"}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View Layout */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedAttendances.map((group: any) => {
                        const checkIn = group.checkIn;
                        const checkOut = group.checkOut;

                        const checkInTime = checkIn ? moment(checkIn.CheTmDate).format('HH:mm:ss') : '-';
                        const checkOutTime = checkOut ? moment(checkOut.CheTmDate).format('HH:mm:ss') : '-';
                        const isLate = checkIn && moment(checkIn.CheTmDate).format('HH:mm:ss') > '08:30:00';

                        // Use checkOut photo if available, otherwise checkIn photo
                        const mainAtt = checkOut || checkIn;

                        return (
                            <div
                                key={group.id}
                                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-150 p-4 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                            >
                                {/* Photo frame with Zoom effect */}
                                <div className="relative overflow-hidden rounded-xl aspect-[4/3] w-full border border-gray-50 bg-gray-50 mb-4 group/photo">
                                    {group.employee?.avatar_url ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/${group.employee.avatar_url}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                            alt="employee-avatar"
                                        />
                                    ) : (
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(group.employee?.EmName || 'Unknown')}&background=${group.employee?.EmColor || '4f46e5'}&color=fff&size=256`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                            alt="default-avatar"
                                        />
                                    )}
                                </div>

                                {/* Employee Name */}
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {group.employee ? group.employee?.EmName : 'Unknown Employee'}
                                </h3>

                                {/* DateTime details */}
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-gray-500">เวลาเข้า:</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{checkInTime}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                            <span className="text-gray-500">เวลาออก:</span>
                                        </div>
                                        {checkOut ? (
                                            <span className="font-bold text-gray-800">{checkOutTime}</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-600 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                                <AlertCircle className="w-3 h-3" /> ยังไม่ลงเวลาออก
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Late/On-Time capsule Badge */}
                                {checkIn && (
                                    <div className="mt-4">
                                        {isLate ? (
                                            <span className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100/60">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                มาสาย (เข้า {checkInTime})
                                            </span>
                                        ) : (
                                            <span className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                ตรงเวลา (เข้า {checkInTime})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View Layout */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {paginatedAttendances.map((group: any) => {
                        const checkIn = group.checkIn;
                        const checkOut = group.checkOut;

                        const checkInTime = checkIn ? moment(checkIn.CheTmDate).format('HH:mm:ss') : '-';
                        const checkOutTime = checkOut ? moment(checkOut.CheTmDate).format('HH:mm:ss') : '-';
                        const isLate = checkIn && moment(checkIn.CheTmDate).format('HH:mm:ss') > '08:30:00';

                        const mainAtt = checkOut || checkIn;

                        return (
                            <div key={group.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Photo frame with Zoom effect */}
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="relative">
                                            <div className={`p-0.5 rounded-full ring-2 ${isLate ? 'ring-rose-300' : 'ring-emerald-300'}`}>
                                                {group.employee.EmImg ? (
                                                    <EmployeeAvatar
                                                        image={`https://mhc9dmh.com/DATA/Photo/${group.employee.EmImg}`}
                                                        alt={group.employee.name}
                                                        width="52px"
                                                        height="52px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: group.employee.avatarColor }}>
                                                        <User className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${isLate ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                        </div>
                                    </div>

                                    {/* Name and Log Info */}
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-gray-900 truncate">
                                            {group.employee ? group.employee?.EmName : 'Unknown Employee'}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-gray-500">เข้า:</span>
                                                <span className="font-semibold text-gray-700">{checkInTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                <span className="text-gray-500">ออก:</span>
                                                {checkOut ? (
                                                    <span className="font-semibold text-gray-700">{checkOutTime}</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 text-[11px] font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                        <AlertCircle className="w-3 h-3" /> ยังไม่ลงเวลาออก
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                    {checkIn && (
                                        isLate ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100/60">
                                                <AlertCircle className="w-3 h-3" />
                                                มาสาย
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                                                <CheckCircle2 className="w-3 h-3" />
                                                ตรงเวลา
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Component */}
            {!isLoading && combinedAttendances.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={combinedAttendances.length}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    );
}

export default AttendanceList