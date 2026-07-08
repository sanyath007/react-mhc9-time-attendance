import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

export interface MenuItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}

interface ActionMenuProps {
    items: MenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleClose = () => {
            setIsOpen(false);
            setMenuPosition(null);
        };

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Don't close if clicking inside the portal menu
            if (target.closest(".portal-menu")) return;

            if (triggerRef.current && !triggerRef.current.contains(target)) {
                handleClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleClose, true);
        window.addEventListener("resize", handleClose);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleClose, true);
            window.removeEventListener("resize", handleClose);
        };
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOpen) {
            setIsOpen(false);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right - 192
            });
            // We use fixed positioning, so we need to adjust for scroll if we use fixed
            // Actually, if we use fixed z-[999], we should use rect.bottom + 8 without window.scrollY
            // but the rect is relative to viewport.
            setMenuPosition({
                top: rect.bottom + 8,
                left: rect.right - 192
            });
            setIsOpen(true);
        }
    };

    if (!mounted) return (
        <div className="flex justify-end">
            <button className="p-2 rounded-xl bg-muted text-muted-foreground opacity-50">
                <MoreVertical size={18} />
            </button>
        </div>
    );

    return (
        <div className="relative menu-container flex justify-end">
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className={`p-2 rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${isOpen ? "bg-brand-600 text-white" : "bg-slate-100 hover:bg-brand-600 text-slate-600 hover:text-white"
                    }`}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && menuPosition && createPortal(
                <div
                    className="fixed z-[999] w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in duration-200 origin-top-right portal-menu"
                    style={{
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map((item, index) => {
                        const baseClasses = "flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors w-full text-left";
                        const borderClass = index > 0 ? "border-t border-slate-100" : "";
                        const variantClass = item.variant === 'danger' ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50";

                        const itemContent = (
                            <>
                                {item.icon}
                                {item.label}
                            </>
                        );

                        if (item.href) {
                            return (
                                <Link
                                    key={index}
                                    to={item.href}
                                    className={`${baseClasses} ${borderClass} ${variantClass}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {itemContent}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick?.();
                                    setIsOpen(false);
                                }}
                                className={`${baseClasses} ${borderClass} ${variantClass} cursor-pointer`}
                            >
                                {itemContent}
                            </button>
                        );
                    })}
                </div>,
                document.body
            )}
        </div>
    );
}
