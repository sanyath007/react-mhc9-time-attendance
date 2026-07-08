import { Building2, Code2, UserCheck, MapPin, Phone } from 'lucide-react';

export default function Contact() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header Section */}
            <div className="text-center space-y-4 pt-4">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ติดต่อเรา
                </h1>
                <p className="text-gray-500 font-medium">
                    หากพบปัญหาการใช้งานหรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อทีมงานได้ตามข้อมูลด้านล่าง
                </p>
            </div>

            {/* Organization Info */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>

                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30 text-white shrink-0">
                        <Building2 className="w-10 h-10" />
                    </div>
                    <div className="text-center md:text-left space-y-3">
                        <h2 className="text-2xl font-bold text-gray-800">ศูนย์สุขภาพจิตที่ 9</h2>
                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                <span>86 ถ.ช้างเผือก ตำบลในเมือง อำเภอเมืองนครราชสีมา นครราชสีมา 30000</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Phone className="w-4 h-4 text-indigo-500" />
                                <span>044-256-729</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Developer */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-start justify-center w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/employees/042420240855456628c911d3e25.jpg`}
                                    alt="นายสัญญา ธรรมวงษ์"
                                    className="w-full object-contain"
                                />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap z-20">
                                <Code2 className="w-3 h-3" />
                                ผู้พัฒนาระบบ
                            </div>
                        </div>

                        <div className="pt-4">
                            <h3 className="text-xl font-bold text-gray-800">นายสัญญา ธรรมวงษ์</h3>
                            <p className="text-sm font-semibold text-blue-600 mt-1">นักวิชาการคอมพิวเตอร์ชำนาญการ</p>
                            <p className="text-xs text-gray-500 mt-3 bg-gray-50 py-2 px-4 rounded-xl border border-gray-100 inline-block w-full">
                                งานเทคโนโลยีสารสนเทศ กลุ่มงานอำนวยการ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Responsible Person */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-start justify-center w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/employees/05132024041113664192e1891a3.jpg`}
                                    alt="นางสาวศรัณยาพร สุริยะกุลพงษ์"
                                    className="w-full object-contain"
                                />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap z-20">
                                <UserCheck className="w-3 h-3" />
                                ผู้รับผิดชอบ
                            </div>
                        </div>

                        <div className="pt-4">
                            <h3 className="text-xl font-bold text-gray-800">นางสาวศรัณยาพร สุริยะกุลพงษ์</h3>
                            <p className="text-sm font-semibold text-purple-600 mt-1">นักจัดการงานทั่วไป</p>
                            <p className="text-xs text-gray-500 mt-3 bg-gray-50 py-2 px-4 rounded-xl border border-gray-100 inline-block w-full">
                                งานทรัพยากรบุคคล กลุ่มงานอำนวยการ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
