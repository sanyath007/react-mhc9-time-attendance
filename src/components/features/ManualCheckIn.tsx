import { useState } from 'react';
import { UserCheck, User, LogIn, LogOut, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import moment from 'moment';
import api from '../../api';
import ButtonGroupSelect from '../ui/Forms/ButtonGroupSelect';
import TimePicker from '../ui/Forms/TimePicker';
import { useAuth } from '../../hooks/useAuth';

type ManualCheckInProps = {
    distance?: number;
    location?: { latitude: number; longitude: number } | null;
};

export default function ManualCheckIn({ location }: ManualCheckInProps) {
    const { user } = useAuth();
    const employee = user?.employee;
    const selectedEmployee = employee?.id ? String(employee.id) : '';
    const employeeName = employee ? `${employee.prefix?.name || ''}${employee.firstname} ${employee.lastname}` : (user?.name || '-');
    const employeePosition = employee?.position?.name
        ? `${employee.position.name}${employee.level?.name ? ` ${employee.level.name}` : ''}`
        : '';

    const [checkInType, setCheckInType] = useState<'in' | 'out'>('in');
    const [checkInTime, setCheckInTime] = useState<string>(moment().format('HH:mm'));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
    const [showUpdateConfirm, setShowUpdateConfirm] = useState<boolean>(false);
    const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null);

    const getCheckTimeScore = (time: string) => {
        const checkTime = moment(time);
        let timeScore = 5;
        if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:00:00').toDate()) {
            timeScore = 5;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:15:00').toDate()) {
            timeScore = 4;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:30:00').toDate()) {
            timeScore = 3;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 08:45:00').toDate()) {
            timeScore = 2;
        } else if (checkTime.toDate() < moment(moment().format('YYYY-MM-DD') + ' 09:00:00').toDate()) {
            timeScore = 1;
        } else {
            timeScore = 0;
        }
        return timeScore;
    };

    const handleManualSubmit = async () => {
        if (!selectedEmployee) {
            setStatusMessage({ type: 'error', text: 'ไม่พบข้อมูลพนักงานของผู้ใช้งานนี้' });
            return;
        }

        setIsSubmitting(true);
        setStatusMessage({ type: null, text: '' });

        try {
            const date = moment().format('YYYY-MM-DD');
            const url = `/api/time-attendance/${date}/${checkInType === 'in' ? '1' : '2'}/employee/${selectedEmployee}`;
            const checkRes = await api.get(url);

            if (checkRes.data && (Array.isArray(checkRes.data) ? checkRes.data.length > 0 : Object.keys(checkRes.data).length > 0)) {
                const existingId = Array.isArray(checkRes.data) ? checkRes.data[0].id : checkRes.data.id;
                setPendingUpdateId(String(existingId));
                setShowUpdateConfirm(true);
                setIsSubmitting(false);
                return;
            }
        } catch (err) {
            console.error('Error checking existing attendance:', err);
        }

        processManualCheckIn(null);
    };

    const processManualCheckIn = async (updateAttendanceId: string | null = null) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('employee_id', selectedEmployee);
            formData.append('check_time', moment().format('YYYY-MM-DD') + ' ' + checkInTime + ':00');
            formData.append('check_type', checkInType === 'in' ? '1' : '2');
            formData.append('check_score', String(getCheckTimeScore(moment().format('YYYY-MM-DD') + ' ' + checkInTime + ':00')));
            if (location) {
                formData.append('latitude', location.latitude.toString());
                formData.append('longitude', location.longitude.toString());
            }

            const endpoint = updateAttendanceId ? `/api/time-attendance/update/${updateAttendanceId}` : '/api/time-attendance/create';
            const response = await api.post(endpoint, formData);
            if (response.status === 200 || response.statusText === 'OK') {
                setStatusMessage({ type: 'success', text: 'ลงเวลาสำเร็จ! บันทึกข้อมูลเรียบร้อยแล้ว' });
                setTimeout(() => {
                    setStatusMessage({ type: null, text: '' });
                    setShowUpdateConfirm(false);
                    setPendingUpdateId(null);
                }, 3000);
            } else {
                setStatusMessage({ type: 'error', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
            }
        } catch (err) {
            console.error('Error confirming check-in:', err);
            setStatusMessage({ type: 'error', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
        } finally {
            setIsSubmitting(false);
            setShowUpdateConfirm(false);
            setPendingUpdateId(null);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <UserCheck className="w-4.5 h-4.5 text-indigo-600" />
                        บันทึกลงเวลาแบบไม่สแกนใบหน้า
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">เลือกระบุชื่อพนักงาน ช่วงเวลา และประเภทการลงเวลา</p>
                </div>

                {/* Status Feedback Message */}
                {statusMessage.text && (
                    <div className={`border rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200 ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50/80 border-rose-200 text-rose-600'
                    }`}>
                        {statusMessage.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                        ) : (
                            <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
                        )}
                        <p className="text-xs font-semibold">{statusMessage.text}</p>
                    </div>
                )}

                {/* Form Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            ข้อมูลพนักงาน
                        </label>
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{employeeName}</p>
                                {employeePosition && (
                                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">{employeePosition}</p>
                                )}
                            </div>
                            <div className="bg-indigo-600 p-2.5 rounded-full text-white shrink-0 shadow-sm shadow-indigo-500/20">
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Check-in Form similar to CheckIn.tsx */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mx-auto w-full">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">ประเภท</label>
                                <ButtonGroupSelect
                                    options={[
                                        {
                                            value: 'in',
                                            label: 'เข้า',
                                            icon: <LogIn className={`w-4 h-4 transition-colors ${checkInType === 'in' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        },
                                        {
                                            value: 'out',
                                            label: 'ออก',
                                            icon: <LogOut className={`w-4 h-4 transition-colors ${checkInType === 'out' ? 'text-pink-500' : 'text-gray-400'}`} />
                                        }
                                    ]}
                                    value={checkInType}
                                    onChange={(val) => {
                                        const type = val as 'in' | 'out';
                                        setCheckInType(type);
                                        if (type === 'out') {
                                            setCheckInTime('16:30');
                                        } else {
                                            const now = new Date();
                                            const hours = String(now.getHours()).padStart(2, '0');
                                            const minutes = String(now.getMinutes()).padStart(2, '0');
                                            setCheckInTime(`${hours}:${minutes}`);
                                        }
                                    }}
                                    containerCss="rounded-lg h-[50px]"
                                    buttonCss="h-[34px] !py-2.5 !rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">เวลา</label>
                                <TimePicker
                                    value={checkInTime}
                                    onChange={(val) => setCheckInTime(val)}
                                    use24Hour={true}
                                    showSeconds={false}
                                    inputCss="h-[50px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleManualSubmit}
                        disabled={!selectedEmployee || isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                กำลังบันทึกข้อมูล...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                {`บันทึกเวลา${checkInType === 'in' ? 'เข้า' : 'ออก'}งาน`}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Update Confirmation Modal */}
            {showUpdateConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-50 text-amber-500 rounded-full mb-4">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                            คุณมีการลงเวลาในวันนี้แล้ว
                        </h3>
                        <p className="text-sm text-center text-gray-500 mb-6 leading-relaxed">
                            ระบบพบข้อมูลการลงเวลาสำหรับวันนี้แล้ว คุณต้องการอัปเดตข้อมูลการลงเวลาใหม่แทนข้อมูลเดิมหรือไม่?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowUpdateConfirm(false);
                                    setPendingUpdateId(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => {
                                    setShowUpdateConfirm(false);
                                    processManualCheckIn(pendingUpdateId);
                                }}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                                อัปเดตข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
