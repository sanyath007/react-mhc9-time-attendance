export function rateColor(rate: number) {
    if (rate >= 70) return '#10b981'
    if (rate >= 40) return '#f59e0b'
    return '#f43f5e'
}

export function rateBadgeClass(rate: number) {
    if (rate >= 70) return 'bg-emerald-100 text-emerald-700'
    if (rate >= 40) return 'bg-amber-100 text-amber-700'
    return 'bg-rose-100 text-rose-700'
}

export function completionRate(completed: number, requested: number) {
    return requested > 0 ? Math.round((completed / requested) * 100) : 0
}
