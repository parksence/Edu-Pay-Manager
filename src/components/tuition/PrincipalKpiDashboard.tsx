import { useMemo, useState, useCallback } from 'react'
import { Banknote, Users, BookOpen, MinusCircle, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useTuitionStore,
  useTotalRevenue,
  useMaterialsRevenue,
  useTotalDeduction,
  useStudentsByGrade,
} from '@/store/useTuitionStore'
import { buildKpiSnapshot, buildShareUrl, type KpiSnapshot, type PieDataItem } from '@/lib/kpiShare'

const GRADE_LABELS: Record<string, string> = { elementary: '초등', middle: '중등', high: '고등' }

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

function formatSnapshotDate(t: number): string {
  const d = new Date(t)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

export interface PrincipalKpiDashboardProps {
  /** 공유 링크로 들어온 경우 전달. 이때는 그리드 없이 KPI만 표시됨 */
  snapshot?: KpiSnapshot | null
}

export function PrincipalKpiDashboard({ snapshot }: PrincipalKpiDashboardProps) {
  const students = useTuitionStore((s) => s.students)
  const liveRevenue = useTotalRevenue()
  const liveMaterials = useMaterialsRevenue()
  const liveDeduction = useTotalDeduction()
  const liveByGrade = useStudentsByGrade()

  const isSharedView = Boolean(snapshot)
  const expectedRevenue = snapshot?.expectedRevenue ?? liveRevenue
  const materialsRevenue = snapshot?.materialsRevenue ?? liveMaterials
  const totalDeduction = snapshot?.totalDeduction ?? liveDeduction
  const studentsByGrade = snapshot?.studentsByGrade ?? liveByGrade

  const pieDataForShare = useMemo((): PieDataItem[] => {
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

  const [linkCopyToast, setLinkCopyToast] = useState(false)

  const handleCopyMobileLink = useCallback(async () => {
    const snap = buildKpiSnapshot({
      expectedRevenue: liveRevenue,
      studentsByGrade: liveByGrade,
      materialsRevenue: liveMaterials,
      totalDeduction: liveDeduction,
      pieData: pieDataForShare,
    })
    const url = buildShareUrl(snap)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopyToast(true)
      setTimeout(() => setLinkCopyToast(false), 2500)
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
  }, [
    liveRevenue,
    liveByGrade,
    liveMaterials,
    liveDeduction,
    pieDataForShare,
  ])

  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardHeader className="relative border-b border-border bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              KPI
            </CardTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isSharedView && snapshot?.t != null
                ? `공유된 보기 · 기준 ${formatSnapshotDate(snapshot.t)}`
                : '모바일에서 바로 확인하세요 · 핵심 지표'}
            </p>
          </div>
          {!isSharedView && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyMobileLink}
                className="shrink-0 rounded-md"
              >
                <Link2 className="mr-1.5 h-4 w-4" />
                모바일 링크 복사
              </Button>
              {linkCopyToast && (
                <div className="absolute right-4 top-4 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-lg">
                  링크 복사 완료 · 원장님이 열면 같은 내용이 보입니다
                </div>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 min-h-[72px] sm:min-h-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">이번 달 예상 매출액</p>
            </div>
            <p className="mt-2 text-lg font-bold tabular-nums text-foreground sm:text-xl">
              {formatWon(expectedRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4 min-h-[72px] sm:min-h-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">학생 수 현황</p>
            </div>
            <p className="mt-2 text-sm font-semibold tabular-nums text-foreground leading-snug">
              초등 {studentsByGrade.초등}명 · 중등 {studentsByGrade.중등}명 · 고등 {studentsByGrade.고등}명
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4 min-h-[72px] sm:min-h-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">기타 수익 (교재비)</p>
            </div>
            <p className="mt-2 text-lg font-bold tabular-nums text-foreground sm:text-xl">
              {formatWon(materialsRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4 min-h-[72px] sm:min-h-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MinusCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">미수금/차감 (결석 등)</p>
            </div>
            <p className="mt-2 text-lg font-bold tabular-nums text-foreground sm:text-xl">
              {formatWon(totalDeduction)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
