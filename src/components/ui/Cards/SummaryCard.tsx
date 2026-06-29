import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils/tailwindcss';

export type ThemeKey = 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple';

const themeStyles: Record<ThemeKey, { wrapper: string; title: string; value: string; subtitle: string; iconWrapper: string; }> = {
    indigo: {
        wrapper: "from-indigo-50 to-blue-50/50 border-indigo-100/60 hover:border-indigo-300",
        title: "text-indigo-600 group-hover:text-indigo-700",
        value: "text-indigo-950",
        subtitle: "text-indigo-500/80",
        iconWrapper: "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500/20",
    },
    emerald: {
        wrapper: "from-emerald-50 to-teal-50/50 border-emerald-100/60 hover:border-emerald-300",
        title: "text-emerald-600 group-hover:text-emerald-700",
        value: "text-emerald-950",
        subtitle: "text-emerald-500/80",
        iconWrapper: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20",
    },
    rose: {
        wrapper: "from-rose-50 to-orange-50/50 border-rose-100/60 hover:border-rose-300",
        title: "text-rose-600 group-hover:text-rose-700",
        value: "text-rose-950",
        subtitle: "text-rose-500/80",
        iconWrapper: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500/20",
    },
    amber: {
        wrapper: "from-amber-50 to-yellow-50/50 border-amber-100/60 hover:border-amber-300",
        title: "text-amber-600 group-hover:text-amber-700",
        value: "text-amber-950",
        subtitle: "text-amber-500/80",
        iconWrapper: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/20",
    },
    purple: {
        wrapper: "from-purple-50 to-fuchsia-50/50 border-purple-100/60 hover:border-purple-300",
        title: "text-purple-600 group-hover:text-purple-700",
        value: "text-purple-950",
        subtitle: "text-purple-500/80",
        iconWrapper: "bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20",
    }
};

interface SummaryCardProps {
    title: string;
    value: string | number | ReactNode;
    subtitle: string;
    icon: ReactNode;
    theme?: ThemeKey;
    to?: string;
    className?: string;
}

export const SummaryCard = ({ title, value, subtitle, icon, theme = 'indigo', to, className }: SummaryCardProps) => {
    const styles = themeStyles[theme];

    const content = (
        <>
            <div>
                <p className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors", styles.title)}>{title}</p>
                <h3 className={cn("text-2xl sm:text-3xl font-extrabold mt-1", styles.value)}>{value}</h3>
                <p className={cn("text-[10px] sm:text-xs mt-1", styles.subtitle)}>{subtitle}</p>
            </div>
            <div className={cn("p-2 sm:p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110", styles.iconWrapper)}>
                {icon}
            </div>
        </>
    );

    const wrapperClass = cn(
        "bg-gradient-to-br border rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between transition-all duration-300 group",
        to ? "hover:shadow-md cursor-pointer" : "",
        styles.wrapper,
        className
    );

    if (to) {
        return (
            <Link to={to} className={wrapperClass}>
                {content}
            </Link>
        );
    }

    return (
        <div className={wrapperClass}>
            {content}
        </div>
    );
};
