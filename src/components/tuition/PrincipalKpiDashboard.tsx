import { useMemo, useState, useCallback } from 'react'
import { Banknote, Users, BookOpen, MinusCircle, AlertCircle, Phone, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useTuitionStore,
  useTotalRevenue,
  useMaterialsRevenue,
  useTotalDeduction,
  useStudentsByGrade,
  useUnpaidSummary,
  getUnpaidStudents,
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
  const liveUnpaidSummary = useUnpaidSummary()
  const liveUnpaidStudents = useMemo(() => getUnpaidStudents(students), [students])

  const isSharedView = Boolean(snapshot)
  const expectedRevenue = snapshot?.expectedRevenue ?? liveRevenue
  const materialsRevenue = snapshot?.materialsRevenue ?? liveMaterials
  const totalDeduction = snapshot?.totalDeduction ?? liveDeduction
  const studentsByGrade = snapshot?.studentsByGrade ?? liveByGrade
  const unpaidSummary = snapshot
    ? { count: snapshot.unpaidCount, totalAmount: snapshot.totalUnpaidAmount }
    : liveUnpaidSummary
  const unpaidStudents = snapshot?.unpaidStudents ?? liveUnpaidStudents

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
      unpaidCount: liveUnpaidSummary.count,
      totalUnpaidAmount: liveUnpaidSummary.totalAmount,
      unpaidStudents: liveUnpaidStudents,
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
    liveUnpaidSummary.count,
    liveUnpaidSummary.totalAmount,
    liveUnpaidStudents,
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
                : '모바일에서 바로 확인하세요 · 핵심 지표와 미납 현황'}
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

        {/* 미납자 인사이트 영역: 모바일에서 스크롤·탭 친화 */}
        <div className="mt-4 sm:mt-6 rounded-xl border border-border bg-muted/40 p-4 sm:p-5 shadow-sm">
          {unpaidStudents.length > 0 ? (
            <div className="max-h-[70vh] sm:max-h-[600px] overflow-y-auto overflow-x-hidden rounded-lg border border-border/80 -webkit-overflow-scrolling-touch">
              <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-border bg-muted/50 px-1 py-3 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <h3 className="text-sm font-semibold text-foreground">미납 인원</h3>
                  <Badge variant="warning" className="shrink-0">
                    {unpaidSummary.count}명 미납
                  </Badge>
                  {unpaidSummary.totalAmount > 0 && (
                    <span className="text-sm text-muted-foreground">
                      미납 합계 {formatWon(unpaidSummary.totalAmount)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">미납 확인이 필요한 명단입니다.</p>
              </div>
              <div className="grid min-w-0 grid-cols-2 gap-3 p-1 pt-3 lg:grid-cols-3">
                  {unpaidStudents.map(({ name, unpaidAmount, notes, phone }, i) => {
                    const notesText = notes?.trim() || '-'
                    const notesTruncated = notesText.length > 40 ? `${notesText.slice(0, 40)}…` : notesText
                    return (
                      <div
                        key={i}
                        className="flex min-w-[200px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 px-3 py-2">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                              {i + 1}.
                            </span>
                            <span className="min-w-0 truncate text-xs font-medium text-foreground">
                              {name}
                            </span>
                            {phone?.trim() ? (
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
                                <a href={`tel:${phone.trim()}`} title="전화 걸기">
                                  <Phone className="h-3.5 w-3.5 text-rose-600" />
                                </a>
                              </Button>
                            ) : null}
                          </div>
                          <span className="shrink-0 text-xs font-black tabular-nums text-rose-600">
                            {formatWon(unpaidAmount)}
                          </span>
                        </div>
                        <div className="border-t border-border bg-muted/30 px-3 py-1.5">
                          {notesText !== '-' && notesText.length > 40 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="truncate text-xs text-muted-foreground" title={notesText}>
                                  {notesTruncated}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm break-words">
                                {notesText}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <p className="truncate text-xs text-muted-foreground">{notesText}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex flex-wrap items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-semibold text-foreground">미납 인원</h3>
                <Badge variant="warning" className="shrink-0">
                  {unpaidSummary.count}명 미납
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">미납자가 없습니다.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
