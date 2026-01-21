import React, { ChangeEvent, useState } from 'react'
import { AttendanceFilters } from '../../lib/constants';

type FilteringInputsProps = {
    initialValues: AttendanceFilters;
    onFilter?: (filters: AttendanceFilters) => void;
}

const FliteringInputs = ({ initialValues, onFilter }: FilteringInputsProps) => {
    const [filters, setFilters] = useState<AttendanceFilters>(initialValues);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
        onFilter({ ...filters, [e.target.name]: e.target.value })
    }

    return (
        <div className='border rounded-md p-4'>
            <div className='flex flex-row items-center space-x-2 text-base'>
                <label htmlFor="">วันที่</label>
                <input
                    type="date"
                    name="toDay"
                    value={filters.toDay}
                    onChange={handleChange}
                    className='border py-1 px-4 rounded-full'
                />
            </div>
        </div>
    )
}

export default FliteringInputs