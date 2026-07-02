import { ArrowLeft, Briefcase, Search, FileQuestion, Calendar, MapPin, FileText, Grid, ListIcon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo, useCallback, useEffect } from 'react';
import moment from 'moment';
import { useAuth } from '../../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import FliteringInputs from './FliteringInputs';
import type { AttendanceFilters } from '../../lib/types';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';

const OfficialDutyList = () => {
    const { oauthToken } = useAuth();
    const [searchParams] = useSearchParams();
    const [duties, setDuties] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentDate, setCurrentDate] = useState<string>(searchParams.get('currentDate') || moment().format('YYYY-MM-DD'));
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem("attendance_view_mode");
        return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    });

    useEffect(() => {
        getDuties(currentDate)
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
                    const starts = _filtered.map((e: any) => e.OTDateProject).join(', ');
                    const ends = _filtered.map((e: any) => e.OTDateProject2).join(', ');

                    return {
                        id: employee.EmId,
                        name: `${employee.EmPerfix}${employee.EmName}`,
                        position: { id: parseInt(employee.EmPosition), name: employee.position?.PosName },
                        department: { id: parseInt(employee.EmSession), name: employee.department?.SeName },
                        avatar: employee.EmImg ? `https://mhc9dmh.com/DATA/Photo/${employee.EmImg}` : undefined,
                        avatarColor: employee.EmColor,
                        events,
                        start: starts,
                        end: ends,
                        status: "อนุมัติ"
                    };
                });

                setDuties(_trips)
            }
        } catch (error) {

        }
    }, [currentDate])

    const filteredDuties = useMemo(() => {
        if (!searchTerm) return duties;
        return duties.filter(duty =>
            duty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            duty.events.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, duties]);

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem("attendance_view_mode", mode);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/attendance" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </Link>
                    <div className="bg-gradient-to-tr from-purple-600 to-fuchsia-500 p-3 rounded-xl shadow-md shadow-purple-500/20">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">รายการพนักงานที่ไปราชการ</h1>
                        <p className="text-sm text-gray-500">ข้อมูลพนักงานที่ไปปฏิบัติราชการในวันนี้</p>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all placeholder:text-gray-400 text-gray-800"
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
            {filteredDuties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
                    <div className="bg-purple-50 p-5 rounded-full text-purple-400 mb-5 border border-purple-100">
                        <FileQuestion className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                        ไม่พบข้อมูลพนักงานที่ไปราชการที่ตรงกับคำค้นหาของคุณ
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {filteredDuties.map(duty => (
                        <div key={duty.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative">
                                    <div className={`p-0.5 rounded-full ring-2 ring-purple-300`}>
                                        {duty.avatar ? (
                                            <EmployeeAvatar
                                                image={duty.avatar}
                                                alt={duty.name}
                                                width="52px"
                                                height="52px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: duty.avatarColor }}>
                                                <User className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white bg-purple-500`} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-gray-900 truncate">
                                        {duty.name}
                                    </h2>
                                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                                        <span className="flex items-start gap-1.5 text-[11px] sm:text-xs text-purple-700 font-medium">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5" />
                                            {duty.events}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                                            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {moment(duty.start).format('DD/MM/YYYY')} {duty.start !== duty.end && `- ${moment(duty.end).format('DD/MM/YYYY')}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center md:justify-end mt-2 md:mt-0">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {duty.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OfficialDutyList;
