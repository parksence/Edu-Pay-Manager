import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTuitionStore, useUnpaidSummary } from '@/store/useTuitionStore'
import type { KpiSnapshot } from '@/lib/kpiShare'

const GRADE_LABELS: Record<string, string> = {
  elementary: '초등',
  middle: '중등',
  high: '고등',
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7']

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

export interface StatisticsChartsProps {
  /** 공유 링크로 들어온 경우 전달 시 스냅샷 기준으로 차트 표시 */
  snapshot?: KpiSnapshot | null
}

export function StatisticsCharts({ snapshot }: StatisticsChartsProps) {
  const students = useTuitionStore((s) => s.students)
  const unpaidSummary = useUnpaidSummary()

  const pieDataFromStore = useMemo(() => {
    const acc: Record<string, number> = { elementary: 0, middle: 0, high: 0 }
    for (const s of students) {
      const amount = s.finalAmount ?? 0
      if (s.grade.startsWith('elementary')) acc.elementary += amount
      else if (s.grade.startsWith('middle')) acc.middle += amount
      else if (s.grade === 'high') acc.high += amount
    }
    return Object.entries(acc)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: GRADE_LABELS[name] ?? name, value }))
  }, [students])

  const totalRevenue = useMemo(
    () => students.reduce((sum, s) => sum + (s.finalAmount ?? 0), 0),
    [students]
  )
  const liveUnpaid = unpaidSummary.totalAmount
  const livePaid = Math.max(0, totalRevenue - liveUnpaid)

  const pieData = snapshot ? (snapshot.pieData ?? []) : pieDataFromStore
  const unpaidAmount = snapshot ? snapshot.totalUnpaidAmount : liveUnpaid
  const paidAmount = snapshot ? Math.max(0, snapshot.expectedRevenue - snapshot.totalUnpaidAmount) : livePaid

  const stackedBarData = useMemo(
    () => [{ name: '전체', 수납완료: paidAmount, 미납: unpaidAmount }],
    [paidAmount, unpaidAmount]
  )

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      <Card className="overflow-hidden border-border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            구분별 매출 비중 (초/중/고)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] w-full">
          {pieData.length > 0 ? (
            <div className="h-full w-full min-h-[200px] min-w-[300px]">
              <ResponsiveContainer width="100%" height={280} minWidth={300} minHeight={200}>
                <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => formatWon(Number(v))} />
              </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              데이터가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            수납 완료 vs 미납 금액
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] w-full">
          <div className="h-full w-full min-h-[200px] min-w-[300px]">
            <ResponsiveContainer width="100%" height={280} minWidth={300} minHeight={200}>
              <BarChart
              layout="vertical"
              data={stackedBarData}
              margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
            >
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
              <YAxis type="category" dataKey="name" width={0} tick={false} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatWon(Number(v))} />
              <Bar dataKey="수납완료" name="수납 완료" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} minPointSize={8}>
                <LabelList dataKey="수납완료" position="center" formatter={(v: unknown) => (Number(v) > 0 ? formatWon(Number(v)) : '')} fill="#000" stroke="none" style={{ fontWeight: 600, fontSize: 14 }} />
              </Bar>
              <Bar dataKey="미납" name="미납" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} minPointSize={8}>
                <LabelList dataKey="미납" position="center" formatter={(v: unknown) => (Number(v) > 0 ? formatWon(Number(v)) : '')} fill="#000" stroke="none" style={{ fontWeight: 600, fontSize: 14 }} />
              </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
