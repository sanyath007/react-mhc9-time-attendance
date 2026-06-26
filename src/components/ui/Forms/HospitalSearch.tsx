"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Loader2, X, Building2, Building } from "lucide-react";

export interface Hospital {
    hcode: string;
    name: string;
    province?: { name: string };
    district?: { name: string };
}

interface HospitalSearchProps {
    onSelect: (hospital: Hospital) => void;
    onClear: () => void;
    selectedHospital: Hospital | null;
    label?: string;
    icon?: React.ReactNode;
    error?: string;
    placeholder?: string;
    provinceId?: string;
    districtId?: string;
    disabled?: boolean;
}

export function HospitalSearch({
    onSelect,
    onClear,
    selectedHospital,
    label = "Health Center",
    icon,
    error,
    placeholder = "Search health center by name or code...",
    provinceId,
    districtId,
    disabled = false
}: HospitalSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Hospital[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!searchQuery.trim() || selectedHospital) {
            setSearchResults([]);
            return;
        }

        if (searchQuery.length < 3) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                let url = `/api/hospitals/search?q=${encodeURIComponent(searchQuery)}`;
                if (provinceId) url += `&province_id=${provinceId}`;
                if (districtId) url += `&district_id=${districtId}`;

                const res = await fetch(url);
                const json = await res.json();
                setSearchResults(json.data ?? []);
                setShowDropdown(true);
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, selectedHospital, provinceId, districtId]);

    const handleSelect = (hospital: Hospital) => {
        onSelect(hospital);
        setSearchQuery(hospital.name);
        setShowDropdown(false);
    };

    const handleClear = () => {
        onClear();
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <div className="space-y-1.5 relative" ref={dropdownRef}>
            {label && (
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 pl-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
            )}
            
            {!selectedHospital ? (
                <div className="relative group">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${error ? 'text-rose-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                        {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        placeholder={placeholder}
                        className={`w-full bg-muted/30 border rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 transition-all ${
                            error 
                                ? 'border-rose-500 focus:ring-rose-500/20' 
                                : 'border-border focus:ring-primary/20 focus:border-primary'
                        }`}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}

                    {showDropdown && searchQuery.length >= 3 && (
                        <div className="absolute z-50 mt-2 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                                {searchResults.length > 0 ? (
                                    searchResults.map(hosp => (
                                        <li
                                            key={hosp.hcode}
                                            onClick={() => handleSelect(hosp)}
                                            className="group/hosp flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 text-sm transition-colors"
                                        >
                                            <Building size={18} className="text-muted-foreground shrink-0 group-hover/hosp:text-teal-500 transition-colors" />
                                            <div className="flex flex-col">
                                                <span className="font-medium group-hover/hosp:text-teal-500 transition-colors">
                                                    {hosp.hcode} - {hosp.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    อ.{hosp.district?.name} จ.{hosp.province?.name}
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                ) : !isSearching && (
                                    <div className="p-8 text-center">
                                        <Building2 size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                                        <p className="text-xs text-muted-foreground font-medium">No results match your search</p>
                                    </div>
                                )}

                                <div className="p-2 border-t border-border bg-muted/30 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2">
                                        {isSearching ? "Searching..." : `${searchResults.length} Results Found`}
                                    </span>
                                </div>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border-2 border-primary/50 shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/80 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary">{selectedHospital.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono font-bold mt-0.5">
                                HCODE: {selectedHospital.hcode} • {selectedHospital.district?.name}, {selectedHospital.province?.name}
                            </p>
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-border text-[10px] font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm uppercase tracking-wider cursor-pointer"
                        >
                            <X size={12} />
                            เปลี่ยน
                        </button>
                    )}
                </div>
            )}
            
            {error && <p className="text-xs text-rose-500 ml-1 font-medium">{error}</p>}
        </div>
    );
}
