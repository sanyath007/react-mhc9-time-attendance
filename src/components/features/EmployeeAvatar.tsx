import React from 'react'

const EmployeeAvatar = ({ image, alt='employee-pic', width='40px', height='40px' }) => {
    return (
        <div
            className={`flex items-start justify-center rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all duration-200`}
            style={{ width: width, height: height }}
        >
            <img
                src={image}
                alt={alt}
                className="w-full object-contain"
            />
        </div>
    )
}

export default EmployeeAvatar