'use client'
import { useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { ConsultRecord } from '@/lib/types/dashboard'
import { completionRate, rateColor, rateBadgeClass } from '@/lib/utils/dashboard-helpers'
import { CHART_COLORS } from '@/lib/constants/dashboard'
import { DistrictRow } from './district-row'

export function DistrictPanel({ records }: { records: ConsultRecord[] }) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const districtRows = useMemo(
        () =>
            records
                .filter((r) => r.level === 2)
                .sort((a, b) => (a.district ?? '').localeCompare(b.district ?? '', 'th')),
        [records]
    )

    const schoolMap = useMemo(() => {
        const map: Record<string, ConsultRecord[]> = {}
        records
            .filter((r) => r.level === 3)
            .forEach((r) => {
                const key = r.district ?? ''
                if (!map[key]) map[key] = []
                map[key].push(r)
            })
        return map
    }, [records])

    const toggle = (d: string) =>
        setExpanded((prev) => {
            const n = new Set(prev)
            n.has(d) ? n.delete(d) : n.add(d)
            return n
        })

    const expandAll = () => setExpanded(new Set(districtRows.map((r) => r.district ?? '')))
    const collapseAll = () => setExpanded(new Set())

    // Totals
    const totals = useMemo(
        () =>
            districtRows.reduce(
                (acc, r) => ({
                    req: acc.req + r.studentRequestedPerson,
                    recv: acc.recv + r.studentReceivedPerson,
                    strt: acc.strt + r.studentStartedPerson,
                    done: acc.done + r.studentCompletedPerson,
                    no: acc.no + r.studentNotReceivedPerson,
                    reqS: acc.reqS + r.studentRequestedSession,
                    doneS: acc.doneS + r.studentCompletedSession,
                }),
                { req: 0, recv: 0, strt: 0, done: 0, no: 0, reqS: 0, doneS: 0 }
            ),
        [districtRows]
    )

    // Bar data
    const barData = districtRows.map((r) => ({
        name: r.district ?? '',
        ขอคำปรึกษา: r.studentRequestedPerson,
        ตอบรับปรึกษา: r.studentReceivedPerson,
    }))

    if (districtRows.length === 0) {
        return (
            <div className="card p-10 text-center text-slate-400 flex flex-col items-center gap-3">
                <AlertTriangle className="w-8 h-8 opacity-40" />
                <p className="text-sm">ไม่พบข้อมูลระดับอำเภอในจังหวัดนี้</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* District bar chart */}
            <div className="card p-6">
                <h3 className="font-display font-semibold text-slate-800 mb-5">
                    เปรียบเทียบสถิติรายอำเภอ (รายคน)
                </h3>
                <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={barData} margin={{ top: 10, right: 8, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                            height={50}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                fontFamily: 'IBM Plex Sans Thai',
                                fontSize: 12,
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '15px', fontSize: 12 }} />
                        <Bar
                            dataKey="ขอคำปรึกษา"
                            stackId="a"
                            fill={CHART_COLORS.requested}
                        />
                        <Bar
                            dataKey="ตอบรับปรึกษา"
                            stackId="a"
                            fill={CHART_COLORS.received}
                            radius={[3, 3, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* District detail table */}
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-display font-semibold text-slate-800">
                            รายละเอียดรายอำเภอ
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            คลิกแถวเพื่อดูข้อมูลรายโรงเรียน
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={expandAll}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                            ขยายทั้งหมด
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button
                            onClick={collapseAll}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            ยุบทั้งหมด
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">
                                    อำเภอ
                                </th>
                                {[
                                    { label: 'ขอ (คน)', cls: 'text-slate-500' },
                                    { label: 'รับแล้ว', cls: 'text-sky-600' },
                                    { label: 'เริ่มแล้ว', cls: 'text-amber-600' },
                                    { label: 'สำเร็จ', cls: 'text-emerald-600' },
                                    { label: 'ไม่รับ', cls: 'text-rose-600' },
                                    { label: 'อัตราสำเร็จ', cls: 'text-slate-500' },
                                    { label: 'ขอ (ครั้ง)', cls: 'text-slate-500' },
                                    { label: 'สำเร็จ (ครั้ง)', cls: 'text-emerald-600' },
                                ].map(({ label, cls }) => (
                                    <th
                                        key={label}
                                        className={`px-4 py-3 text-xs font-semibold tracking-wide text-right whitespace-nowrap ${cls}`}
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                            {districtRows.map((dr) => (
                                <DistrictRow
                                    key={dr.id}
                                    district={dr}
                                    schools={schoolMap[dr.district ?? ''] ?? []}
                                    isExpanded={expanded.has(dr.district ?? '')}
                                    onToggle={() => toggle(dr.district ?? '')}
                                />
                            ))}
                        </tbody>

                        {/* Totals footer */}
                        <tfoot>
                            <tr className="bg-gradient-to-r from-brand-50 to-brand-100/50 border-t-2 border-brand-200">
                                <td className="px-5 py-3 text-sm font-semibold text-brand-800">
                                    รวม {districtRows.length} อำเภอ
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-slate-700 text-right">
                                    {totals.req.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-sky-700 text-right">
                                    {totals.recv.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-amber-700 text-right">
                                    {totals.strt.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-emerald-700 text-right">
                                    {totals.done.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-rose-600 text-right">
                                    {totals.no.toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${completionRate(totals.done, totals.req)}%`,
                                                    backgroundColor: rateColor(
                                                        completionRate(totals.done, totals.req)
                                                    ),
                                                }}
                                            />
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${rateBadgeClass(completionRate(totals.done, totals.req))}`}
                                        >
                                            {completionRate(totals.done, totals.req)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-slate-600 text-right">
                                    {totals.reqS.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 font-mono text-sm font-bold text-emerald-700 text-right">
                                    {totals.doneS.toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
