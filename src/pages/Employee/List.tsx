import { useEffect, useState } from "react"
import { ScanFace, SquarePen, Trash2, UserPlus, PlusCircle } from "lucide-react"
import { Link } from "react-router-dom";
import api from "../../api";
import EmployeePosition from "../../components/features/EmployeePosition";
import EmployeeAvatar from "../../components/features/EmployeeAvatar";
import HeaderIcon from "../../components/ui/HeaderIcon";

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            const res = await api.get(`/api/employees`);
            console.log(res);

            if (res.status === 200) {
                setEmployees(res.data);
            }
        }

        fetchEmployees();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-md:p-3 max-md:mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-3 max-md:p-2  rounded-lg">
                            <HeaderIcon Icon={UserPlus} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 max-md:text-xl">รายการบุคลากร</h1>
                            <p className="text-gray-600 max-md:hidden">Employee List</p>
                        </div>
                    </div>

                    <div>
                        <a href="/employee/register" className="bg-indigo-500 hover:bg-indigo-700 px-4 py-3 max-md:px-2 max-md:py-2 rounded-full text-white font-bold hover:scale-105 flex items-center justify-center">
                            <PlusCircle className="w-5 h-5 inline mr-2 max-md:mr-0" />
                            <span className="max-md:hidden">ลงทะเบียนใหม่</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <ul className="space-y-2">
                    {employees.filter(e => e.status === 1).map(employee => (
                        <li className="border rounded-md p-2" key={employee.id}>
                            <div className="flex items-center gap-3 px-3 max-md:px-0 py-2">
                                <div className="flex max-md:flex-col items-center gap-3 w-4/5">
                                    <EmployeeAvatar
                                        image={`${process.env.REACT_APP_API_URL}/uploads/${employee?.avatar_url}`}
                                        alt={employee.firstname}
                                        width="50px"
                                        height="50px"
                                    />
                                    <div className="max-md:text-center">
                                        <p className="text-lg font-bold">{employee.firstname} {employee.lastname}</p>
                                        <p className="text-gray-600">
                                            <EmployeePosition employee={employee} />
                                        </p>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex max-md:flex-col max-md:items-center justify-end gap-2 w-1/5">
                                    <Link to={`/employee/${employee.id}/face`} className=" text-blue-500">
                                        <ScanFace />
                                    </Link>
                                    <Link to={`/employee/${employee.id}/edit`} className=" text-yellow-500">
                                        <SquarePen />
                                    </Link>
                                    {/* <a href={`/employee/${employee.id}/delete`} className=" text-red-500">
                                        <Trash2 />
                                    </a> */}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}