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

const GRADE_LABELS: Record<string, string> = {
  elementary: '초등',
  middle: '중등',
  high: '고등',
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7']

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

export function StatisticsCharts() {
  const students = useTuitionStore((s) => s.students)
  const unpaidSummary = useUnpaidSummary()

  const pieData = useMemo(() => {
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
  const unpaidAmount = unpaidSummary.totalAmount
  const paidAmount = Math.max(0, totalRevenue - unpaidAmount)

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
        <CardContent className="h-[280px]">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
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
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={stackedBarData}
              margin={{ top: 16, right: 24, left: 60, bottom: 16 }}
            >
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
              <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatWon(Number(v))} />
              <Bar dataKey="수납완료" name="수납 완료" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} minPointSize={8}>
                <LabelList dataKey="수납완료" position="center" formatter={(v: number) => (v > 0 ? formatWon(v) : '')} />
              </Bar>
              <Bar dataKey="미납" name="미납" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} minPointSize={8}>
                <LabelList dataKey="미납" position="center" formatter={(v: number) => (v > 0 ? formatWon(v) : '')} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
