import { useEffect, useState, useMemo } from "react"
import {
    ScanFace,
    SquarePen,
    PlusCircle,
    Search,
    Grid,
    List as ListIcon,
    Users,
    UserCheck,
    UserX,
    Phone,
    Mail,
    RotateCcw,
    ToggleLeft,
    ToggleRight,
    UserRound
} from "lucide-react"
import { Link } from "react-router-dom";
import api from "../../api";
import EmployeePosition from "../../components/features/EmployeePosition";
import EmployeeAvatar from "../../components/features/EmployeeAvatar";
import { type Employee } from "../../lib/types";
import { Pagination } from "../../components/ui/Pagination";

export default function EmployeeList() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showActiveOnly, setShowActiveOnly] = useState<boolean>(() => {
        const saved = localStorage.getItem("employee_active_only");
        return saved !== null ? saved === 'true' : true;
    });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        const saved = localStorage.getItem("employee_view_mode");
        return (saved === 'list' || saved === 'grid') ? saved : 'grid';
    });

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = viewMode === 'grid' ? 9 : 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, showActiveOnly]);

    const toggleActiveOnly = () => {
        const newValue = !showActiveOnly;
        setShowActiveOnly(newValue);
        localStorage.setItem("employee_active_only", String(newValue));
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/employees`);
                if (res.status === 200) {
                    setEmployees(res.data);
                }
            } catch (err) {
                console.error("Error fetching employees:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    const toggleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem("employee_view_mode", mode);
    };

    // Filter active employees (status === 1)
    const activeEmployees = useMemo(() => {
        return showActiveOnly ? employees.filter((e) => e.status === 1) : employees;
    }, [employees, showActiveOnly]);

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const total = activeEmployees.length;
        const registered = activeEmployees.filter(e => !!e.face_descriptor).length;
        const pending = total - registered;
        return { total, registered, pending };
    }, [activeEmployees]);

    // Search and Filter Logic
    const filteredEmployees = useMemo(() => {
        return activeEmployees.filter((employee) => {
            // Search text match
            const fullName = `${employee.firstname || ''} ${employee.lastname || ''}`.toLowerCase();
            const email = (employee.email || '').toLowerCase();
            const tel = employee.tel || '';
            const position = (employee.position?.name || '').toLowerCase();
            const level = (employee.level?.name || '').toLowerCase();
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                fullName.includes(search) ||
                email.includes(search) ||
                tel.includes(search) ||
                position.includes(search) ||
                level.includes(search);

            // Status filter match
            const hasFace = !!employee.face_descriptor;
            if (statusFilter === "registered") {
                return matchesSearch && hasFace;
            } else if (statusFilter === "pending") {
                return matchesSearch && !hasFace;
            }

            return matchesSearch;
        });
    }, [activeEmployees, searchTerm, statusFilter]);

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredEmployees.slice(start, end);
    }, [filteredEmployees, currentPage]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Title Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md shadow-blue-500/20">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            รายการบุคลากร
                        </h1>
                        <p className="text-sm text-gray-500">จัดการข้อมูลและลงทะเบียนสแกนใบหน้าของพนักงานทั้งหมด</p>
                    </div>
                </div>

                <div>
                    <Link
                        to="/employee/register"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>ลงทะเบียนใหม่</span>
                    </Link>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat: Total */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 border border-indigo-100/60 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">บุคลากรทั้งหมด</p>
                        <h3 className="text-3xl font-extrabold text-indigo-950 mt-1">{loading ? '...' : stats.total}</h3>
                        <p className="text-xs text-indigo-500/80 mt-1">จำนวนพนักงานที่มีสถานะ Active</p>
                    </div>
                    <div className="bg-indigo-500/10 p-3.5 rounded-xl text-indigo-600">
                        <Users className="w-8 h-8" />
                    </div>
                </div>

                {/* Stat: Registered */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100/60 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">ลงทะเบียนใบหน้าแล้ว</p>
                        <h3 className="text-3xl font-extrabold text-emerald-950 mt-1">{loading ? '...' : stats.registered}</h3>
                        <p className="text-xs text-emerald-500/80 mt-1">พร้อมสำหรับระบบสแกนเข้างาน</p>
                    </div>
                    <div className="bg-emerald-500/10 p-3.5 rounded-xl text-emerald-600">
                        <UserCheck className="w-8 h-8" />
                    </div>
                </div>

                {/* Stat: Pending */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/60 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">รอดำเนินการสแกน</p>
                        <h3 className="text-3xl font-extrabold text-amber-950 mt-1">{loading ? '...' : stats.pending}</h3>
                        <p className="text-xs text-amber-500/80 mt-1">ยังไม่ได้ทำการลงทะเบียนใบหน้า</p>
                    </div>
                    <div className="bg-amber-500/10 p-3.5 rounded-xl text-amber-600">
                        <UserX className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Toolbar: Search, Filters, View Modes */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อ, แผนก, เบอร์โทร..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-800"
                    />
                </div>

                {/* Filters & View toggler */}
                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
                    {/* Status Filter Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-700 font-medium"
                    >
                        <option value="all">สถานะใบหน้าทั้งหมด ({stats.total})</option>
                        <option value="registered">ลงทะเบียนแล้ว ({stats.registered})</option>
                        <option value="pending">รอดำเนินการ ({stats.pending})</option>
                    </select>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    {/* Active Only Toggle */}
                    <button
                        onClick={toggleActiveOnly}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${showActiveOnly
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                        title={showActiveOnly ? "แสดงเฉพาะพนักงานที่ Active (สถานะ = 1)" : "แสดงพนักงานทั้งหมด (รวม Inactive)"}
                    >
                        {showActiveOnly ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        <span className="hidden sm:inline">{showActiveOnly ? "Active" : "ทั้งหมด"}</span>
                        <UserRound className="w-4 h-4" />
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                    {/* Grid/List Toggle */}
                    <div className="flex bg-gray-50 p-1 border border-gray-200 rounded-xl">
                        <button
                            onClick={() => toggleViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="แสดงแบบการ์ด"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => toggleViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            title="แสดงแบบรายการ"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                /* Skeleton Loader */
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center animate-pulse">
                                <div className="w-20 h-20 bg-gray-100 rounded-full mb-4"></div>
                                <div className="w-28 h-5 bg-gray-200 rounded-md mb-2"></div>
                                <div className="w-20 h-4 bg-gray-100 rounded-md mb-4"></div>
                                <div className="w-32 h-6 bg-gray-100 rounded-full mb-6"></div>
                                <div className="w-full flex gap-3 mt-auto">
                                    <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                                    <div className="h-10 bg-gray-100 rounded-xl w-10"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="w-32 h-5 bg-gray-200 rounded-md"></div>
                                    <div className="w-24 h-4 bg-gray-100 rounded-md"></div>
                                </div>
                                <div className="w-28 h-6 bg-gray-100 rounded-full"></div>
                                <div className="w-24 h-10 bg-gray-100 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                )
            ) : filteredEmployees.length === 0 ? (
                /* Empty / No Results State */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
                    <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">ไม่พบข้อมูลบุคลากร</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                        {searchTerm || statusFilter !== "all"
                            ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองตรวจสอบคำค้นหาหรือตัวกรองที่เลือกใหม่อีกครั้ง"
                            : "ระบบยังไม่มีข้อมูลบุคลากรในขณะนี้ สามารถเริ่มต้นโดยการลงทะเบียนใหม่"}
                    </p>
                    {searchTerm || statusFilter !== "all" ? (
                        <button
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>ล้างตัวกรองทั้งหมด</span>
                        </button>
                    ) : (
                        <Link
                            to="/employee/register"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/10"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>ลงทะเบียนใหม่</span>
                        </Link>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View Layout */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedEmployees.map((employee: Employee) => {
                        const isRegistered = !!employee.face_descriptor;
                        return (
                            <div
                                key={employee.id}
                                className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-150 p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
                            >
                                {/* Avatar with Ring Highlight based on status */}
                                <div className="relative mb-4">
                                    <div className={`p-1.5 rounded-full transition-all duration-300 ring-2 ${isRegistered
                                        ? 'ring-emerald-400 ring-offset-2'
                                        : 'ring-amber-400 ring-offset-2 hover:ring-indigo-400'
                                        }`}>
                                        <EmployeeAvatar
                                            image={`${import.meta.env.VITE_API_URL}/uploads/${employee?.avatar_url}`}
                                            alt={employee.firstname}
                                            width="72px"
                                            height="72px"
                                        />
                                    </div>
                                    <span className={`absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-white ${isRegistered ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                                        }`} />
                                </div>

                                {/* Employee Name */}
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                                    <Link to={`/employee/${employee.id}`} className="hover:underline">
                                        {employee.firstname} {employee.lastname}
                                    </Link>
                                </h3>

                                {/* Position Details */}
                                <div className="mt-1 text-sm text-indigo-600 font-medium bg-indigo-50/50 px-2.5 py-0.5 rounded-lg">
                                    <EmployeePosition
                                        position={employee.position}
                                        level={employee.level}
                                    />
                                </div>

                                {/* Status Tag */}
                                <div className="mt-4">
                                    {isRegistered ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                                            <UserCheck className="w-3.5 h-3.5" />
                                            ลงทะเบียนใบหน้าแล้ว
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100/60">
                                            <UserX className="w-3.5 h-3.5" />
                                            รอดำเนินการสแกน
                                        </span>
                                    )}
                                </div>

                                {/* Contacts */}
                                <div className="mt-5 pt-4 border-t border-gray-100 w-full flex flex-col gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-2 justify-center">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="truncate max-w-[200px]" title={employee.email || "ไม่มีข้อมูลอีเมล"}>
                                            {employee.email || "ไม่มีข้อมูลอีเมล"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 justify-center">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{employee.tel || "ไม่มีข้อมูลเบอร์โทร"}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex gap-2.5 w-full">
                                    <Link
                                        to={`/employee/${employee.id}/face`}
                                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${isRegistered
                                            ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:scale-[1.02]'
                                            : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-sm hover:shadow hover:scale-[1.02]'
                                            }`}
                                    >
                                        <ScanFace className="w-4 h-4" />
                                        <span>{isRegistered ? 'อัปเดตใบหน้า' : 'ลงทะเบียนใบหน้า'}</span>
                                    </Link>

                                    <Link
                                        to={`/employee/${employee.id}/edit`}
                                        className="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 hover:border-amber-300 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 hover:scale-[1.02] transition-all"
                                        title="แก้ไขข้อมูลพนักงาน"
                                    >
                                        <SquarePen className="w-4.5 h-4.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View Layout */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {paginatedEmployees.map((employee: Employee) => {
                        const isRegistered = !!employee.face_descriptor;
                        return (
                            <div
                                key={employee.id}
                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="relative">
                                        <div className={`p-0.5 rounded-full ring-2 ${isRegistered ? 'ring-emerald-300' : 'ring-amber-300'
                                            }`}>
                                            <EmployeeAvatar
                                                image={`${import.meta.env.VITE_API_URL}/uploads/${employee?.avatar_url}`}
                                                alt={employee.firstname}
                                                width="52px"
                                                height="52px"
                                            />
                                        </div>
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${isRegistered ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`} />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <Link to={`/employee/${employee.id}`} className="hover:text-blue-600 hover:underline">
                                                {employee.firstname} {employee.lastname}
                                            </Link>
                                            <span className="text-xs font-normal text-gray-300 hidden sm:inline">|</span>
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hidden sm:inline">
                                                <EmployeePosition
                                                    position={employee.position}
                                                    level={employee.level}
                                                />
                                            </span>
                                        </h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                            {employee.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    {employee.email}
                                                </span>
                                            )}
                                            {employee.tel && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {employee.tel}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                    {/* Status Badge */}
                                    <div>
                                        {isRegistered ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <UserCheck className="w-3 h-3" />
                                                ลงทะเบียนแล้ว
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                <UserX className="w-3 h-3" />
                                                รอดำเนินการ
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/employee/${employee.id}/face`}
                                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isRegistered
                                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                }`}
                                        >
                                            <ScanFace className="w-3.5 h-3.5" />
                                            <span>{isRegistered ? 'อัปเดตใบหน้า' : 'สแกนใบหน้า'}</span>
                                        </Link>

                                        <Link
                                            to={`/employee/${employee.id}/edit`}
                                            className="inline-flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-all"
                                            title="แก้ไขข้อมูล"
                                        >
                                            <SquarePen className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Component */}
            {!loading && filteredEmployees.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredEmployees.length}
                    itemsPerPage={itemsPerPage}
                />
            )}
        </div>
    )
}