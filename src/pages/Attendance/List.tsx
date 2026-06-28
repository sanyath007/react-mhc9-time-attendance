import { useEffect, useState, useMemo } from 'react'
import { CalendarClock, Search, Clock, CheckCircle2, AlertCircle, Users, FileQuestion, Grid, List as ListIcon } from 'lucide-react';
import moment from 'moment';
import api from '../../api';
import { type AttendanceFilters } from '../../lib/types';
import { STARTING_DATE } from '../../lib/constants';
import FliteringInputs from './FliteringInputs';

const AttendanceList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentDate, setCurrentDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem("attendance_view_mode");
        return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    });
    
    const imgUrl = moment(STARTING_DATE).diff(moment(currentDate), "day") > 1 
        ? 'https://mhc9dmh.com/DATA/PhotoCheckTime' 
        : `${import.meta.env.VITE_API_URL}/uploads`;
    
    useEffect(() => {
        getAttendances(currentDate)
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

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem("attendance_view_mode", mode);
    };

    // Filter check-ins (CheTmType === 'เข้า') and match search term
    const filteredCheckIns = useMemo(() => {
        return attendances.filter((att: any) => {
            if (att.CheTmType !== 'เข้า') return false;

            const name = att.employee?.EmName || 'Unknown Employee';
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [attendances, searchTerm]);

    // Calculate Stats for the current day
    const stats = useMemo(() => {
        const checkIns = attendances.filter((att: any) => att.CheTmType === 'เข้า');
        const total = checkIns.length;
        
        let onTime = 0;
        let late = 0;
        
        checkIns.forEach((att: any) => {
            const timeStr = moment(att.CheTmDate).format('HH:mm:ss');
            if (timeStr <= '08:30:00') {
                onTime++;
            } else {
                late++;
            }
        });
        
        return { total, onTime, late };
    }, [attendances]);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Checkins */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100/60 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">ลงเวลาทั้งหมด</p>
                        <h3 className="text-3xl font-extrabold text-indigo-950 mt-1">{isLoading ? '...' : stats.total}</h3>
                        <p className="text-xs text-indigo-500/80 mt-1">ยอดผู้เข้าปฏิบัติงานของวัน</p>
                    </div>
                    <div className="bg-indigo-500/10 p-3.5 rounded-xl text-indigo-600">
                        <Users className="w-8 h-8" />
                    </div>
                </div>

                {/* On Time */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100/60 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">ตรงเวลา</p>
                        <h3 className="text-3xl font-extrabold text-emerald-950 mt-1">{isLoading ? '...' : stats.onTime}</h3>
                        <p className="text-xs text-emerald-500/80 mt-1">ลงเวลาเข้างานก่อน 08:30 น.</p>
                    </div>
                    <div className="bg-emerald-500/10 p-3.5 rounded-xl text-emerald-600">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                </div>

                {/* Late */}
                <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 border border-rose-100/60 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">มาสาย</p>
                        <h3 className="text-3xl font-extrabold text-rose-950 mt-1">{isLoading ? '...' : stats.late}</h3>
                        <p className="text-xs text-rose-500/80 mt-1">ลงเวลาเข้างานหลัง 08:30 น.</p>
                    </div>
                    <div className="bg-rose-500/10 p-3.5 rounded-xl text-rose-600">
                        <AlertCircle className="w-8 h-8" />
                    </div>
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
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title="แสดงแบบการ์ด"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => toggleViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${
                                viewMode === 'list' 
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
            ) : filteredCheckIns.length === 0 ? (
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
                    {filteredCheckIns.map((attendance: any) => {
                        const dateObj = moment(attendance.CheTmDate);
                        const timeStr = dateObj.format('HH:mm:ss');
                        const isLate = timeStr > '08:30:00';
                        
                        return (
                            <div 
                                key={attendance.CheTmID} 
                                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-150 p-4 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                            >
                                {/* Photo frame with Zoom effect */}
                                <div className="relative overflow-hidden rounded-xl aspect-[4/3] w-full border border-gray-50 bg-gray-50 mb-4 group/photo">
                                    {attendance.CheTmPic ? (
                                        <img
                                            src={`${imgUrl}/${attendance.CheTmPic}`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                            alt="check-in-pic"
                                        />
                                    ) : (
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(attendance.employee?.EmName || 'Unknown')}&background=${attendance.employee?.EmColor || '4f46e5'}&color=fff&size=256`}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                            alt="check-in-pic"
                                        />
                                    )}

                                    {/* Floating type badge */}
                                    <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-sm border border-blue-400">
                                        {attendance.CheTmType || 'เข้า'}
                                    </span>
                                </div>

                                {/* Employee Name */}
                                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {attendance.employee ? attendance.employee?.EmName : 'Unknown Employee'}
                                </h3>

                                {/* DateTime details */}
                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-400">วันที่:</span>
                                        <span>{dateObj.format('DD/MM/YYYY')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="font-semibold text-gray-400">เวลา:</span>
                                        <span className="font-bold text-gray-700">{timeStr}</span>
                                    </div>
                                </div>

                                {/* Late/On-Time capsule Badge */}
                                <div className="mt-4">
                                    {isLate ? (
                                        <span className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100/60">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            มาสาย
                                        </span>
                                    ) : (
                                        <span className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            ตรงเวลา
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View Layout */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {filteredCheckIns.map((attendance: any) => {
                        const dateObj = moment(attendance.CheTmDate);
                        const timeStr = dateObj.format('HH:mm:ss');
                        const isLate = timeStr > '08:30:00';
                        
                        return (
                            <div key={attendance.CheTmID} className="p-4 sm:p-5 flex flex-row items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Check-In Photo frame with Zoom effect */}
                                    <div className="relative flex-shrink-0 group/photo overflow-hidden rounded-xl w-16 h-16 border border-gray-100 shadow-sm bg-gray-50">
                                        {attendance.CheTmPic ? (
                                            <img
                                                src={`${imgUrl}/${attendance.CheTmPic}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                                alt="check-in-pic"
                                            />
                                        ) : (
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(attendance.employee?.EmName || 'Unknown')}&background=${attendance.employee?.EmColor || '4f46e5'}&color=fff&size=128`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110"
                                                alt="check-in-pic"
                                            />
                                        )}
                                    </div>

                                    {/* Name and Log Info */}
                                    <div className="min-w-0">
                                        <h2 className="text-base font-bold text-gray-900 truncate">
                                            {attendance.employee ? attendance.employee?.EmName : 'Unknown Employee'}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                            <span className="font-medium">
                                                วันที่: {dateObj.format('DD/MM/YYYY')}
                                            </span>
                                            <span className="text-gray-300 hidden sm:inline">|</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                เวลา: {timeStr}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                    {/* Check-in type badge */}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                        {attendance.CheTmType || 'เข้า'}
                                    </span>

                                    {/* Late / On-Time status badge */}
                                    {isLate ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100/60">
                                            <AlertCircle className="w-3 h-3" />
                                            มาสาย
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                                            <CheckCircle2 className="w-3 h-3" />
                                            ตรงเวลา
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AttendanceList