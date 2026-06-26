import { rateColor } from '@/lib/utils/dashboard-helpers'

export function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: rateColor(pct) }}
                />
            </div>
            <span className="text-xs font-mono text-slate-500 w-8 text-right shrink-0">
                {Math.round(pct)}%
            </span>
        </div>
    )
}
