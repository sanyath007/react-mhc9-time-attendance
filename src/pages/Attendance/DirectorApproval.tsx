import { useEffect, useState, useMemo, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Users, UserMinus, Briefcase, CheckCircle } from 'lucide-react';
import moment from 'moment';
import api from '../../api';
import { useAuth } from '../../hooks/useAuth';
import FliteringInputs from './FliteringInputs';
import { SummaryCard } from '../../components/ui/Cards/SummaryCard';
import { LATE_TIME_AFTER } from '../../lib/constants/date-time';
import { getDailyApprovalStatus, approveByDirector, type ApprovalStatus } from '../../lib/mockApproval';
import { type AttendanceFilters } from '../../lib/types';

export default function DirectorApproval() {
    const { oauthToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [attendances, setAttendances] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [duties, setDuties] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('PENDING');

    useEffect(() => {
        setApprovalStatus(getDailyApprovalStatus(currentDate));
        getAttendances(currentDate);
        getLeaves(currentDate);
        getDuties(currentDate);
        fetchEmployees();
    }, [currentDate]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get(`/api/employees`);
            if (res.status === 200) {
                setEmployees(res.data.filter((e: any) => e.status === 1)); // Active employees
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const getAttendances = async (date: string) => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/attendances/check-time/${date}/daily`);
            setAttendances(response.data.daily || []);
        } catch (error) {
            console.error("Error fetching attendances:", error);
            setAttendances([]);
        } finally {
            setIsLoading(false);
        }
    }

    const getLeaves = useCallback(async (date: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/leaves?sdate=${date}&edate=${date}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${oauthToken}` },
            });
            const data = await response.json();
            setLeaves(data || []);
        } catch (error) {
            console.error("Error fetching leaves:", error);
        }
    }, [oauthToken]);

    const getDuties = useCallback(async (date: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_OAUTH_API_URL}/events?sdate=${date}&edate=${date}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oauthToken}` },
            });
            const data = await response.json();
            if (data) {
                let _employees: any = [];
                data.forEach((event: any) => {
                    const isDuplicate = _employees.some((emp: any) => emp.EmId === event.employee?.EmId);
                    if (!isDuplicate) _employees.push({ ...event.employee, dutyTopic: event.OTName, dutyLocation: event.OTLocation });
                });
                setDuties(_employees);
            }
        } catch (error) {
            console.error("Error fetching duties:", error);
        }
    }, [oauthToken]);

    const combinedAttendances = useMemo(() => {
        const map = new Map<string, any>();
        attendances.forEach((att: any) => {
            const empId = att.employee?.id || att.employee?.EmID || att.employee?.employee_no || att.employee?.EmName || `unknown-${att.CheTmID}`;
            if (!map.has(empId)) {
                map.set(empId, { id: empId, employee: att.employee, checkIn: null, checkOut: null });
            }
            const group = map.get(empId);
            if (att.CheTmType === 'เข้า') {
                if (!group.checkIn || moment(att.CheTmDate).isBefore(moment(group.checkIn.CheTmDate))) group.checkIn = att;
            } else if (att.CheTmType === 'ออก') {
                if (!group.checkOut || moment(att.CheTmDate).isAfter(moment(group.checkOut.CheTmDate))) group.checkOut = att;
            }
        });
        return Array.from(map.values()).filter(group => group.checkIn || group.checkOut);
    }, [attendances]);

    const stats = useMemo(() => {
        const checkIns = combinedAttendances.filter(group => group.checkIn);
        const total = checkIns.length;
        let onTime = 0;
        let late = 0;

        checkIns.forEach(group => {
            const timeStr = moment(group.checkIn.CheTmDate).format('HH:mm:ss');
            if (timeStr <= LATE_TIME_AFTER) {
                onTime++;
            } else {
                late++;
            }
        });
        return { total, onTime, late, leave: leaves?.length || 0, officialDuty: duties?.length || 0 };
    }, [combinedAttendances, leaves, duties]);

    const allEmployeesStatus = useMemo(() => {
        return employees.map(emp => {
            const fullName = `${emp.firstname || ''} ${emp.lastname || ''}`.trim();
            const employeeNo = emp.employee_no || emp.id;

            // Find attendance
            const att = combinedAttendances.find(a =>
                String(a.id) === String(employeeNo) ||
                (a.employee && a.employee.EmName === fullName)
            );

            // Find leave
            const leave = leaves.find((l: any) =>
                String(l.employee?.EmId) === String(employeeNo) ||
                l.employee?.EmName === fullName
            );

            // Find duty
            const duty = duties.find(d =>
                String(d.EmId) === String(employeeNo) ||
                d.EmName === fullName
            );

            return {
                ...emp,
                fullName,
                att,
                leave,
                duty
            };
        });
    }, [employees, combinedAttendances, leaves, duties]);

    /** Approve by director */
    const handleApprove = () => {
        if (confirm(`ยืนยันการอนุมัติข้อมูลลงเวลาของวันที่ ${moment(currentDate).format('DD/MM/YYYY')} ?\nเมื่ออนุมัติแล้วพนักงานจะไม่สามารถลงเวลาสำหรับวันนี้ได้อีก`)) {
            approveByDirector(currentDate);
            setApprovalStatus('DIRECTOR_APPROVED');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-3 rounded-xl shadow-md shadow-purple-500/20">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">อนุมัติข้อมูลการลงเวลา (ผู้อำนวยการ)</h1>
                        <p className="text-sm text-gray-500">ตรวจสอบและอนุมัติการลงเวลาประจำวัน</p>
                    </div>
                </div>
            </div>

            {/* Filter and Status Section */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <FliteringInputs
                    initialValues={{ toDay: currentDate }}
                    onFilter={(filters: AttendanceFilters) => {
                        setCurrentDate(filters.toDay);
                    }}
                />

                <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold mr-2">
                        สถานะ :
                        {approvalStatus === 'PENDING' && <span className="ml-2 text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ยังไม่ส่งรายงาน</span>}
                        {approvalStatus === 'HR_SUBMITTED' && <span className="ml-2 text-blue-600 bg-blue-100 px-3 py-1 rounded-full">รออนุมัติ</span>}
                        {approvalStatus === 'DIRECTOR_APPROVED' && <span className="ml-2 text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">อนุมัติแล้ว</span>}
                    </div>

                    <button
                        onClick={handleApprove}
                        disabled={approvalStatus !== 'HR_SUBMITTED'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${approvalStatus === 'HR_SUBMITTED'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        อนุมัติรายงาน
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard
                        title="ลงเวลาทั้งหมด"
                        value={isLoading ? '...' : stats.total}
                        subtitle="ยอดผู้เข้าปฏิบัติงาน"
                        icon={<Users className="w-6 h-6" />}
                        theme="indigo"
                    />
                    <SummaryCard
                        title="ตรงเวลา"
                        value={isLoading ? '...' : stats.onTime}
                        subtitle={`ก่อน ${LATE_TIME_AFTER.slice(0, 5)} น.`}
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        theme="emerald"
                    />
                    <SummaryCard
                        title="มาสาย"
                        value={isLoading ? '...' : stats.late}
                        subtitle={`หลัง ${LATE_TIME_AFTER.slice(0, 5)} น.`}
                        icon={<AlertCircle className="w-6 h-6" />}
                        theme="rose"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SummaryCard
                        title="ลางาน"
                        value={isLoading ? '...' : stats.leave}
                        subtitle="จำนวนพนักงานที่ลา"
                        icon={<UserMinus className="w-6 h-6" />}
                        theme="amber"
                    />
                    <SummaryCard
                        title="ไปราชการ"
                        value={isLoading ? '...' : stats.officialDuty}
                        subtitle="พนักงานไปราชการ"
                        icon={<Briefcase className="w-6 h-6" />}
                        theme="purple"
                    />
                </div>
            </div>

            {/* Employee Status Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">รายชื่อบุคลากรและสถานะการลงเวลา</h3>
                    <span className="text-sm font-semibold text-gray-500">จำนวนทั้งหมด {allEmployeesStatus.length} คน</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold w-[5%]">ลำดับ</th>
                                <th scope="col" className="px-6 py-4 font-bold w-[25%]">ชื่อ-สกุล</th>
                                <th scope="col" className="px-6 py-4 text-center font-bold w-[15%]">เวลาเข้า</th>
                                <th scope="col" className="px-6 py-4 text-center font-bold w-[15%]">เวลาออก</th>
                                <th scope="col" className="px-6 py-4 text-center font-bold">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {allEmployeesStatus.map((item, index) => {
                                const checkInTime = item.att?.checkIn ? moment(item.att.checkIn.CheTmDate).format('HH:mm:ss') : '-';
                                const checkOutTime = item.att?.checkOut ? moment(item.att.checkOut.CheTmDate).format('HH:mm:ss') : '-';
                                const isLate = item.att?.checkIn && moment(item.att.checkIn.CheTmDate).format('HH:mm:ss') > LATE_TIME_AFTER;
                                const isPresent = !!item.att?.checkIn;
                                const leaveText = item.leave ? item.leave.LeaveName || 'ลา' : '-';
                                const dutyLocation = item.duty ? `${item.duty.dutyLocation ? `${item.duty.dutyLocation}` : ''}` : '-';
                                const dutyText = item.duty ? `${item.duty.dutyTopic || ''} ${item.duty.dutyLocation ? `(${item.duty.dutyLocation})` : ''}` : '-';

                                return (
                                    <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {item.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700 font-semibold">{checkInTime}</td>
                                        <td className="px-6 py-4 text-center text-gray-700 font-semibold">{checkOutTime}</td>
                                        <td className="px-6 py-4 text-center">
                                            {isPresent ? (
                                                isLate ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                                                        สาย
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                        ตรงเวลา
                                                    </span>
                                                )
                                            ) : item.leave ? (
                                                <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                                    ลา{leaveText}
                                                </span>
                                            ) : item.duty ? (
                                                <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full max-w-[250px] truncate" title={dutyText}>
                                                    ไปราชการ {dutyLocation}
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
