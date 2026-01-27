import { type EmployeePositionProps } from "../../lib/types";

const EmployeePosition = ({ position, level }: EmployeePositionProps) => {
    return <span>{position?.name}{level ? level?.name : ''}</span>;
}

export default EmployeePosition