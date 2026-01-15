import React, { useEffect } from 'react'
import { CalendarClock } from 'lucide-react';
import moment from 'moment';
import api from '../../api';

const AttendanceList = () => {
    const [attendances, setAttendances] = React.useState([]);
    const [currentDate, setCurrentDate] = React.useState(moment().format('YYYY-MM-DD'));

    useEffect(() => {
        getAttendances(currentDate)
    }, []);

    const getAttendances = async (date: string) => {
        const response = await api.get(`/api/attendances/check-time/${date}/daily`);

        setAttendances(response.data.daily);
    }

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
                {attendances.filter((attendance: any) => attendance.CheTmType === 'เข้า').map((attendance: any) => (
                    <div key={attendance.id} className="flex flex-row items-center gap-4 border-b last:border-0 py-4">
                        {attendance.CheTmPic ? (
                        <img
                            src={`https://mhc9dmh.com/DATA/PhotoCheckTime/${attendance.CheTmPic}`}
                            className='w-16 h-16 object-cover rounded-md'
                            alt='check-in-pic'
                        />
                        ) : (
                            <img
                            src={`https://ui-avatars.com/api/?name=John+Doe&background=${attendance.employee?.EmColor}&color=fff&size=128`}
                            className='w-16 h-16 object-cover rounded-md'
                            alt='check-in-pic'
                        />
                        )}

                        <div>
                            <h2 className="text-lg font-semibold text-blue-800">
                                {attendance.employee ? attendance.employee?.EmName : 'Unknown Employee'}
                            </h2>
                            <p className="text-gray-600">
                                วันที่: {moment(attendance.CheTmDate).format('DD/MM/YYYY')} <br />
                                เวลา: {moment(attendance.CheTmDate).format('HH:mm:ss')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AttendanceList