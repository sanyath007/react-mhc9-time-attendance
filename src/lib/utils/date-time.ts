// ============================================
// DateTime Utility Functions
// ============================================

import moment from "moment";
import { MONTH_TH_NAMES, MONTH_TH_SHNAMES } from "../constants/date-time";

export const formatThaiDate = (dateStr: string, includeTime = false): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate();
    const month = MONTH_TH_NAMES[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    if (includeTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    }
    
    return `${day} ${month} ${year}`;
};

export const formatThaiDateShort = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate();
    const month = MONTH_TH_SHNAMES[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    return `${day} ${month} ${year}`;
};

export const isFutureDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date > today;
};

export const isTodayInBangkok = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
};

/**
 * ====================================================================
 * Note: The following functions are used in the Calendar component 
 * and may be useful for other date manipulations.
 * ====================================================================
 */
export function startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0,0,0,0);

    return x;
}

export function sameDay(a: Date | null, b: Date | null) {
    return a && b
        && a.getFullYear() === b.getFullYear()
        && a.getMonth()    === b.getMonth()
        && a.getDate()     === b.getDate();
}

export function diffDays(a: Date | null, b: Date | null) {
    if (!a || !b) return 0;

    return moment(b).startOf("day").diff(moment(a).startOf("day"), "days") + 1;
}

export function fmt(date: Date | null, opts: any = { day: "2-digit", month: "short", year: "numeric" }) {
    return date ? date.toLocaleDateString("th-TH", opts) : "";
}

export function getDaysInMonth(y: any, m: any) {
    return new Date(y, m+1, 0).getDate();
}

export function getFirstDayOfMonth(y: any, m: any) {
    return new Date(y, m, 1).getDay();
}


export const toShortTHDate = (dateStr: string) => {
    if (!dateStr || dateStr === '') return '';

    const [year, month, day] = dateStr.split('-');

    return `${day}/${month}/${parseInt(year, 10) + 543}`;
};

export const toLongTHDate = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export const toLongTHDateWithBE = (dateStr: string) => {
    if (!dateStr || dateStr === '') return '';

    const [year, month, day] = dateStr.split('-');

    return `${day} ${MONTH_TH_NAMES[parseInt(month) - 1]} พ.ศ. ${parseInt(year, 10) + 543}`;
}

/**
 * Returns date in YYYY-MM-DD format (local time)
 */
export const toISODateString = (date: Date | null): string => {
    if (!date) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};