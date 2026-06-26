import { useState } from 'react'
import { type AttendanceFilters } from '../../lib/types';
import DatePicker from '../../components/ui/Forms/DatePicker';

type FilteringInputsProps = {
    initialValues: AttendanceFilters;
    onFilter?: (filters: AttendanceFilters) => void;
}

const FliteringInputs = ({ initialValues, onFilter }: FilteringInputsProps) => {
    const [filters, setFilters] = useState<AttendanceFilters>(initialValues);

    const handleDateChange = (date: string) => {
        const nextFilters = { ...filters, toDay: date };
        setFilters(nextFilters);
        if (onFilter) {
            onFilter(nextFilters);
        }
    }

    return (
        <div className="w-full sm:w-60">
            <DatePicker
                value={filters.toDay}
                onChange={handleDateChange}
                placeholder="เลือกวันที่"
                inputCss="py-2.5 bg-gray-50 border-gray-200 focus:bg-white rounded-xl text-sm font-semibold transition-all text-gray-700 cursor-pointer"
            />
        </div>
    )
}

export default FliteringInputs