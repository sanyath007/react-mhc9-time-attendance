import { House } from 'lucide-react';
import HeaderIcon from '../../components/ui/HeaderIcon';

const Home = () => {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md shadow-blue-500/20">
                        <House className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">หน้าหลัก</h1>
                        <p className="text-sm text-gray-500">ระบบลงเวลาปฏิบัติงานด้วยการจดจำใบหน้า</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/*  */}
            </div>
        </div>
    )
}

export default Home