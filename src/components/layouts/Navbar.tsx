import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, Menu, X, ChevronDown, Home, FolderKanban, Users, Mail, History, CalendarClock, ListTodo, CircleCheckBig, ChartColumn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import EmployeeAvatar from '../features/EmployeeAvatar';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileDropdown, setActiveMobileDropdown] = useState<number | null>(null);

    const isPathActive = (href?: string) => {
        if (!href) return false;
        if (href === '/') return location.pathname === '/';
        return location.pathname === href || location.pathname.startsWith(`${href}/`);
    };

    const isMenuOrDropdownActive = (menu: any) => {
        if (menu.href) return isPathActive(menu.href);
        if (menu.dropdown) return menu.dropdown.some((item: any) => isPathActive(item.href));
        return false;
    };
    const { user, logout } = useAuth();
    const userMenuRef = useRef<HTMLDivElement | null>(null); // User menu
    const canAccessEmployee = user?.permissions?.[0]?.role_id === 1 || user?.permissions?.[0]?.role_id === 7;
    const isApproverRole = user?.permissions?.[0]?.role_id === 7;
    const navMenuRef = useRef<HTMLDivElement | null>(null);

    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            /** Main menu */
            if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }

            /** User menu */
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userMenus = [
        {
            label: 'โปรไฟล์',
            icon: User,
            href: '/profile',
            action: () => navigate('/profile')
        },
        {
            label: 'ตั้งค่า',
            icon: Settings,
            href: '/settings',
            action: () => {
                navigate('/settings');
                console.log('Navigate to Settings');
            }
        },
        {
            label: 'ออกจากระบบ',
            icon: LogOut,
            action: () => {
                logout();
                navigate('/login');
            },
            danger: true
        }
    ];

    // Navigation menu items with dropdowns
    const navMenus = [
        {
            label: 'หน้าแรก',
            href: '/',
            icon: Home
        },
        {
            label: 'บันทึกเวลาทำงาน',
            icon: FolderKanban,
            dropdown: [
                { label: 'ลงเวลาทำงาน', href: '/attendance/check-in', icon: History },
                { divider: true },
                { label: 'รายการลงเวลา', href: '/attendance/daily', icon: CalendarClock, highlight: false },
                ...(isApproverRole ? [
                    { divider: true },
                    { label: 'ตรวจสอบข้อมูล (HR)', href: '/attendance/hr-review', icon: ListTodo },
                    { divider: true },
                    { label: 'อนุมัติการลงเวลา (ผอ.)', href: '/attendance/director-approval', icon: CircleCheckBig || History },
                    { divider: true },
                    { label: 'รายงานสรุปยอด', href: '/attendance/summary', icon: ChartColumn || History }
                ] : [])
            ]
        },
        ...(canAccessEmployee ? [{
            label: 'บุคลากร',
            icon: User,
            dropdown: [
                { label: 'บุคลากรทั้งหมด', href: '/employee', icon: Users },
                // { label: 'สินค้ามาใหม่', href: '#', icon: Users  },
                // { label: 'สินค้าแนะนำ', href: '#', icon: Users  },
                // { divider: true },
                // { label: 'หมวดหมู่สินค้า', href: '#', icon: Users  }
            ]
        }] : []),
        {
            label: 'ติดต่อเรา',
            href: '/contact',
            icon: Mail
        }
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                MHC9
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block ml-10" ref={navMenuRef}>
                            <div className="flex items-center space-x-1">
                                {navMenus.map((menu, index) => (
                                    <div key={index} className="relative">
                                        {menu.dropdown ? (
                                            // Menu with dropdown
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                                                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium group ${isMenuOrDropdownActive(menu)
                                                    ? 'text-blue-600 bg-blue-50'
                                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {menu.icon && <menu.icon className="w-4 h-4" />}
                                                <span>{menu.label}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`} />
                                            </button>
                                        ) : (
                                            // Simple link
                                            <Link
                                                to={menu.href}
                                                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isPathActive(menu.href)
                                                    ? 'text-blue-600 bg-blue-50'
                                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {menu.icon && <menu.icon className="w-4 h-4" />}
                                                <span>{menu.label}</span>
                                            </Link>
                                        )}

                                        {/* Dropdown Menu */}
                                        {menu.dropdown && activeDropdown === index && (
                                            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {menu.dropdown.map((item, idx) => (
                                                    item.divider ? (
                                                        <div key={idx} className="my-2 border-t border-gray-100"></div>
                                                    ) : (
                                                        <Link
                                                            key={idx}
                                                            to={item.href || ''}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isPathActive(item.href)
                                                                ? 'text-blue-600 bg-blue-50 font-medium'
                                                                : item.highlight
                                                                    ? 'text-blue-600 hover:bg-blue-50 font-medium'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {item.icon && <item.icon className="w-4 h-4" />}
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side - User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Desktop User Menu */}
                        <div className="hidden md:block relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-3 focus:outline-none group"
                            >
                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <div className="relative">
                                    {user && (
                                        <EmployeeAvatar
                                            image={`${import.meta.env.VITE_API_URL}/uploads/${user?.employee?.avatar_url}`}
                                            alt={user?.name}
                                            width="40px"
                                            height="40px"
                                        />
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* User Info in Dropdown */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        {userMenus.map((item, index) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        item.action();
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors duration-150 ${item.danger
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : isPathActive(item.href)
                                                            ? 'text-blue-600 bg-blue-50 font-medium'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="font-medium">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top duration-200">
                    <div className="px-4 pt-4 pb-3 space-y-3">
                        {/* User Info Mobile */}
                        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                            {user && <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/${user?.employee?.avatar_url}`}
                                alt={user?.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                            />}
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        {/* Navigation Links Mobile */}
                        {navMenus.map((menu, index) => (
                            <div key={index}>
                                {menu.dropdown ? (
                                    <>
                                        <button
                                            onClick={() => setActiveMobileDropdown(activeMobileDropdown === index ? null : index)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-base font-medium rounded-lg transition-colors ${isMenuOrDropdownActive(menu)
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {menu.icon && <menu.icon className="w-5 h-5" />}
                                                <span>{menu.label}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMobileDropdown === index ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {menu.dropdown && activeMobileDropdown === index && (
                                            <div className="ml-4 mt-2 space-y-1">
                                                {menu.dropdown.map((item, idx) => (
                                                    item.divider ? (
                                                        <div key={idx} className="my-2 border-t border-gray-100"></div>
                                                    ) : (
                                                        <Link
                                                            key={idx}
                                                            to={item.href || ''}
                                                            onClick={() => {
                                                                setIsMobileMenuOpen(false);
                                                                setActiveMobileDropdown(null);
                                                            }}
                                                            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${isPathActive(item.href)
                                                                ? 'text-blue-600 bg-blue-50 font-medium'
                                                                : item.highlight
                                                                    ? 'text-blue-600 hover:bg-blue-50 font-medium'
                                                                    : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {item.icon && <item.icon className="w-4 h-4" />}
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={menu.href}
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setActiveMobileDropdown(null);
                                        }}
                                        className={`flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-lg transition-colors ${isPathActive(menu.href)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {menu.icon && <menu.icon className="w-5 h-5" />}
                                        <span>{menu.label}</span>
                                    </Link>
                                )}
                            </div>
                        ))}

                        {/* User Menu Mobile */}
                        <div className="pt-4 border-t border-gray-200 space-y-2">
                            {userMenus.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            item.action();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.danger
                                            ? 'text-red-600 hover:bg-red-50'
                                            : isPathActive(item.href)
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}