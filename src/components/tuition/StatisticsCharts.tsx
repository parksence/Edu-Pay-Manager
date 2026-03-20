import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTuitionStore } from '@/store/useTuitionStore'
import type { KpiSnapshot } from '@/lib/kpiShare'
import { appliedTuitionDiscountWon, getBaseTuition } from '@/lib/calculations'

const GRADE_LABELS: Record<string, string> = {
  elementary: '초등',
  middle: '중등',
  high: '고등',
}

/** 구분별(초/중/고) 차트용 - 초등 파랑, 중등 주황, 고등 초록 */
const GRADE_PIE_COLORS = ['#2563eb', '#ea580c', '#059669']
const SUBJECT_PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899']

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

export interface StatisticsChartsProps {
  /** 공유 링크로 들어온 경우 전달 시 스냅샷 기준으로 차트 표시 */
  snapshot?: KpiSnapshot | null
}

export function StatisticsCharts({ snapshot }: StatisticsChartsProps) {
  const students = useTuitionStore((s) => s.students)

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

  /** 구분별 학생 수 비중 (초/중/고) */
  const gradeCountPieData = useMemo(() => {
    const acc: Record<string, number> = { elementary: 0, middle: 0, high: 0 }
    for (const s of students) {
      if (s.grade.startsWith('elementary')) acc.elementary += 1
      else if (s.grade.startsWith('middle')) acc.middle += 1
      else if (s.grade === 'high') acc.high += 1
    }
    return Object.entries(acc)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: GRADE_LABELS[name] ?? name, value }))
  }, [students])

  /** 항목별 매출 비중: 영어(기본 수업료), 수학, 셔틀, 교재비 (할인은 수업료 합산에 비례 배분) */
  const subjectPieDataFromStore = useMemo(() => {
    let english = 0
    let math = 0
    let shuttle = 0
    let materials = 0
    for (const s of students) {
      const baseOnly = getBaseTuition(s.grade)
      const mathFee = Number(s.mathFee) || 0
      const totalTuition = baseOnly + mathFee
      const disc = appliedTuitionDiscountWon(s, totalTuition)
      const afterTuition = Math.max(0, totalTuition - disc)
      if (totalTuition > 0) {
        english += (afterTuition * baseOnly) / totalTuition
        math += (afterTuition * mathFee) / totalTuition
      }
      shuttle += s.shuttleFee ?? 0
      materials += Number(s.materialsFee) || 0
    }
    return [
      { name: '영어', value: english },
      { name: '수학', value: math },
      { name: '셔틀', value: shuttle },
      { name: '교재비', value: materials },
    ].filter((d) => d.value > 0)
  }, [students])

  const pieData = snapshot ? (snapshot.pieData ?? []) : pieDataFromStore

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
                    <Cell key={i} fill={GRADE_PIE_COLORS[i % GRADE_PIE_COLORS.length]} />
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
            구분별 학생 수 비중 (초/중/고)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] w-full">
          {gradeCountPieData.length > 0 ? (
            <div className="h-full w-full min-h-[200px] min-w-[300px]">
              <ResponsiveContainer width="100%" height={280} minWidth={300} minHeight={200}>
                <PieChart>
                  <Pie
                    data={gradeCountPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {gradeCountPieData.map((_, i) => (
                      <Cell key={i} fill={GRADE_PIE_COLORS[i % GRADE_PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v) => `${Number(v)}명`} />
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
            항목별 매출 비중
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] w-full">
          {subjectPieDataFromStore.length > 0 ? (
            <div className="h-full w-full min-h-[200px] min-w-[300px]">
              <ResponsiveContainer width="100%" height={280} minWidth={300} minHeight={200}>
                <PieChart>
                  <Pie
                    data={subjectPieDataFromStore}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {subjectPieDataFromStore.map((_, i) => (
                      <Cell key={i} fill={SUBJECT_PIE_COLORS[i % SUBJECT_PIE_COLORS.length]} />
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
    </div>
  )
}
