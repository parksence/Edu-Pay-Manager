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
import { useState, useMemo, useCallback } from 'react'
import { HelpCircle, Search, Copy, Check } from 'lucide-react'
import { useTuitionStore, useDisplayStudents } from '@/store/useTuitionStore'
import { GRADE_OPTIONS, SHUTTLE_OPTIONS } from '@/lib/constants'
import { buildParentMessage } from '@/lib/parentMessage'
import type { SortColumn } from '@/lib/sortStudents'
import type { StudentRow, StudentGrade, ShuttleType } from '@/types'

const FILTER_ALL = 'all'

/** 상세검색: 구분/형제할인/셔틀/납부완료 값 */
type FilterGrade = StudentGrade | typeof FILTER_ALL
type FilterSibling = 'yes' | 'no' | typeof FILTER_ALL
type FilterShuttle = ShuttleType | typeof FILTER_ALL
type FilterPaid = 'yes' | 'no' | typeof FILTER_ALL

function formatWon(n: number): string {
  return n.toLocaleString('ko-KR')
}

function EditableRow({
  row,
  index,
  onCopyMent,
}: {
  row: StudentRow
  index: number
  onCopyMent?: (row: StudentRow) => void
}) {
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
      <TableCell className="py-2">
        <Input
          type="number"
          min={0}
          value={row.mathFee ?? ''}
          onChange={(e) =>
            updateStudent(row.id, {
              mathFee: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="h-9 w-24 rounded-md border-border text-right tabular-nums"
        />
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
          value={row.materialsFeeReason ?? ''}
          onChange={(e) => updateStudent(row.id, { materialsFeeReason: e.target.value })}
          placeholder="사유 입력"
          className="h-9 min-w-[80px] rounded-md border-border bg-background text-sm"
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
      <TableCell className="py-2 text-right text-sm tabular-nums font-medium text-destructive">
        {formatWon(row.discountAmount ?? 0)}
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
      <TableCell className="shrink-0 py-2">
        {onCopyMent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => onCopyMent(row)}
              >
                <Copy className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap text-xs">멘트 복사</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>학부모에게 보낼 수강료·셔틀·교재비 멘트를 클립보드에 복사합니다</TooltipContent>
          </Tooltip>
        )}
      </TableCell>
      <TableCell className="shrink-0 py-2">
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
  '최종 금액 = (기본 수업료(수학 수강료 포함) × 0.95^형제할인) + 셔틀비 + 교재비 - 결석 차감'

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
  const updateStudent = useTuitionStore((s) => s.updateStudent)
  const displayStudents = useDisplayStudents()
  const sortBy = useTuitionStore((s) => s.sortBy)
  const sortOrder = useTuitionStore((s) => s.sortOrder)
  const [nameSearch, setNameSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState<FilterGrade>(FILTER_ALL)
  const [filterSibling, setFilterSibling] = useState<FilterSibling>(FILTER_ALL)
  const [filterShuttle, setFilterShuttle] = useState<FilterShuttle>(FILTER_ALL)
  const [filterPaid, setFilterPaid] = useState<FilterPaid>(FILTER_ALL)

  const filteredStudents = useMemo(() => {
    let list = displayStudents
    const q = nameSearch.trim().toLowerCase()
    if (q) {
      list = list.filter((row) => (row.name ?? '').toLowerCase().includes(q))
    }
    if (filterGrade !== FILTER_ALL) {
      list = list.filter((row) => row.grade === filterGrade)
    }
    if (filterSibling !== FILTER_ALL) {
      const want = filterSibling === 'yes'
      list = list.filter((row) => Boolean(row.siblingDiscount) === want)
    }
    if (filterShuttle !== FILTER_ALL) {
      list = list.filter((row) => row.shuttle === filterShuttle)
    }
    if (filterPaid !== FILTER_ALL) {
      const wantPaid = filterPaid === 'yes'
      list = list.filter((row) => (row.isPaid ?? true) === wantPaid)
    }
    return list
  }, [displayStudents, nameSearch, filterGrade, filterSibling, filterShuttle, filterPaid])

  const totalCount = students.length
  const filteredCount = filteredStudents.length
  const hasFilter =
    nameSearch.trim() ||
    filterGrade !== FILTER_ALL ||
    filterSibling !== FILTER_ALL ||
    filterShuttle !== FILTER_ALL ||
    filterPaid !== FILTER_ALL

  const handleSetAllPaid = (paid: boolean) => {
    students.forEach((row) => updateStudent(row.id, { isPaid: paid }))
  }

  const [toastVisible, setToastVisible] = useState(false)
  const handleMentCopy = useCallback(async (row: StudentRow) => {
    const text = buildParentMessage(row)
    try {
      await navigator.clipboard.writeText(text)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 2500)
    } catch {
      alert('복사에 실패했습니다.')
    }
  }, [])

  return (
    <div className="relative space-y-4">
      {toastVisible && (
        <div className="fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-green-700/30 bg-green-600 px-4 py-3 text-base font-semibold text-white shadow-xl ring-2 ring-green-400/20">
          <Check className="h-5 w-5 shrink-0" />
          <span>학부모용 멘트가 클립보드에 복사되었습니다</span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {hasFilter ? (
            <>
              검색 <strong className="text-foreground">{filteredCount}</strong>건
              <span className="ml-1 text-xs">(전체 {totalCount}건)</span>
            </>
          ) : (
            <>
              총 <strong className="text-foreground">{totalCount}</strong>건
            </>
          )}
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
        <span className="text-xs font-semibold text-muted-foreground shrink-0 w-full sm:w-auto">상세검색</span>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">이름</label>
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="검색"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="h-8 w-32 pl-7 rounded-md border-border text-xs"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">구분</label>
          <Select value={filterGrade} onValueChange={(v) => setFilterGrade(v as FilterGrade)}>
            <SelectTrigger className="h-8 w-[110px] rounded-md border-border text-xs">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL} className="text-xs">전체</SelectItem>
              {GRADE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">형제 할인</label>
          <Select value={filterSibling} onValueChange={(v) => setFilterSibling(v as FilterSibling)}>
            <SelectTrigger className="h-8 w-[80px] rounded-md border-border text-xs">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL} className="text-xs">전체</SelectItem>
              <SelectItem value="yes" className="text-xs">O</SelectItem>
              <SelectItem value="no" className="text-xs">X</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">셔틀</label>
          <Select value={filterShuttle} onValueChange={(v) => setFilterShuttle(v as FilterShuttle)}>
            <SelectTrigger className="h-8 w-[110px] rounded-md border-border text-xs">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL} className="text-xs">전체</SelectItem>
              {SHUTTLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">납부 완료</label>
          <Select value={filterPaid} onValueChange={(v) => setFilterPaid(v as FilterPaid)}>
            <SelectTrigger className="h-8 w-[90px] rounded-md border-border text-xs">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL} className="text-xs">전체</SelectItem>
              <SelectItem value="yes" className="text-xs">완료</SelectItem>
              <SelectItem value="no" className="text-xs">미완료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/60 text-xs hover:bg-muted/60">
              <TableHead className="w-14 shrink-0 py-2.5 text-center font-semibold">No</TableHead>
              <SortableHead column="name">이름</SortableHead>
              <SortableHead column="grade">구분</SortableHead>
              <TableHead className="py-2.5 font-semibold">수학 수강료</TableHead>
              <SortableHead column="siblingDiscount" className="whitespace-nowrap text-center">
                형제 할인
              </SortableHead>
              <SortableHead column="shuttle">셔틀</SortableHead>
              <TableHead className="py-2.5 font-semibold">교재비</TableHead>
              <TableHead className="py-2.5 font-semibold">교재비 사유</TableHead>
              <TableHead className="py-2.5 font-semibold">결석 차감</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-center font-semibold">
                <span className="block">납부 완료</span>
                <span className="mt-1 flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleSetAllPaid(true)}
                  >
                    전체 체크
                  </Button>
                  <span className="text-muted-foreground/50">|</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleSetAllPaid(false)}
                  >
                    전체 해제
                  </Button>
                </span>
              </TableHead>
              <TableHead className="py-2.5 font-semibold">납부 금액</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-right font-semibold">기본 수업료</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-right font-semibold">셔틀비</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-right font-semibold text-destructive">할인금액</TableHead>
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
              <TableHead className="whitespace-nowrap py-2.5 text-center font-semibold">학부모용 멘트</TableHead>
              <TableHead className="whitespace-nowrap py-2.5 text-center font-semibold">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={20} className="h-32 text-center text-muted-foreground">
                  {hasFilter
                    ? '검색 결과가 없습니다. 조건을 바꿔 보세요.'
                    : '등록된 학생이 없습니다. 엑셀을 불러오거나 "행 추가"로 추가해 보세요.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((row, index) => (
                <EditableRow
                  key={row.id}
                  row={row}
                  index={index}
                  onCopyMent={handleMentCopy}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
