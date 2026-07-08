import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils/tailwindcss';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) => {
    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    // const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
    // const endItem = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full mt-6 py-4">
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <div className="text-sm text-gray-500 flex flex-row items-center gap-2">
                    ทั้งหมด <span className="font-medium text-gray-900">{totalItems}</span> รายการ
                    {/* Divider */}
                    <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                    <span className="text-gray-500">หน้าที่</span> <span className="text-gray-900">{currentPage}</span> / <span className="text-gray-900">{totalPages}</span>
                </div>
            )}

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {generatePages().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                        disabled={typeof page === 'string'}
                        className={cn(
                            "min-w-[36px] h-9 px-3 rounded-lg text-sm font-semibold transition-all shadow-sm",
                            page === currentPage
                                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-transparent hover:shadow-md hover:-translate-y-px"
                                : typeof page === 'string'
                                    ? "text-gray-400 cursor-default shadow-none border-transparent bg-transparent"
                                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200"
                        )}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
