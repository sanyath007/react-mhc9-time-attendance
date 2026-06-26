import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import moment from 'moment';
import { cn } from '../../../lib/utils/tailwindcss';
import { calculateAge } from '../../../lib/utils/calculation';
import {
    formatThaiDateShort,
    isFutureDate,
    isTodayInBangkok
} from '../../../lib/utils/date-time';
import { MONTH_TH_NAMES, DAY_NAMES } from '../../../lib/constants/date-time';
import ErrorMessage from './ErrorMessage';

// ============================================
// Types
// ============================================
export interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    minDate?: string;
    maxDate?: string;
    icon?: React.ReactNode;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    enableTime?: boolean;
    showAge?: boolean;
    className?: string;
    inputCss?: string;
}

// ============================================
// DatePicker Component
// ============================================

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = 'เลือกวันที่',
    label,
    error,
    icon,
    disabled = false,
    minDate,
    maxDate,
    disablePastDates = false,
    disableFutureDates = false,
    enableTime = false,
    showAge = false,
    className,
    inputCss
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(() => {
        if (value) return value.split('T')[0];
        return new Date().toISOString().split('T')[0];
    });
    const [selectedTime, setSelectedTime] = useState({ hours: '08', minutes: '00' });
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [position, setPosition] = useState({ top: 0, left: 0, direction: 'bottom' as 'top' | 'bottom' });
    const [mounted, setMounted] = useState(false);
    
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Mount check for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize time from value
    useEffect(() => {
        if (enableTime && value && value.includes('T')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            setSelectedTime({
            hours: date.getHours().toString().padStart(2, '0'),
            minutes: date.getMinutes().toString().padStart(2, '0')
            });
        }
        }
    }, [value, enableTime]);

    // Update calendar view when value changes
    useEffect(() => {
        if (value) {
            setCalendarViewDate(value.split('T')[0]);
        }
    }, [value]);

    // Calculate position
    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = enableTime ? 520 : 420;
        const dropdownWidth = 320;
        const gap = 4; // Narrowed gap
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
        
        // Align to bottom-left (rect.left) first.
        // If container is next to the right edge (overflows on the right), align dropdown right edge with trigger right edge.
        let left = rect.left;
        if (rect.left + dropdownWidth > window.innerWidth - edgePadding) {
            left = rect.right - dropdownWidth;
        }
        
        // Fallback constraint to prevent overflowing left edge
        if (left < edgePadding) {
            left = edgePadding;
        }
        
        setPosition({ top, left, direction });
    }, [enableTime]);

    // Update position on open and scroll/resize
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

    // Close on click outside
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

    // Check if date is disabled
    const isDateDisabled = (dateStr: string): boolean => {
        const today = new Date().toISOString().split('T')[0];
        
        if (disablePastDates && dateStr < today) return true;
        if (disableFutureDates && isFutureDate(dateStr)) return true;
        if (minDate && dateStr < minDate) return true;
        if (maxDate && dateStr > maxDate) return true;
        
        return false;
    };

    // Generate calendar
    const generateCalendar = () => {
        const [year, month] = calendarViewDate.split('-').map(Number);
        const firstDay = new Date(selectedYear, month - 1, 1);
        const lastDay = new Date(selectedYear, month, 0);

        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
        
        const weeks = [];
        const current = new Date(startDate);
        
        while (current <= endDate) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                week.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            weeks.push(week);
        }
        
        return { weeks, currentMonth: month - 1, currentYear: selectedYear };
    };

    // Navigate months
    const navigateMonth = (direction: 'prev' | 'next') => {
        const date = moment(calendarViewDate);
        if (direction === 'prev') {
            date.add(-1, "month")
        } else {
            date.add(1, "month")
        }
        setSelectedYear(date.year())
        setCalendarViewDate(date.format('YYYY-MM-DD'));
    };

    // Select date
    const selectDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (isDateDisabled(dateStr)) return;

        if (enableTime) {
            const dateTimeStr = `${dateStr}T${selectedTime.hours}:${selectedTime.minutes}:00.000Z`;
            onChange(dateTimeStr);
        } else {
            onChange(dateStr);
            setIsOpen(false);
        }
    };

    // Handle time selection
    const handleTimeSelect = (hours: string, minutes: string) => {
        setSelectedTime({ hours, minutes });
        
        if (value) {
            const baseDate = value.split('T')[0];
            const dateTimeStr = `${baseDate}T${hours}:${minutes}:00.000Z`;
            onChange(dateTimeStr);
        }
    };

    const { weeks, currentMonth } = generateCalendar();

    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minuteOptions = ['00', '15', '30', '45'];

    // Dropdown content
    const dropdownContent = (
        <div
            ref={dropdownRef}
            className={cn(
                'fixed z-[9999] w-80 rounded-3xl overflow-hidden border border-gray-150 shadow-2xl bg-white',
                'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="text-center">
                    <h3 className="font-bold text-gray-800 flex items-center justify-center gap-2">
                        <span>{MONTH_TH_NAMES[currentMonth]}</span>
                        <input
                            type="number"
                            value={selectedYear + 543}
                            onChange={(e) => {
                                const newYear = parseInt(e.target.value) - 543;
                                if (!isNaN(newYear)) {
                                    const date = moment(calendarViewDate);
                                    const newDate = `${newYear}-${(date.month() + 1).toString().padStart(2, '0')}-${date.date().toString().padStart(2, '0')}`;
                                    setSelectedYear(newYear);
                                    setCalendarViewDate(newDate);
                                }
                            }}
                            className="w-20 text-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-gray-800"
                        />
                    </h3>
                    {value && (
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                            {formatThaiDateShort(value)}
                            {showAge && ` (${calculateAge(value)} ปี)`}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 px-4 py-2">
                {DAY_NAMES.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            'text-center text-[10px] font-black uppercase tracking-widest py-1',
                            index === 0 ? 'text-rose-500' : 'text-gray-500'
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="px-4 pb-4 space-y-1">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((date, dayIndex) => {
                            const isCurrentMonth = date.getMonth() === currentMonth;
                            const year = date.getFullYear();
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            const dateStr = `${year}-${month}-${day}`;

                            const isSelected = dateStr === (value?.split('T')[0]);
                            const isToday = isTodayInBangkok(dateStr);
                            const isDisabled = isDateDisabled(dateStr);
                            const isSunday = dayIndex === 0;

                            return (
                                <button
                                    key={dayIndex}
                                    type="button"
                                    onClick={() => !isDisabled && selectDate(date)}
                                    disabled={isDisabled}
                                    className={cn(
                                        'w-9 h-9 text-sm rounded-xl transition-all duration-200 font-bold relative flex items-center justify-center',
                                        isDisabled && 'text-gray-200 cursor-not-allowed',
                                        !isDisabled && isSelected && 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105 z-10',
                                        !isDisabled && !isSelected && isToday && 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20',
                                        !isDisabled && !isSelected && !isToday && isCurrentMonth && isSunday && 'text-rose-500 hover:bg-gray-50',
                                        !isDisabled && !isSelected && !isToday && isCurrentMonth && !isSunday && 'text-gray-700 hover:bg-gray-50',
                                        !isDisabled && !isSelected && !isToday && !isCurrentMonth && 'text-gray-300 hover:bg-gray-50/50',
                                    )}
                                >
                                    {date.getDate()}
                                    {!isDisabled && isToday && (
                                        <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${!isSelected ? "bg-indigo-600" : "bg-white"}`}></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Time picker */}
            {enableTime && (
                <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">เลือกเวลา</label>
                        <Clock size={14} className="text-gray-400" />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedTime.hours}
                            onChange={(e) => handleTimeSelect(e.target.value, selectedTime.minutes)}
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-center font-mono font-bold text-gray-700 cursor-pointer"
                        >
                            {hourOptions.map(hour => (
                                <option key={hour} value={hour}>{hour}</option>
                            ))}
                        </select>
                        <span className="self-center text-gray-400 font-bold">:</span>
                        <select
                            value={selectedTime.minutes}
                            onChange={(e) => handleTimeSelect(selectedTime.hours, e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-center font-mono font-bold text-gray-700 cursor-pointer"
                        >
                            {minuteOptions.map(minute => (
                                <option key={minute} value={minute}>{minute}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        if (!isDateDisabled(todayStr)) {
                            selectDate(today);
                        }
                    }}
                    disabled={isDateDisabled(new Date().toISOString().split('T')[0])}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    วันนี้
                </button>

                <div className="flex gap-2">
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
                        >
                            ล้าง
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-1.5 text-xs font-bold bg-white text-gray-600 hover:text-gray-800 rounded-lg border border-gray-250 hover:bg-gray-50 uppercase tracking-wider transition-all shadow-sm"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn('relative', className)}>
            {label && (
                <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
            )}
            
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    'flex items-center justify-between gap-2 text-left transition-all w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500',
                    inputCss,
                    isOpen && 'ring-2 ring-indigo-500/10 border-indigo-500 bg-white shadow-md',
                    error ? 'border-rose-300 bg-rose-50/30' : '',
                    disabled && 'opacity-60 cursor-not-allowed'
                )}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Calendar size={18} className={cn(
                        'shrink-0',
                        value ? 'text-indigo-600 font-bold animate-pulse' : 'text-gray-400'
                    )} />
                    <span className={cn(
                        'truncate',
                        value ? 'text-gray-800 font-bold' : 'text-gray-400'
                    )}>
                        {value ? formatThaiDateShort(value) : placeholder}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    {showAge && value && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-md border border-indigo-100 shadow-sm">
                            {calculateAge(value)} ปี
                        </span>
                    )}
                    <ChevronRight size={16} className={cn(
                        'text-gray-400 transition-transform duration-200',
                        isOpen && 'rotate-90 text-indigo-600'
                    )} />
                </div>
            </button>
            
            {error && <ErrorMessage message={error} className='mt-1.5 px-1' />}

            {/* Portal Dropdown */}
            {mounted && isOpen && createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default DatePicker;
