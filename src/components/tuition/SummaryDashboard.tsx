import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTuitionStore, useTotalRevenue, useDisplayStudents } from '@/store/useTuitionStore'
import { parseExcelToStudents, downloadStudentsExcel, downloadTemplateExcel } from '@/lib/excel'

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

export function SummaryDashboard() {
  const totalRevenue = useTotalRevenue()
  const setStudents = useTuitionStore((s) => s.setStudents)
  const displayStudents = useDisplayStudents()
  const inputRef = useRef<HTMLInputElement>(null)

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
    <Card className="overflow-hidden border-border shadow-md">
      <CardHeader className="border-b border-border bg-muted/30 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">이번 달 총 예상 매출액</CardTitle>
            <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{formatWon(totalRevenue)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={downloadTemplateExcel} className="rounded-md border-border shadow-sm">
              엑셀 양식 다운로드
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="rounded-md border-border shadow-sm">
              엑셀 불러오기
            </Button>
            <Button size="sm" onClick={handleExport} className="rounded-md shadow-sm">
              엑셀 내보내기
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
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
  )
}
