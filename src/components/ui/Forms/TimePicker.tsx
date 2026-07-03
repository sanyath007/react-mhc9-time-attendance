import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { cn } from '../../../lib/utils/tailwindcss';
import ErrorMessage from './ErrorMessage';

export interface TimePickerProps {
    value?: string;
    onChange: (time: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    use24Hour?: boolean;
    showSeconds?: boolean;
    className?: string;
    inputCss?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
    value,
    onChange,
    placeholder = 'ระบุเวลา',
    label,
    error,
    disabled = false,
    use24Hour = true,
    showSeconds = false,
    className,
    inputCss
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, direction: 'bottom' as 'top' | 'bottom' });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [selectedHour, setSelectedHour] = useState('12');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [selectedSecond, setSelectedSecond] = useState('00');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    // Init mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync value to state
    useEffect(() => {
        if (value) {
            const parts = value.split(':');
            let h = parseInt(parts[0] || '0', 10);
            const m = (parts[1] || '00').padStart(2, '0');
            const s = (parts[2] || '00').padStart(2, '0');

            if (!use24Hour) {
                setPeriod(h >= 12 ? 'PM' : 'AM');
                h = h % 12;
                if (h === 0) h = 12;
            }
            setSelectedHour(h.toString().padStart(2, '0'));
            setSelectedMinute(m);
            setSelectedSecond(s);
        } else {
            // Default to current time if no value when opened
            const now = new Date();
            let h = now.getHours();
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            if (!use24Hour) {
                setPeriod(h >= 12 ? 'PM' : 'AM');
                h = h % 12;
                if (h === 0) h = 12;
            }
            setSelectedHour(h.toString().padStart(2, '0'));
            setSelectedMinute(m);
            setSelectedSecond(s);
        }
    }, [value, use24Hour, isOpen]);

    // Positioning logic
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 220; // Approx height
        const dropdownWidth = showSeconds ? 280 : (use24Hour ? 220 : 260);
        const gap = 4;
        const edgePadding = 8;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top: number;
        let direction: 'top' | 'bottom';

        if (spaceBelow >= dropdownHeight + gap || spaceBelow >= spaceAbove) {
            top = rect.bottom + gap;
            direction = 'bottom';
        } else {
            top = rect.top - dropdownHeight - gap;
            direction = 'top';
        }

        let left = rect.left;
        if (rect.left + dropdownWidth > window.innerWidth - edgePadding) {
            left = rect.right - dropdownWidth;
        }

        if (left < edgePadding) left = edgePadding;

        setPosition({ top, left, direction });
    }, [showSeconds, use24Hour]);

    useEffect(() => {
        if (!isOpen) return;

        updatePosition();
        const handleUpdate = () => updatePosition();
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);

        return () => {
            window.removeEventListener('scroll', handleUpdate, true);
            window.removeEventListener('resize', handleUpdate);
        };
    }, [isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleConfirm = () => {
        let hour24 = parseInt(selectedHour, 10);
        if (!use24Hour) {
            if (period === 'PM' && hour24 < 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;
        }
        const hourStr = hour24.toString().padStart(2, '0');
        const timeStr = showSeconds ? `${hourStr}:${selectedMinute}:${selectedSecond}` : `${hourStr}:${selectedMinute}`;
        onChange(timeStr);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange('');
        setIsOpen(false);
    };

    const hourOptions = Array.from({ length: use24Hour ? 24 : 12 }, (_, i) => {
        const val = use24Hour ? i : i + 1;
        return val.toString().padStart(2, '0');
    });
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const secondOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    let displayValue = '';
    if (value) {
        const parts = value.split(':');
        let h = parseInt(parts[0] || '0', 10);
        const m = (parts[1] || '00').padStart(2, '0');
        const s = (parts[2] || '00').padStart(2, '0');
        let p = '';

        if (!use24Hour) {
            p = h >= 12 ? ' PM' : ' AM';
            h = h % 12;
            if (h === 0) h = 12;
        }
        const hourStr = h.toString().padStart(2, '0');
        displayValue = showSeconds ? `${hourStr}:${m}:${s}${p}` : `${hourStr}:${m}${p}`;
    }

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className={cn(
                'fixed z-[9999] rounded-xl overflow-hidden border border-gray-150 shadow-2xl bg-white',
                'animate-in fade-in-0 zoom-in-95 duration-150',
                showSeconds ? 'w-80' : (use24Hour ? 'w-48' : 'w-64')
            )}
            style={{ top: position.top, left: position.left }}
        >
            {/* Header */}
            <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" />
                <h3 className="font-bold text-gray-800 text-sm tracking-wide">เลือกเวลา</h3>
            </div>

            {/* Body */}
            <div className="p-2 flex gap-2 justify-center items-center h-40">
                <div className="flex flex-col items-center gap-1 flex-1 h-full">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">ชั่วโมง</span>
                    <select
                        size={5}
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                        className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg text-center font-mono font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer overflow-y-auto"
                    >
                        {hourOptions.map(h => <option key={h} value={h} className="py-1">{h}</option>)}
                    </select>
                </div>
                <span className="text-gray-400 font-bold self-center mt-3 shrink-0">:</span>
                <div className="flex flex-col items-center gap-1 flex-1 h-full">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">นาที</span>
                    <select
                        size={5}
                        value={selectedMinute}
                        onChange={(e) => setSelectedMinute(e.target.value)}
                        className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg text-center font-mono font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer overflow-y-auto"
                    >
                        {minuteOptions.map(m => <option key={m} value={m} className="py-1">{m}</option>)}
                    </select>
                </div>
                {showSeconds && (
                    <>
                        <span className="text-gray-400 font-bold self-center mt-3 shrink-0">:</span>
                        <div className="flex flex-col items-center gap-1 flex-1 h-full">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">วินาที</span>
                            <select
                                size={5}
                                value={selectedSecond}
                                onChange={(e) => setSelectedSecond(e.target.value)}
                                className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg text-center font-mono font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer overflow-y-auto"
                            >
                                {secondOptions.map(s => <option key={s} value={s} className="py-1">{s}</option>)}
                            </select>
                        </div>
                    </>
                )}
                {!use24Hour && (
                    <div className="flex flex-col items-center gap-1 flex-1 h-full">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">AM/PM</span>
                        <select
                            size={5}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')}
                            className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg text-center font-mono font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer overflow-y-auto"
                        >
                            <option value="AM" className="py-2">AM</option>
                            <option value="PM" className="py-2">PM</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
                >
                    ล้าง
                </button>
                <div className="flex gap-2">
                    {/* <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-1.5 text-xs font-bold bg-white text-gray-600 hover:text-gray-800 rounded-lg border border-gray-250 hover:bg-gray-50 uppercase tracking-wider transition-all shadow-sm"
                    >
                        ยกเลิก
                    </button> */}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 uppercase tracking-wider transition-all"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn('relative', className)}>
            {label && (
                <label className="block text-xs font-bold text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <button
                ref={triggerRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    'flex items-center justify-between gap-2 transition-all w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-[38px]',
                    inputCss,
                    isOpen && 'ring-2 ring-blue-500/20 border-blue-500 shadow-sm',
                    error ? 'border-rose-300 bg-rose-50/30' : '',
                    disabled && 'opacity-60 cursor-not-allowed bg-gray-50 text-gray-400'
                )}
            >
                <span className={cn('truncate font-mono text-base font-semibold', displayValue ? 'text-gray-800' : 'text-gray-400')}>
                    {displayValue || placeholder}
                </span>
                <Clock size={16} className={cn('shrink-0 transition-colors', isOpen ? 'text-blue-500' : 'text-gray-400')} />
            </button>

            {error && <ErrorMessage message={error} className="mt-1.5 px-1" />}

            {mounted && isOpen && createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default TimePicker;
