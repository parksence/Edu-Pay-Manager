import { useRef, useState, useCallback } from 'react'
import { Banknote, FileSpreadsheet, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useTuitionStore,
  useTotalRevenue,
  useDisplayStudents,
  useMaterialsRevenue,
  useTotalDeduction,
  useUnpaidSummary,
  getUnpaidStudents,
} from '@/store/useTuitionStore'
import { parseExcelToStudents, downloadStudentsExcel, downloadTemplateExcel } from '@/lib/excel'
import { buildKakaoSummary } from '@/lib/kakaoSummary'

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function SummaryDashboard() {
  const totalRevenue = useTotalRevenue()
  const materialsRevenue = useMaterialsRevenue()
  const totalDeduction = useTotalDeduction()
  const unpaidSummary = useUnpaidSummary()
  const setStudents = useTuitionStore((s) => s.setStudents)
  const students = useTuitionStore((s) => s.students)
  const displayStudents = useDisplayStudents()
  const inputRef = useRef<HTMLInputElement>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const unpaidList = getUnpaidStudents(students)

  const handleCopyKakaoSummary = useCallback(async () => {
    const text = buildKakaoSummary({
      settlementDate: formatDate(new Date()),
      totalRevenue,
      studentCount: students.length,
      materialsRevenue,
      totalDeduction,
      unpaidCount: unpaidSummary.count,
      totalUnpaidAmount: unpaidSummary.totalAmount,
      unpaidList: unpaidList.map((u) => ({ name: u.name, unpaidAmount: u.unpaidAmount })),
    })
    try {
      await navigator.clipboard.writeText(text)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 2500)
    } catch {
      alert('복사에 실패했습니다.')
    }
  }, [
    totalRevenue,
    students.length,
    materialsRevenue,
    totalDeduction,
    unpaidSummary.count,
    unpaidSummary.totalAmount,
    unpaidList,
  ])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const rows = await parseExcelToStudents(file)
      setStudents(rows)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : '엑셀 불러오기 실패')
    }
    e.target.value = ''
  }

  const handleExport = () => {
    downloadStudentsExcel(displayStudents)
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white/95">
                  이번 달 총 예상 매출액
                </h2>
                <p className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
                  {formatWon(totalRevenue)}
                </p>
                <p className="mt-2 text-xs text-white/80">
                  총 <strong>{students.length}</strong>건
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={downloadTemplateExcel}
                className="rounded-md bg-white/20 text-white hover:bg-white/30"
              >
                <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                엑셀 양식
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="rounded-md bg-white/20 text-white hover:bg-white/30"
              >
                엑셀 불러오기
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                className="rounded-md bg-white text-indigo-700 hover:bg-white/90"
              >
                엑셀 내보내기
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyKakaoSummary}
                className="rounded-md bg-white/20 text-white hover:bg-white/30"
              >
                <MessageSquare className="mr-1.5 h-4 w-4" />
                카톡 요약 복사
              </Button>
            </div>
          </div>
        </div>
        {toastVisible && (
          <div className="absolute right-4 top-4 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-lg">
            복사 완료
          </div>
        )}
        <CardContent className="border-t border-border bg-card p-4">
          <details className="group rounded-lg border border-border bg-muted/30">
          <summary className="cursor-pointer list-none px-4 py-3 font-medium text-foreground [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <span className="text-muted-foreground">?</span> 기존 명단 넣는 방법
            </span>
          </summary>
          <div className="border-t border-border px-4 pb-3 pt-2 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-1 pl-4">
              <li>상단 <strong className="text-foreground">엑셀 양식 다운로드</strong>로 빈 양식을 받습니다.</li>
              <li>첫 번째 행은 컬럼명(이름, 구분, 형제할인, 셔틀, 교재비, 결석차감) 그대로 두고, <strong className="text-foreground">두 번째 행부터</strong> 한 줄에 한 명씩 입력합니다.</li>
              <li><strong className="text-foreground">구분</strong>은 반드시 아래 중 하나로: 초등(원장), 초등, 중등(원장), 중등, 고등</li>
              <li><strong className="text-foreground">셔틀</strong>은 둔산 편도, 둔산, 기타 편도, 기타, 해당 없음 (빈값이면 해당 없음)</li>
              <li><strong className="text-foreground">형제할인</strong>은 O만 예, 빈값이면 아니오</li>
              <li>저장한 뒤 <strong className="text-foreground">엑셀 불러오기</strong>에서 해당 파일을 선택하면 됩니다.</li>
            </ol>
          </div>
        </details>
        </CardContent>
      </Card>
    </div>
  )
}
