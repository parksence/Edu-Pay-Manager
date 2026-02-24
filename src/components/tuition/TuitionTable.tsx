import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { useTuitionStore, useDisplayStudents } from '@/store/useTuitionStore'
import { GRADE_OPTIONS, SHUTTLE_OPTIONS } from '@/lib/constants'
import type { SortColumn } from '@/lib/sortStudents'
import type { StudentRow, StudentGrade, ShuttleType } from '@/types'

function formatWon(n: number): string {
  return n.toLocaleString('ko-KR')
}

function EditableRow({ row, index }: { row: StudentRow; index: number }) {
  const updateStudent = useTuitionStore((s) => s.updateStudent)
  const removeStudent = useTuitionStore((s) => s.removeStudent)

  return (
    <TableRow className="group hover:bg-muted/50">
      <TableCell className="w-14 shrink-0 py-2 text-center text-sm font-medium text-muted-foreground tabular-nums">
        {index + 1}
      </TableCell>
      <TableCell className="py-2">
        <Input
          value={row.name}
          onChange={(e) => updateStudent(row.id, { name: e.target.value })}
          placeholder="이름 입력"
          className="h-9 min-w-[90px] rounded-md border-border bg-background font-bold transition-colors"
        />
      </TableCell>
      <TableCell className="py-2">
        <Select
          value={row.grade}
          onValueChange={(v) => updateStudent(row.id, { grade: v as StudentGrade })}
        >
          <SelectTrigger className="h-9 min-w-[110px] rounded-md border-border">
            <SelectValue placeholder="구분 선택" />
          </SelectTrigger>
          <SelectContent>
            {GRADE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-2 text-center">
        <Checkbox
          checked={row.siblingDiscount}
          onCheckedChange={(checked) =>
            updateStudent(row.id, { siblingDiscount: checked === true })
          }
          className="data-[state=checked]:bg-primary"
        />
      </TableCell>
      <TableCell className="py-2">
        <Select
          value={row.shuttle}
          onValueChange={(v) => updateStudent(row.id, { shuttle: v as ShuttleType })}
        >
          <SelectTrigger className="h-9 min-w-[100px] rounded-md border-border">
            <SelectValue placeholder="셔틀 선택" />
          </SelectTrigger>
          <SelectContent>
            {SHUTTLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-2">
        <Input
          type="number"
          min={0}
          value={row.materialsFee ?? ''}
          onChange={(e) =>
            updateStudent(row.id, {
              materialsFee: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="h-9 w-24 rounded-md border-border text-right tabular-nums"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input
          type="number"
          min={0}
          value={row.absenceDeduction ?? ''}
          onChange={(e) =>
            updateStudent(row.id, {
              absenceDeduction: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="h-9 w-24 rounded-md border-border text-right tabular-nums"
        />
      </TableCell>
      <TableCell className="py-2 text-center">
        <Checkbox
          checked={row.isPaid ?? true}
          onCheckedChange={(checked) =>
            updateStudent(row.id, { isPaid: checked === true })
          }
          className="data-[state=checked]:bg-primary"
          title="납부 완료 (기본: 납부한 걸로)"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input
          type="number"
          min={0}
          value={row.paidAmount ?? ''}
          onChange={(e) =>
            updateStudent(row.id, {
              paidAmount: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="h-9 w-24 rounded-md border-border text-right tabular-nums"
        />
      </TableCell>
      <TableCell className="py-2 text-right text-sm tabular-nums text-muted-foreground">
        {formatWon(row.baseTuition ?? 0)}
      </TableCell>
      <TableCell className="py-2 text-right text-sm tabular-nums text-muted-foreground">
        {formatWon(row.shuttleFee ?? 0)}
      </TableCell>
      <TableCell className="py-2 text-right font-bold tabular-nums text-foreground">
        {formatWon(row.finalAmount ?? 0)}
      </TableCell>
      <TableCell className="py-2 text-right tabular-nums">
        {(() => {
          const final = row.finalAmount ?? 0
          const paid = (row.isPaid ?? true) && (row.paidAmount ?? 0) === 0 ? final : (row.paidAmount ?? 0)
          const diff = final - paid
          if (diff > 0) return <span className="text-muted-foreground">{formatWon(diff)}</span>
          if (diff < 0) return <span className="font-medium text-destructive">{formatWon(diff)}</span>
          return <span className="text-muted-foreground">-</span>
        })()}
      </TableCell>
      <TableCell className="py-2">
        <Input
          value={row.notes ?? ''}
          onChange={(e) => updateStudent(row.id, { notes: e.target.value })}
          placeholder="비고"
          className="h-9 min-w-[100px] rounded-md border-border bg-background text-sm"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input
          value={row.phone ?? ''}
          onChange={(e) => updateStudent(row.id, { phone: e.target.value })}
          placeholder="연락처"
          className="h-9 min-w-[100px] rounded-md border-border bg-background text-sm"
        />
      </TableCell>
      <TableCell className="w-[72px] shrink-0 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
          onClick={() => removeStudent(row.id)}
        >
          삭제
        </Button>
      </TableCell>
    </TableRow>
  )
}

const SORT_LABELS: Record<SortColumn, string> = {
  name: '이름',
  grade: '구분',
  siblingDiscount: '형제 할인',
  shuttle: '셔틀',
  finalAmount: '최종 금액',
}

const FORMULA_TOOLTIP =
  '최종 금액 = (기본 수업료 × 0.95^형제할인) + 셔틀비 + 교재비 - 결석 차감'

function SortableHead({
  column,
  children,
  className = '',
}: {
  column: SortColumn
  children: React.ReactNode
  className?: string
}) {
  const sortBy = useTuitionStore((s) => s.sortBy)
  const sortOrder = useTuitionStore((s) => s.sortOrder)
  const setSort = useTuitionStore((s) => s.setSort)
  const isActive = sortBy === column

  const cycle = () => {
    if (isActive) {
      const next = sortOrder === 'asc' ? 'desc' : null
      setSort(column, next)
    } else {
      setSort(column, 'asc')
    }
  }

  return (
    <TableHead
      className={`cursor-pointer select-none font-semibold hover:text-foreground ${className}`}
      onClick={cycle}
      title={`클릭하면 ${SORT_LABELS[column]} 정렬`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {isActive && (
          <span className="text-primary">{sortOrder === 'asc' ? '▲' : '▼'}</span>
        )}
      </span>
    </TableHead>
  )
}

export function TuitionTable() {
  const students = useTuitionStore((s) => s.students)
  const addStudent = useTuitionStore((s) => s.addStudent)
  const displayStudents = useDisplayStudents()
  const sortBy = useTuitionStore((s) => s.sortBy)
  const sortOrder = useTuitionStore((s) => s.sortOrder)
  const totalCount = students.length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          총 <strong className="text-foreground">{totalCount}</strong>건
          {sortBy !== null && (
            <span className="ml-2 text-xs">
              ({SORT_LABELS[sortBy]} {sortOrder === 'asc' ? '오름차순' : '내림차순'})
            </span>
          )}
        </span>
        <Button type="button" onClick={() => addStudent()} className="rounded-md shadow-sm">
          + 행 추가
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/60 text-xs hover:bg-muted/60">
              <TableHead className="w-14 shrink-0 py-2.5 text-center font-semibold">No</TableHead>
              <SortableHead column="name">이름</SortableHead>
              <SortableHead column="grade">구분</SortableHead>
              <SortableHead column="siblingDiscount" className="whitespace-nowrap text-center">
                형제 할인
              </SortableHead>
              <SortableHead column="shuttle">셔틀</SortableHead>
              <TableHead className="py-2.5 font-semibold">교재비</TableHead>
              <TableHead className="py-2.5 font-semibold">결석 차감</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-center font-semibold">납부 완료</TableHead>
              <TableHead className="py-2.5 font-semibold">납부 금액</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-right font-semibold">기본 수업료</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-right font-semibold">셔틀비</TableHead>
              <SortableHead column="finalAmount" className="whitespace-nowrap text-right">
                <span className="inline-flex items-center gap-1">
                  최종 금액
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="inline-flex cursor-help text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {FORMULA_TOOLTIP}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </SortableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-right font-semibold">미납액</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 font-semibold">비고</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 font-semibold">연락처</TableHead>
              <TableHead className="w-[72px] shrink-0 py-2.5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="h-32 text-center text-muted-foreground">
                  등록된 학생이 없습니다. 엑셀을 불러오거나 &quot;행 추가&quot;로 추가해 보세요.
                </TableCell>
              </TableRow>
            ) : (
              displayStudents.map((row, index) => (
                <EditableRow key={row.id} row={row} index={index} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
