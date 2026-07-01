import { useEffect, useState } from 'react';
import { CircleChevronLeft, MapPin, Navigation, NavigationOff, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CheckIn from '../../components/features/CheckIn';
import { useGeolocation } from '../../hooks/useLocation';
import { useLiveLocation } from '../../hooks/useLiveLocation';

const OFFICE_LATITUDE = import.meta.env.VITE_OFFICE_LATITUDE ? parseFloat(import.meta.env.VITE_OFFICE_LATITUDE) : 14.98326727612899;
const OFFICE_LONGITUDE = import.meta.env.VITE_OFFICE_LONGITUDE ? parseFloat(import.meta.env.VITE_OFFICE_LONGITUDE) : 102.10488443930059;

export default function CheckInContainer() {
    const path = useLocation().pathname;
    const [currentTime, setCurrentTime] = useState(new Date());
    const { calculateDistance } = useGeolocation();
    const [distance, setDistance] = useState<number>(0);
    const location = useLiveLocation();

    /** Update distance when location changes */
    useEffect(() => {
        if (location) {
            setDistance(calculateDistance(
                location.latitude,
                location.longitude,
                OFFICE_LATITUDE,
                OFFICE_LONGITUDE
            ));
        }
    }, [location]);

    /** Update time every second */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full max-w-md mx-auto space-y-4 px-0 py-1">
            {/* Header with Integrated Clock */}
            {path === '/check-in' ? (
                <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            reloadDocument
                            className="p-2 bg-transparent border border-transparent hover:bg-gray-50 hover:border-gray-200/80 text-gray-400 hover:text-gray-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                            title="กลับไปหน้าหลัก"
                        >
                            <CircleChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">
                                MHC9 Attendance
                            </span>
                            <span className="text-xs font-bold text-gray-800 block leading-none">
                                ลงเวลาปฏิบัติงาน
                            </span>
                        </div>
                    </div>
                    {/* Compact Header Clock */}
                    <div className="text-right shrink-0">
                        <span className="text-base font-black font-mono text-indigo-600 block leading-none">
                            {currentTime.toLocaleTimeString()}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold block mt-1 leading-none">
                            {currentTime.toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-3 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md shadow-blue-500/20 text-white shrink-0">
                            <User className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-800">
                                ลงเวลาปฏิบัติงาน
                            </h1>
                            <p className="text-[9px] text-gray-500">ระบบบันทึกเวลาสแกนใบหน้า</p>
                        </div>
                    </div>

                    {/* Compact Header Clock */}
                    <div className="text-right shrink-0">
                        <span className="text-base font-black font-mono text-indigo-600 block leading-none">
                            {currentTime.toLocaleTimeString()}
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold block mt-1 leading-none">
                            {currentTime.toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            )}

            {/* Map Radar Location Status Card */}
            <div className={`rounded-2xl border p-4 shadow-sm transition-all duration-300 bg-white ${distance > 500
                ? 'border-amber-100/60 shadow-amber-500/5'
                : 'border-indigo-100/60 shadow-indigo-500/5'
                }`}>
                <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${distance > 500 ? 'bg-amber-500/10 text-amber-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
                            {distance > 500 ? <NavigationOff className="w-4.5 h-4.5" /> : <Navigation className="w-4.5 h-4.5" />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs font-bold text-gray-800">ตำแหน่งพนักงาน</h3>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                                {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'กำลังเชื่อมโยง GPS...'}
                            </p>
                        </div>
                    </div>

                    {/* Pulsing Radar Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-100 bg-gray-50/50 shadow-sm shrink-0">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${distance > 500 ? 'bg-amber-400' : 'bg-indigo-400'
                                }`}></span>
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${distance > 500 ? 'bg-amber-500' : 'bg-indigo-500'
                                }`}></span>
                        </span>
                        <span className={`text-[9px] font-bold ${distance > 500 ? 'text-amber-700' : 'text-indigo-700'}`}>
                            {distance > 500 ? 'นอกพื้นที่งาน' : 'อยู่ในพื้นที่'}
                        </span>
                    </div>
                </div>

                {/* Accuracy / Distance Details */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-[11px]">
                    <div>
                        <p className="text-gray-400 font-medium">ระยะห่างจากที่ทำงาน</p>
                        <p className={`text-sm font-black mt-0.5 ${distance > 500 ? 'text-amber-600' : 'text-indigo-600'}`}>
                            {distance.toFixed(1)} เมตร
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 font-medium">ความแม่นยำ GPS</p>
                        <p className="text-sm font-black text-gray-700 mt-0.5">
                            {location ? `${location.accuracy.toFixed(1)} เมตร` : 'กำลังค้นหา...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* CheckIn Form Component */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-4">
                <CheckIn distance={distance} />
            </div>
        </div>
    );
}