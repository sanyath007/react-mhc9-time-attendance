import { useEffect, useState } from 'react';
import { CircleChevronLeft, Clock, MapPin, Navigation, NavigationOff, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CheckIn from '../../components/features/CheckIn';
import { useGeolocation } from '../../hooks/useLocation';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import HeaderIcon from '../../components/ui/HeaderIcon';

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

        console.log(location, distance);
    }, [location]);

    /** Update time every second */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 ${path === '/check-in' ? 'mb-4 max-md:mb-2' : 'mb-6 max-md:mb-3'}`}>
                {path === '/check-in'
                ? (
                    <div className="flex items-center">
                        <Link to="/login" reloadDocument className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold">
                            <CircleChevronLeft className="w-8 h-8 max-md:w-6 max-md:h-6 mr-1" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md shadow-blue-500/20">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    ลงเวลาปฏิบัติงาน
                                </h1>
                                <p className="text-sm text-gray-500">ระบบบันทึกเวลาทำงานด้วยการสแกนใบหน้า</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm text-gray-800 font-semibold text-sm">
                            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                            <span>{currentTime.toLocaleTimeString()}</span>
                            <span className="text-gray-300 hidden sm:inline">|</span>
                            <span className="text-gray-500 text-xs hidden sm:inline">
                                {currentTime.toLocaleDateString('th-TH', { 
                                    weekday: 'long', 
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </>
                )}
            </div>
            
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-lg p-6 max-md:p-4">
                {/* User Location Info */}
                <div className="flex flex-row max-md:flex-col items-center max-md:items-start justify-between mb-3">
                    <p className="text-gray-700 max-md:text-sm">
                        <MapPin className="inline w-5 h-5 max-md:w-4 max-md:h-4 mb-1 mr-[2px] text-indigo-700" />
                        <span>Current Location:</span>
                        <span className="max-md:hidden font-bold ml-2">
                            {location?.latitude}, {location?.longitude}
                        </span>
                        <span className="hidden max-md:inline max-md:text-xs font-bold ml-2">
                            {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
                        </span>
                    </p>
                    <p className="text-gray-700 max-md:text-sm">
                        {distance > 500 
                            ? <NavigationOff className="inline w-5 h-5 max-md:w-4 max-md:h-4 mb-1 mr-[2px] text-red-500" />
                            : <Navigation className="inline w-5 h-5 max-md:w-4 max-md:h-4 mb-1 mr-[2px] text-indigo-700" />
                        }
                        <span>Distance to Office:</span>
                        <span className={`${distance > 500 ? 'text-red-500' : 'text-green-500'} font-bold ml-2`}>
                            {distance.toFixed(2)}
                        </span> meters
                    </p>
                </div>

                {/* CheckIn Component */}
                <CheckIn distance={distance} />
            </div>
        </div>
    );
}