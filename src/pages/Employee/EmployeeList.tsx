import { UserPlus } from "lucide-react"

export default function EmployeeList() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-3 rounded-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">รายการบุคลากร</h1>
                            <p className="text-gray-600">Employee List</p>
                        </div>
                    </div>

                    <div>
                        <a href="/employee/register" className="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-full text-white font-bold scale-125">
                            ลงทะเบียนใหม่
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                
            </div>
        </div>
    )
}