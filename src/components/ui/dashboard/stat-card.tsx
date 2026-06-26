import React from 'react'
import { STAT_CARD_COLORS } from '@/lib/constants/dashboard'

export function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color = 'brand',
    delay = 0,
    trend,
}: {
    icon: React.ElementType
    label: string
    value: number | string
    sub?: string
    trend?: {
        value: string
        isUp: boolean
    }
    color?: string
    delay?: number
}) {
    return (
        <div className="stat-card animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${STAT_CARD_COLORS[color]}`}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-2xl font-display font-bold text-slate-900">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div className="text-sm font-medium text-slate-600">{label}</div>
                {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    )
}
