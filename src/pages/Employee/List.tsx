import { ScanFace, SquarePen, Trash2, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import api from "../../api";
import EmployeePosition from "../../components/features/EmployeePosition";

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
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-600 p-3 rounded-lg">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">รายการบุคลากร</h1>
                            <p className="text-gray-600">Employee List</p>
                        </div>
                    </div>

                    <div>
                        <a href="/employee/register" className="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-full text-white font-bold scale-125">
                            ลงทะเบียนใหม่
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <ul className="space-y-2">
                    {employees.filter(e => e.status === 1).map(employee => (
                        <li className="border rounded-md p-2">
                            <div className="flex flex-row items-center gap-3">
                                <div>
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}/uploads/${employee?.avatar_url}`}
                                        alt={employee.firstname}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all duration-200"
                                    />
                                </div>
                                <div className="w-4/5">
                                    <p className="text-lg font-bold">{employee.firstname} {employee.lastname}</p>
                                    <p className="text-gray-600">
                                        <EmployeePosition employee={employee} />
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-row gap-2">
                                    <a href={`/employee/${employee.id}/face`} className=" text-blue-500">
                                        <ScanFace />
                                    </a>
                                    <a href={`/employee/${employee.id}/edit`} className=" text-yellow-500">
                                        <SquarePen />
                                    </a>
                                    <a href={`/employee/${employee.id}/delete`} className=" text-red-500">
                                        <Trash2 />
                                    </a>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}