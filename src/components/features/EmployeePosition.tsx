import React from 'react'

const EmployeePosition = ({ employee }) => {
    return <span>{employee.position?.name}{employee.level ? employee.level?.name : ''}</span>;
}

export default EmployeePosition