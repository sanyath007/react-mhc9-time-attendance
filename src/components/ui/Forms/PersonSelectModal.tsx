"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
    Search, X, User, CreditCard, Building2, 
    Calendar, ChevronRight, ChevronLeft, Loader2, Users
} from "lucide-react";
import { calculateAge } from "@/lib/utils/calculation";

interface Person {
    pid: number;
    cid: string | null;
    prefix: string | null;
    firstname: string;
    lastname: string;
    birth_date: string | null;
    hcode: string;
    hospital: { name: string };
}

interface PersonSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (person: Person) => void;
}

export function PersonSelectModal({ isOpen, onClose, onSelect }: PersonSelectModalProps) {
    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 6;
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        async function fetchPersons() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/population?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}`);
                const json = await res.json();
                if (res.ok) {
                    setPersons(json.data || []);
                    setTotalPages(json.meta.totalPages);
                    setTotalItems(json.meta.total);
                }
            } catch (err) {
                console.error("Failed to fetch persons:", err);
            } finally {
                setIsLoading(false);
            }
        }

        const debounce = setTimeout(fetchPersons, 300);
        return () => clearTimeout(debounce);
    }, [isOpen, searchQuery, currentPage]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                ref={modalRef}
                className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">เลือกผู้รับบริการ</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                ค้นหารายชื่อจากหน่วยบริการของคุณ
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer text-muted-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border bg-card">
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, นามสกุล หรือ เลขบัตรประชาชน..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            autoFocus
                            className="w-full bg-muted/30 border border-border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[300px]">
                    {isLoading && persons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                            <Loader2 size={40} className="animate-spin text-primary" />
                            <p className="text-sm font-bold text-muted-foreground">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : persons.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {persons.map((person) => (
                                <button
                                    key={person.pid}
                                    onClick={() => onSelect(person)}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center text-primary font-bold shrink-0 group-hover:scale-110 transition-transform">
                                        {person.firstname[0]}{person.lastname[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                            {person.prefix} {person.firstname} {person.lastname}
                                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-black uppercase">PID: {person.pid}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CreditCard size={12} />
                                                <span className="font-mono">{person.cid || "ไม่ระบุ"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar size={12} />
                                                <span>อายุ {calculateAge(person.birth_date!)} ปี</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                            <Building2 size={12} className="text-primary/60" />
                                            <span className="truncate">{person.hospital.name}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground/30">
                                <Users size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-foreground">ไม่พบข้อมูลประชากร</p>
                                <p className="text-xs text-muted-foreground">ลองเปลี่ยนคำค้นหา</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {totalItems} รายการ
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-foreground min-w-[3rem] text-center">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || isLoading}
                                className="p-2 rounded-xl bg-card border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
