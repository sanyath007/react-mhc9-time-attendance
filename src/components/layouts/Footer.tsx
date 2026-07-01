import { Clock, Shield } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 lg:py-10">
                <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand Section */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-slate-100 font-bold tracking-wide text-lg">MHC9 Time Attendance</h3>
                            <p className="text-slate-400 text-sm mt-0.5">ระบบบันทึกเวลาปฏิบัติงาน ศูนย์สุขภาพจิตที่ 9</p>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-3 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-blue-400 transition-colors">หน้าหลัก</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">นโยบายส่วนบุคคล</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">ติดต่อผู้ดูแลระบบ</a>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-8"></div>

                {/* Bottom Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
                    <p>
                        &copy; {currentYear} ศูนย์สุขภาพจิตที่ 9 กรมสุขภาพจิต. All rights reserved.
                    </p>
                    <p className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-slate-400" />
                        Secured & Maintained by IT Dept.
                    </p>
                </div>
            </div>
        </footer>
    )
}
