import { ArrowLeft, Briefcase, Search, FileQuestion, Calendar, MapPin, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import moment from 'moment';

const mockDuties = [
    {
        id: 1,
        employeeName: 'สมรักษ์ คำสิงห์',
        destination: 'สำนักงานสาธารณสุขจังหวัดนครราชสีมา',
        startDate: '2026-06-29',
        endDate: '2026-06-29',
        purpose: 'ประชุมชี้แจงนโยบายสาธารณสุข',
        status: 'อนุมัติ',
        avatarColor: '8b5cf6'
    },
    {
        id: 2,
        employeeName: 'ภราดร ศรีชาพันธุ์',
        destination: 'กระทรวงสาธารณสุข นนทบุรี',
        startDate: '2026-06-29',
        endDate: '2026-06-30',
        purpose: 'อบรมสัมมนาวิชาการ',
        status: 'อนุมัติ',
        avatarColor: '3b82f6'
    }
];

const OfficialDutyList = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDuties = useMemo(() => {
        if (!searchTerm) return mockDuties;
        return mockDuties.filter(duty => 
            duty.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            duty.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            duty.purpose.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <div className="relative flex-shrink-0 overflow-hidden rounded-xl w-14 h-14 border border-gray-100 shadow-sm bg-gray-50">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(duty.employeeName)}&background=${duty.avatarColor}&color=fff&size=128`}
                                        className="w-full h-full object-cover"
                                        alt="avatar"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-gray-900 truncate">
                                        {duty.employeeName}
                                    </h2>
                                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-purple-700 font-medium">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {duty.destination}
                                        </span>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                                            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {moment(duty.startDate).format('DD/MM/YYYY')} {duty.startDate !== duty.endDate && `- ${moment(duty.endDate).format('DD/MM/YYYY')}`}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600">
                                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                                {duty.purpose}
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
