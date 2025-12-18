import React from 'react'
import { CalendarClock } from 'lucide-react';

const AttendanceList = () => {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-md:p-3 max-md:mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 max-md:p-2 rounded-lg">
                            <CalendarClock className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 max-md:text-xl">รายการลงเวลา</h1>
                            <p className="text-gray-600 max-md:hidden">Attendance List</p>
                        </div>
                    </div>

                    {/* <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-700">
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
                        </p>
                    </div> */}
                </div>
            </div>
            
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/*  */}
            </div>
        </div>
    )
}

export default AttendanceList