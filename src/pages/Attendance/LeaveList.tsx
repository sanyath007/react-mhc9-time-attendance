import { ArrowLeft, UserMinus, Search, FileQuestion, Calendar, FileText, User, Grid, ListIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo, useEffect, useCallback } from 'react';
import moment from 'moment';
import { useAuth } from '../../hooks/useAuth';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';
import { useSearchParams } from 'react-router-dom';
import FliteringInputs from './FliteringInputs';
import type { AttendanceFilters } from '../../lib/types';
import { Pagination } from '../../components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

const LeaveList = () => {
    const { oauthToken } = useAuth();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState<string>(searchParams.get('currentDate') || moment().format('YYYY-MM-DD'));
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem("attendance_view_mode");
        return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    });
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        getLeaves(currentDate);
        setCurrentPage(1); // Reset page on date change
    }, [currentDate]);

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
            if (data) {
                const _leaves = data.map((leave: any) => ({
                    id: leave.LeaveId,
                    type: leave.LeaveName,
                    start: leave.LeaveDate1,
                    end: leave.LeaveDate2,
                    time: leave.LeaveTime1,
                    days: parseFloat(leave.LeaveCountDay),
                    hours: parseFloat(leave.LeaveCountTime),
                    status: leave.LeaveStatus,
                    reason: leave.LeaveMark,
                    employee: {
                        id: leave.employee.EmId,
                        name: `${leave.employee.EmPerfix}${leave.employee.EmName}`,
                        position: { id: parseInt(leave.employee.EmPosition), name: leave.employee.position?.PosName },
                        department: { id: parseInt(leave.employee.EmSession), name: leave.employee.department?.SeName },
                        avatar: leave.employee.EmImg ? `https://mhc9dmh.com/DATA/Photo/${leave.employee.EmImg}` : undefined,
                        avatarColor: leave.employee.EmColor,
                    }
                }))

                setLeaves(_leaves)
            }
        } catch (error) {
            console.error("Error fetching attendances:", error);
            setLeaves([]);
        } finally {
            setIsLoading(false)
        }
    }, [currentDate]);

    const filteredLeaves = useMemo(() => {
        setCurrentPage(1); // Reset page on search
        if (!searchTerm) return leaves;
        return leaves.filter(leave =>
            leave.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, leaves]);

    const paginatedLeaves = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredLeaves.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredLeaves, currentPage]);

    const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE);

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem("attendance_view_mode", mode);
    };

    if (isLoading) return <Loader2 />

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/attendance/daily" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </Link>
                    <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 p-3 rounded-xl shadow-md shadow-amber-500/20">
                        <UserMinus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">รายการพนักงานที่ลา</h1>
                        <p className="text-sm text-gray-500">ข้อมูลพนักงานที่ลางาน (ทุกประเภท) ในวันนี้</p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อพนักงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-gray-400 text-gray-800"
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

            {/* List */}
            {filteredLeaves.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <div className="bg-amber-50 p-5 rounded-full text-amber-400 mb-5 border border-amber-100">
                        <FileQuestion className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                        ไม่พบข้อมูลการลางานที่ตรงกับคำค้นหาของคุณ
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {paginatedLeaves.map(leave => (
                        <div key={leave.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative">
                                    <div className={`p-0.5 rounded-full ring-2 ring-amber-300`}>
                                        {leave.employee.avatar ? (
                                            <EmployeeAvatar
                                                image={leave.employee.avatar}
                                                alt={leave.employee.name}
                                                width="52px"
                                                height="52px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: leave.employee.avatarColor || '#e5e7eb' }}>
                                                <User className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white bg-amber-500`} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-gray-900 truncate">
                                        {leave.employee.name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 text-[11px]">
                                            {leave.type}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {moment(leave.start).format('DD/MM/YYYY')} {leave.end && `- ${moment(leave.end).format('DD/MM/YYYY')}`}
                                        </span>
                                        {leave.reason && <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                                            {leave.reason}
                                        </span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center md:justify-end mt-2 md:mt-0">
                                {leave.status === 'อนุญาต' ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {leave.status}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                        {leave.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedLeaves.map(leave => (
                        <div key={leave.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="relative shrink-0">
                                        <div className={`p-0.5 rounded-full ring-2 ring-amber-300`}>
                                            {leave.employee.avatar ? (
                                                <EmployeeAvatar
                                                    image={leave.employee.avatar}
                                                    alt={leave.employee.name}
                                                    width="48px"
                                                    height="48px"
                                                />
                                            ) : (
                                                <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center" style={{ backgroundColor: leave.employee.avatarColor || '#e5e7eb' }}>
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white bg-amber-500`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-sm font-bold text-gray-900 truncate">
                                            {leave.employee.name}
                                        </h2>
                                        <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 text-[10px] mt-1">
                                            {leave.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-2 flex-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>{moment(leave.start).format('DD/MM/YYYY')} {leave.end && `- ${moment(leave.end).format('DD/MM/YYYY')}`}</span>
                                </div>
                                {leave.reason && (
                                    <div className="flex items-start gap-2 text-[11px] sm:text-xs">
                                        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2 leading-relaxed">{leave.reason}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end shrink-0">
                                {leave.status === 'อนุญาต' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {leave.status}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                        {leave.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredLeaves.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredLeaves.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}
        </div>
    );
};

export default LeaveList;
