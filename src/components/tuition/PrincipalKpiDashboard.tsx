import { useMemo } from 'react'
import { Banknote, Users, BookOpen, MinusCircle, AlertCircle, FileDown, Phone } from 'lucide-react'
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
import { downloadKpiPdf } from '@/lib/pdfKpi'

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

export function PrincipalKpiDashboard() {
  const students = useTuitionStore((s) => s.students)
  const expectedRevenue = useTotalRevenue()
  const materialsRevenue = useMaterialsRevenue()
  const totalDeduction = useTotalDeduction()
  const studentsByGrade = useStudentsByGrade()
  const unpaidSummary = useUnpaidSummary()
  const unpaidStudents = useMemo(() => getUnpaidStudents(students), [students])

  const handlePdfDownload = () => {
    downloadKpiPdf({
      expectedRevenue,
      studentsByGrade,
      materialsRevenue,
      totalDeduction,
      unpaidCount: unpaidSummary.count,
      totalUnpaidAmount: unpaidSummary.totalAmount,
      unpaidStudents,
    })
  }

  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardHeader className="border-b border-border bg-muted/30 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              원장님 KPI
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              보고용 핵심 지표 · PDF로 저장해 원장님께 전달하세요
            </p>
          </div>
          <Button
            size="sm"
            onClick={handlePdfDownload}
            className="rounded-md shadow-sm"
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            PDF로 저장
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <p className="text-sm font-medium">이번 달 예상 매출액</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
              {formatWon(expectedRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <p className="text-sm font-medium">학생 수 현황</p>
            </div>
            <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">
              초등 {studentsByGrade.초등}명 · 중등 {studentsByGrade.중등}명 · 고등 {studentsByGrade.고등}명
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <p className="text-sm font-medium">기타 수익 (교재비)</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
              {formatWon(materialsRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MinusCircle className="h-4 w-4" />
              <p className="text-sm font-medium">미수금/차감 (결석 등)</p>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground">
              {formatWon(totalDeduction)}
            </p>
          </div>
        </div>

        {/* 미납자 인사이트 영역: Sticky 헤더 + 그리드 스크롤 */}
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50/80 p-4">
          {unpaidStudents.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto rounded border border-rose-200">
              <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-rose-200 bg-rose-50/95 px-1 py-3 backdrop-blur-sm">
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
                        className="flex min-w-[200px] flex-col overflow-hidden rounded-lg border border-rose-100 bg-card shadow-sm"
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
                        <div className="border-t border-rose-100 bg-slate-50 px-3 py-1.5">
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
