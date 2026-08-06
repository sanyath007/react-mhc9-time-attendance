import { Settings2 } from 'lucide-react';

export default function Settings() {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4 py-2">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 text-white shrink-0">
                    <Settings2 className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                        ตั้งค่า
                    </h1>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        การตั้งค่าการทำงานของระบบ
                    </p>
                </div>
            </div>

            {/* Settings Content */}
        </div>
    );
}
