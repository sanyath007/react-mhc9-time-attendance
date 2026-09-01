import { useState, useMemo } from 'react';
import { FileBarChart, CalendarDays, Search, CalendarClock } from 'lucide-react';
import moment from 'moment';
import { SummaryCard } from '../../components/ui/Cards/SummaryCard';
import EmployeeAvatar from '../../components/features/EmployeeAvatar';

export default function SummaryReport() {
    const [month, setMonth] = useState<string>(moment().format('MM'));
    const [year, setYear] = useState<string>(moment().format('YYYY'));
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data for summary report
    const mockData = useMemo(() => {
        return [
            {
                id: 1,
                employee: { EmName: 'นาย สมชาย ใจดี', EmImg: '' },
                totalDays: 20,
                present: 18,
                late: 2,
                leave: 1,
                duty: 1,
            },
            {
                id: 2,
                employee: { EmName: 'นางสาว สมหญิง รักดี', EmImg: '' },
                totalDays: 20,
                present: 20,
                late: 0,
                leave: 0,
                duty: 0,
            }
        ];
    }, [month, year]);

    const filteredData = mockData.filter(d => d.employee.EmName.includes(searchTerm));

    const totals = useMemo(() => {
        return mockData.reduce((acc, curr) => {
            acc.present += curr.present;
            acc.late += curr.late;
            acc.leave += curr.leave;
            acc.duty += curr.duty;
            return acc;
        }, { present: 0, late: 0, leave: 0, duty: 0 });
    }, [mockData]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 p-3 rounded-xl shadow-md shadow-cyan-500/20">
                        <FileBarChart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">รายงานสรุปยอดการลงเวลา</h1>
                        <p className="text-sm text-gray-500">สรุปข้อมูลรายเดือน/รายปี</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อพนักงาน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-gray-400" />
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                        >
                            <option value="01">มกราคม</option>
                            <option value="02">กุมภาพันธ์</option>
                            <option value="03">มีนาคม</option>
                            <option value="04">เมษายน</option>
                            <option value="05">พฤษภาคม</option>
                            <option value="06">มิถุนายน</option>
                            <option value="07">กรกฎาคม</option>
                            <option value="08">สิงหาคม</option>
                            <option value="09">กันยายน</option>
                            <option value="10">ตุลาคม</option>
                            <option value="11">พฤศจิกายน</option>
                            <option value="12">ธันวาคม</option>
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard title="มาทำงานรวม" value={totals.present} subtitle="ครั้ง" icon={<CalendarClock className="w-6 h-6" />} theme="indigo" />
                <SummaryCard title="มาสายรวม" value={totals.late} subtitle="ครั้ง" icon={<CalendarClock className="w-6 h-6" />} theme="rose" />
                <SummaryCard title="ลางานรวม" value={totals.leave} subtitle="วัน" icon={<CalendarClock className="w-6 h-6" />} theme="amber" />
                <SummaryCard title="ไปราชการรวม" value={totals.duty} subtitle="ครั้ง" icon={<CalendarClock className="w-6 h-6" />} theme="purple" />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4">ชื่อ-สกุล</th>
                            <th scope="col" className="px-6 py-4 text-center">มาทำงาน (ครั้ง)</th>
                            <th scope="col" className="px-6 py-4 text-center">มาสาย (ครั้ง)</th>
                            <th scope="col" className="px-6 py-4 text-center">ลา (วัน)</th>
                            <th scope="col" className="px-6 py-4 text-center">ไปราชการ (ครั้ง)</th>
                            <th scope="col" className="px-6 py-4 text-center">รายละเอียด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                            <EmployeeAvatar image={`https://mhc9dmh.com/DATA/Photo/${item.employee.EmImg}`} alt={item.employee.EmName} width="32px" height="32px" />
                                        </div>
                                        <span className="font-semibold text-gray-900">{item.employee.EmName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-emerald-600 font-bold">{item.present}</td>
                                    <td className="px-6 py-4 text-center text-rose-600 font-bold">{item.late}</td>
                                    <td className="px-6 py-4 text-center text-amber-600 font-bold">{item.leave}</td>
                                    <td className="px-6 py-4 text-center text-purple-600 font-bold">{item.duty}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-blue-600 hover:underline font-semibold text-xs bg-blue-50 px-3 py-1.5 rounded-lg">
                                            ดูรายละเอียด
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
