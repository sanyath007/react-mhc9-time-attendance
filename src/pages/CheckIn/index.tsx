import React, { useEffect, useState } from 'react';
import { User, Clock } from 'lucide-react';
import CheckIn from '../../components/features/CheckIn';

export default function CheckInContainer() {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-md:p-3 max-md:mb-3">
                <div className="flex max-md:flex-col items-center justify-between max-md:items-start gap-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 rounded-lg">
                            <User className="w-8 h-8 max-md:w-4 max-md:h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl max-md:text-xl font-bold text-gray-800">Time Attendance System</h1>
                            <p className="max-md:hidden text-gray-600">Employee Check-In</p>
                        </div>
                    </div>
                    <div className="text-right max-md:hidden">
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
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-md:p-4">
                <CheckIn />
            </div>
        </div>
    );
}