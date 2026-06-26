import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, School, Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ConsultRecord } from '@/lib/types/dashboard'
import { completionRate, rateColor, rateBadgeClass } from '@/lib/utils/dashboard-helpers'
import { ProgressBar } from './progress-bar'

export function DistrictRow({
    district,
    schools,
    isExpanded,
    onToggle,
}: {
    district: ConsultRecord
    schools: ConsultRecord[]
    isExpanded: boolean
    onToggle: () => void
}) {
    const rate = completionRate(district.studentCompletedPerson, district.studentRequestedPerson)
    const { data: session } = useSession()
    const userRole = (session?.user as { role?: string })?.role
    const isAuthorizedForSchools = userRole === 'ADMIN' || userRole === 'SUPERADMIN'

    const [expandedSubdistricts, setExpandedSubdistricts] = useState<Set<string>>(new Set())

    const toggleSubdistrict = (subdistrictName: string) => {
        setExpandedSubdistricts((prev) => {
            const n = new Set(prev)
            n.has(subdistrictName) ? n.delete(subdistrictName) : n.add(subdistrictName)
            return n
        })
    }

    const subdistricts = useMemo(() => {
        const list: Array<{
            subdistrict: string
            schoolCount: number
            studentRequestedPerson: number
            studentReceivedPerson: number
            studentStartedPerson: number
            studentCompletedPerson: number
            studentNotReceivedPerson: number
            studentRequestedSession: number
            studentCompletedSession: number
            schools: ConsultRecord[]
        }> = []

        schools.forEach((r) => {
            const subName = r.subdistrict || 'ไม่ระบุตำบล'
            let entry = list.find((s) => s.subdistrict === subName)
            if (!entry) {
                entry = {
                    subdistrict: subName,
                    schoolCount: 0,
                    studentRequestedPerson: 0,
                    studentReceivedPerson: 0,
                    studentStartedPerson: 0,
                    studentCompletedPerson: 0,
                    studentNotReceivedPerson: 0,
                    studentRequestedSession: 0,
                    studentCompletedSession: 0,
                    schools: [],
                }
                list.push(entry)
            }
            entry.schoolCount += 1
            entry.studentRequestedPerson += r.studentRequestedPerson || 0
            entry.studentReceivedPerson += r.studentReceivedPerson || 0
            entry.studentStartedPerson += r.studentStartedPerson || 0
            entry.studentCompletedPerson += r.studentCompletedPerson || 0
            entry.studentNotReceivedPerson += r.studentNotReceivedPerson || 0
            entry.studentRequestedSession += r.studentRequestedSession || 0
            entry.studentCompletedSession += r.studentCompletedSession || 0
            entry.schools.push(r)
        })

        // Sort subdistricts alphabetically
        list.sort((a, b) => a.subdistrict.localeCompare(b.subdistrict, 'th'))
        return list
    }, [schools])

    return (
        <>
            <tr
                className={`cursor-pointer select-none transition-colors ${
                    isExpanded ? 'bg-brand-50/60' : 'hover:bg-slate-50/80'
                }`}
                onClick={onToggle}
            >
                {/* District name */}
                <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                isExpanded ? 'bg-brand-200 rotate-0' : 'bg-slate-100'
                            }`}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-brand-700" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            )}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">
                            {district.district}
                        </span>
                        {schools.length > 0 && (
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full font-mono transition-colors ${
                                    isExpanded
                                        ? 'bg-brand-100 text-brand-600'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {schools.length} รร.
                            </span>
                        )}
                    </div>
                </td>

                {/* Numeric columns */}
                <td className="px-4 py-3.5 font-mono text-sm text-slate-600 text-right">
                    {district.studentRequestedPerson.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-sky-700 text-right">
                    {district.studentReceivedPerson.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-amber-700 text-right">
                    {district.studentStartedPerson.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-emerald-700 text-right">
                    {district.studentCompletedPerson.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-rose-600 text-right">
                    {district.studentNotReceivedPerson.toLocaleString()}
                </td>

                {/* Progress */}
                <td className="px-4 py-3.5 min-w-[130px]">
                    <ProgressBar
                        value={district.studentCompletedPerson}
                        max={district.studentRequestedPerson}
                    />
                </td>

                {/* Session columns */}
                <td className="px-4 py-3.5 font-mono text-sm text-slate-500 text-right">
                    {district.studentRequestedSession.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-sm text-emerald-600 text-right">
                    {district.studentCompletedSession.toLocaleString()}
                </td>
            </tr>

            {/* ── Expanded subdistrict and school rows ──────────────────────────── */}
            {isExpanded && (
                <>
                    {subdistricts.length === 0 ? (
                        <tr className="bg-slate-50/50">
                            <td
                                colSpan={9}
                                className="pl-16 pr-5 py-3 text-xs text-slate-400 italic"
                            >
                                ไม่พบข้อมูลตำบลในอำเภอนี้
                            </td>
                        </tr>
                    ) : (
                        subdistricts.map((sub) => {
                            const isExpandedSub = expandedSubdistricts.has(sub.subdistrict)
                            const subRate = completionRate(
                                sub.studentCompletedPerson,
                                sub.studentRequestedPerson
                            )

                            return (
                                <>
                                    {/* Subdistrict Row */}
                                    <tr
                                        key={sub.subdistrict}
                                        className={`transition-colors border-l-2 border-slate-200 ${
                                            isAuthorizedForSchools
                                                ? 'cursor-pointer hover:bg-slate-50/50'
                                                : 'cursor-not-allowed bg-slate-50/20 text-slate-500'
                                        } ${isExpandedSub ? 'bg-slate-50/30' : ''}`}
                                        onClick={() =>
                                            isAuthorizedForSchools && toggleSubdistrict(sub.subdistrict)
                                        }
                                    >
                                        <td className="pl-10 pr-5 py-2.5">
                                            <div className="flex items-center gap-2">
                                                {isAuthorizedForSchools ? (
                                                    <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-600 shrink-0">
                                                        {isExpandedSub ? (
                                                            <ChevronDown className="w-3.5 h-3.5 text-brand-700" />
                                                        ) : (
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="w-5 h-5 rounded flex items-center justify-center bg-slate-100/50 text-slate-400 shrink-0"
                                                        title="ต้องการสิทธิ์ผู้ดูแลระบบในการดูรายโรงเรียน"
                                                    >
                                                        <Lock className="w-3 h-3" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-slate-700">
                                                    ตำบล{sub.subdistrict}
                                                </span>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded-full shrink-0">
                                                    {sub.schoolCount} รร.
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500 text-right">
                                            {sub.studentRequestedPerson.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-sky-600 text-right">
                                            {sub.studentReceivedPerson.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-amber-600 text-right">
                                            {sub.studentStartedPerson.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-emerald-600 text-right">
                                            {sub.studentCompletedPerson.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-rose-500 text-right">
                                            {sub.studentNotReceivedPerson.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${subRate}%`,
                                                            backgroundColor: rateColor(subRate),
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${rateBadgeClass(subRate)}`}
                                                >
                                                    {subRate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-slate-400 text-right">
                                            {sub.studentRequestedSession.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-emerald-500 text-right">
                                            {sub.studentCompletedSession.toLocaleString()}
                                        </td>
                                    </tr>

                                    {/* School Rows under this Subdistrict */}
                                    {isExpandedSub && isAuthorizedForSchools && (
                                        sub.schools.map((school, si) => {
                                            const sRate = completionRate(
                                                school.studentCompletedPerson,
                                                school.studentRequestedPerson
                                            )
                                            return (
                                                <tr
                                                    key={school.id}
                                                    className="bg-brand-50/5 border-l-4 border-brand-300 animate-fadeInUp"
                                                    style={{ animationDelay: `${si * 15}ms` }}
                                                >
                                                    <td className="pl-16 pr-5 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <School className="w-3.5 h-3.5 text-brand-300 shrink-0" />
                                                            <span className="text-sm text-slate-600 truncate">
                                                                {school.school}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-slate-500 text-right">
                                                        {school.studentRequestedPerson.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-sky-600 text-right">
                                                        {school.studentReceivedPerson.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-amber-600 text-right">
                                                        {school.studentStartedPerson.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-emerald-600 text-right">
                                                        {school.studentCompletedPerson.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-rose-500 text-right">
                                                        {school.studentNotReceivedPerson.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full"
                                                                    style={{
                                                                        width: `${sRate}%`,
                                                                        backgroundColor: rateColor(sRate),
                                                                    }}
                                                                />
                                                            </div>
                                                            <span
                                                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${rateBadgeClass(sRate)}`}
                                                            >
                                                                {sRate}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-slate-400 text-right">
                                                        {school.studentRequestedSession.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 font-mono text-xs text-emerald-500 text-right">
                                                        {school.studentCompletedSession.toLocaleString()}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </>
                            )
                        })
                    )}

                    {/* Separator */}
                    <tr>
                        <td colSpan={9} className="h-px bg-brand-100" />
                    </tr>
                </>
            )}
        </>
    )
}
