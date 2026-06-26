import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react';
import moment from 'moment';
import api from '../../api';
import { type AttendanceFilters } from '../../lib/types';
import { STARTING_DATE } from '../../lib/constants';
import FliteringInputs from './FliteringInputs';
import HeaderIcon from '../../components/ui/HeaderIcon';

const AttendanceList = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [attendances, setAttendances] = useState([]);
    const [currentDate, setCurrentDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const imgUrl = moment(STARTING_DATE).diff(moment(currentDate), "day") > 1 ? 'https://mhc9dmh.com/DATA/PhotoCheckTime' : `${import.meta.env.VITE_API_URL}/uploads`;
    
    useEffect(() => {
        getAttendances(currentDate)
    }, [currentDate]);

    const getAttendances = async (date: string) => {
        try {
            setIsLoading(true)
            const response = await api.get(`/api/attendances/check-time/${date}/daily`);

            setAttendances(response.data.daily);
        } catch (error) {
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md shadow-blue-500/20">
                        <CalendarClock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">รายการลงเวลา</h1>
                        <p className="text-sm text-gray-500">ประวัติและข้อมูลการลงเวลาทำงานรายวัน</p>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <FliteringInputs
                    initialValues={{ toDay: moment().format('YYYY-MM-DD') }}
                    onFilter={(filters: AttendanceFilters) => {
                        setCurrentDate(filters.toDay);
                    }}
                />

                <div className='px-2'>
                    {isLoading && <div className='mt-8 text-center'>Loading...</div>}

                    {!isLoading && attendances.filter((attendance: any) => attendance.CheTmType === 'เข้า').map((attendance: any) => (
                        <div key={attendance.CheTmID} className="flex flex-row items-center gap-4 border-b last:border-0 py-4">
                            {attendance.CheTmPic ? (
                                <img
                                    src={`${imgUrl}/${attendance.CheTmPic}`}
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
        </div>
    )
}

export default AttendanceList