import React from 'react'
import { House } from 'lucide-react';

const Home = () => {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 rounded-lg">
                            <House className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">หน้าหลัก</h1>
                            <p className="text-gray-600">ระบบลงเวลาปฏิบัติงาน</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {/* <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-5 h-5" />
                            <span className="text-lg font-semibold">
                                {currentTime.toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {currentTime.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home