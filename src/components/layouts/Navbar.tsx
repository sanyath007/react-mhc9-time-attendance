import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Menu, X, ChevronDown, Home, FolderKanban, Users, Mail, FileText, ShoppingCart } from 'lucide-react';

export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const userMenuRef = useRef(null); // User menu
    const navMenuRef = useRef(null);

    // ข้อมูล user (ในกรณีจริงจะมาจาก authentication state)
    const user = {
        name: 'สมชาย ใจดี',
        email: 'somchai@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=somchai'
    };

    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            /** Main menu */
            if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }

            /** User menu */
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userMenus = [
        { icon: User, label: 'โปรไฟล์', action: () => console.log('Navigate to Profile') },
        { icon: Settings, label: 'ตั้งค่า', action: () => console.log('Navigate to Settings') },
        { icon: LogOut, label: 'ออกจากระบบ', action: () => console.log('Logout'), danger: true }
    ];

    // Navigation menu items with dropdowns
    const navMenus = [
        {
            label: 'หน้าแรก',
            href: '/',
            icon: Home
        },
        {
            label: 'ลงเวลาทำงาน',
            icon: FolderKanban,
            dropdown: [
                { label: 'ลงเวลาทำงาน', href: '/check-in', icon: FolderKanban },
                { label: 'โปรเจกต์ของฉัน', href: '#', icon: User },
                { label: 'โปรเจกต์ที่แชร์', href: '#', icon: Users },
                { divider: true },
                { label: 'สร้างโปรเจกต์ใหม่', href: '#', icon: FileText, highlight: true }
            ]
        },
        {
            label: 'บุคลากร',
            icon: Users,
            dropdown: [
                { label: 'บุคลากรทั้งหมด', href: '/employee' },
                { label: 'สินค้ามาใหม่', href: '#' },
                { label: 'สินค้าแนะนำ', href: '#' },
                { divider: true },
                { label: 'หมวดหมู่สินค้า', href: '#' }
            ]
        },
        {
            label: 'ติดต่อเรา',
            href: '#',
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
                                                className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-medium group"
                                            >
                                                {menu.icon && <menu.icon className="w-4 h-4" />}
                                                <span>{menu.label}</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`} />
                                            </button>
                                        ) : (
                                            // Simple link
                                            <a
                                                href={menu.href}
                                                className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-medium"
                                            >
                                                {menu.icon && <menu.icon className="w-4 h-4" />}
                                                <span>{menu.label}</span>
                                            </a>
                                        )}

                                        {/* Dropdown Menu */}
                                        {menu.dropdown && activeDropdown === index && (
                                            <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {menu.dropdown.map((item, idx) => (
                                                    item.divider ? (
                                                        <div key={idx} className="my-2 border-t border-gray-100"></div>
                                                    ) : (
                                                        <a
                                                            key={idx}
                                                            href={item.href}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                                                                item.highlight
                                                                ? 'text-blue-600 hover:bg-blue-50 font-medium'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {item.icon && <item.icon className="w-4 h-4" />}
                                                            <span>{item.label}</span>
                                                        </a>
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
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <div className="relative">
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all duration-200"
                                    />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* User Info in Dropdown */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
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
                                            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                                                item.danger
                                                ? 'text-red-600 hover:bg-red-50'
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
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full ring-2 ring-gray-200"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        {/* Navigation Links Mobile */}
                        {navMenus.map((menu, index) => (
                            <div key={index}>
                                {menu.dropdown ? (
                                    <>
                                        <button
                                        onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                        <div className="flex items-center space-x-2">
                                            {menu.icon && <menu.icon className="w-5 h-5" />}
                                            <span>{menu.label}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`} />
                                        </button>
                                        {activeDropdown === index && (
                                            <div className="ml-4 mt-2 space-y-1">
                                                {menu.dropdown.map((item, idx) => (
                                                    item.divider ? (
                                                        <div key={idx} className="my-2 border-t border-gray-100"></div>
                                                    ) : (
                                                        <a
                                                            key={idx}
                                                            href={item.href}
                                                            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                                                item.highlight
                                                                ? 'text-blue-600 hover:bg-blue-50 font-medium'
                                                                : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {item.icon && <item.icon className="w-4 h-4" />}
                                                            <span>{item.label}</span>
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <a
                                        href={menu.href}
                                        className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        {menu.icon && <menu.icon className="w-5 h-5" />}
                                        <span>{menu.label}</span>
                                    </a>
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
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                item.danger
                                    ? 'text-red-600 hover:bg-red-50'
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