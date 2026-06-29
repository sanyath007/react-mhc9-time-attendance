import { ArrowLeft, UserMinus, Search, FileQuestion, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import moment from 'moment';

const mockLeaves = [
    {
        id: 1,
        employeeName: 'สัญญา ธรรมวงษ์',
        leaveType: 'ลาพักผ่อน',
        startDate: '2026-06-28',
        endDate: '2026-06-30',
        reason: 'พักผ่อนประจำปี',
        status: 'อนุมัติ',
        avatarColor: '4f46e5'
    },
    {
        id: 2,
        employeeName: 'สมใจ รักดี',
        leaveType: 'ลากิจ',
        startDate: '2026-06-29',
        endDate: '2026-06-29',
        reason: 'ติดต่อหน่วยงานราชการ',
        status: 'รออนุมัติ',
        avatarColor: '10b981'
    },
    {
        id: 3,
        employeeName: 'วิชัย ใจมั่น',
        leaveType: 'ลาป่วย',
        startDate: '2026-06-29',
        endDate: '2026-07-01',
        reason: 'ไข้หวัดใหญ่',
        status: 'อนุมัติ',
        avatarColor: 'f43f5e'
    }
];

const LeaveList = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLeaves = useMemo(() => {
        if (!searchTerm) return mockLeaves;
        return mockLeaves.filter(leave => 
            leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/attendance" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {filteredLeaves.map(leave => (
                        <div key={leave.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="relative flex-shrink-0 overflow-hidden rounded-xl w-14 h-14 border border-gray-100 shadow-sm bg-gray-50">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employeeName)}&background=${leave.avatarColor}&color=fff&size=128`}
                                        className="w-full h-full object-cover"
                                        alt="avatar"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-gray-900 truncate">
                                        {leave.employeeName}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 text-[11px]">
                                            {leave.leaveType}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {moment(leave.startDate).format('DD/MM/YYYY')} - {moment(leave.endDate).format('DD/MM/YYYY')}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                                            {leave.reason}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center md:justify-end mt-2 md:mt-0">
                                {leave.status === 'อนุมัติ' ? (
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
            )}
        </div>
    );
};

export default LeaveList;
