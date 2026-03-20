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
import { Label } from '@/components/ui/label'
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
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { HelpCircle, Search, Copy, Check, Columns3 } from 'lucide-react'
import { useTuitionStore, useDisplayStudents } from '@/store/useTuitionStore'
import { GRADE_OPTIONS, SHUTTLE_OPTIONS } from '@/lib/constants'
import { buildParentMessage } from '@/lib/parentMessage'
import type { SortColumn } from '@/lib/sortStudents'
import type { StudentRow, StudentGrade, ShuttleType } from '@/types'

const FILTER_ALL = 'all'

/** 상세검색: 구분 값 */
type FilterGrade = StudentGrade | typeof FILTER_ALL

/** 테이블 컬럼 가시성(헤더·행 순서와 동일) */
const TABLE_COLUMN_DEFS = [
  { id: 'no', label: 'No' },
  { id: 'name', label: '이름' },
  { id: 'grade', label: '구분' },
  { id: 'mathFee', label: '수학 수강료' },
  { id: 'discount', label: '할인' },
  { id: 'shuttle', label: '셔틀' },
  { id: 'materialsFee', label: '교재비' },
  { id: 'materialsFeeReason', label: '교재비 사유' },
  { id: 'absenceDeduction', label: '결석 차감' },
  { id: 'baseTuition', label: '기본 수업료' },
  { id: 'shuttleFee', label: '셔틀비' },
  { id: 'discountAmount', label: '할인금액' },
  { id: 'finalAmount', label: '최종 금액' },
  { id: 'notes', label: '비고' },
  { id: 'copyMent', label: '학부모용 멘트' },
  { id: 'actions', label: '작업(삭제)' },
] as const

type TuitionTableColumnId = (typeof TABLE_COLUMN_DEFS)[number]['id']

function createDefaultVisibleColumns(): Record<TuitionTableColumnId, boolean> {
  return Object.fromEntries(
    TABLE_COLUMN_DEFS.map((c) => [c.id, true])
  ) as Record<TuitionTableColumnId, boolean>
}

function formatWon(n: number): string {
  return n.toLocaleString('ko-KR')
}

function EditableRow({
  row,
  index,
  visibleColumns,
  onCopyMent,
}: {
  row: StudentRow
  index: number
  visibleColumns: Record<TuitionTableColumnId, boolean>
  onCopyMent?: (row: StudentRow) => void
}) {
  const updateStudent = useTuitionStore((s) => s.updateStudent)
  const removeStudent = useTuitionStore((s) => s.removeStudent)
  const show = (id: TuitionTableColumnId) => visibleColumns[id]

  return (
    <TableRow className="group hover:bg-muted/50">
      {show('no') && (
      <TableCell className="w-14 shrink-0 py-2 text-center text-sm font-medium text-muted-foreground tabular-nums">
        {index + 1}
      </TableCell>
      )}
      {show('name') && (
      <TableCell className="py-2">
        <Input
          value={row.name}
          onChange={(e) => updateStudent(row.id, { name: e.target.value })}
          placeholder="이름 입력"
          className="h-9 min-w-[90px] rounded-md border-border bg-background font-bold transition-colors"
        />
      </TableCell>
      )}
      {show('grade') && (
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
      )}
      {show('mathFee') && (
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
      )}
      {show('discount') && (
      <TableCell className="py-2">
        <Input
          type="number"
          min={0}
          value={row.discount ?? ''}
          onChange={(e) =>
            updateStudent(row.id, {
              discount: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="h-9 w-24 rounded-md border-border text-right tabular-nums"
        />
      </TableCell>
      )}
      {show('shuttle') && (
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
      )}
      {show('materialsFee') && (
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
      )}
      {show('materialsFeeReason') && (
      <TableCell className="py-2">
        <Input
          value={row.materialsFeeReason ?? ''}
          onChange={(e) => updateStudent(row.id, { materialsFeeReason: e.target.value })}
          placeholder="사유 입력"
          className="h-9 min-w-[80px] rounded-md border-border bg-background text-sm"
        />
      </TableCell>
      )}
      {show('absenceDeduction') && (
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
      )}
      {show('baseTuition') && (
      <TableCell className="py-2 text-right text-sm tabular-nums text-muted-foreground">
        {formatWon(row.baseTuition ?? 0)}
      </TableCell>
      )}
      {show('shuttleFee') && (
      <TableCell className="py-2 text-right text-sm tabular-nums text-muted-foreground">
        {formatWon(row.shuttleFee ?? 0)}
      </TableCell>
      )}
      {show('discountAmount') && (
      <TableCell className="py-2 text-right text-sm tabular-nums font-medium text-destructive">
        {formatWon(row.discountAmount ?? 0)}
      </TableCell>
      )}
      {show('finalAmount') && (
      <TableCell className="py-2 text-right font-bold tabular-nums text-foreground">
        {formatWon(row.finalAmount ?? 0)}
      </TableCell>
      )}
      {show('notes') && (
      <TableCell className="py-2">
        <Input
          value={row.notes ?? ''}
          onChange={(e) => updateStudent(row.id, { notes: e.target.value })}
          placeholder="비고"
          className="h-9 min-w-[100px] rounded-md border-border bg-background text-sm"
        />
      </TableCell>
      )}
      {show('copyMent') && (
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
      )}
      {show('actions') && (
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
      )}
    </TableRow>
  )
}

const SORT_LABELS: Record<SortColumn, string> = {
  name: '이름',
  grade: '구분',
  discount: '할인',
  shuttle: '셔틀',
  finalAmount: '최종 금액',
}

const FORMULA_TOOLTIP =
  '최종 금액 = max(0, 기본+수학 수업료 − 할인) + 셔틀비 + 교재비 − 결석 차감'

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
      className={`cursor-pointer select-none text-center font-semibold hover:text-foreground ${className}`}
      onClick={cycle}
      title={`클릭하면 ${SORT_LABELS[column]} 정렬`}
    >
      <span className="inline-flex items-center justify-center gap-1">
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
  const [nameSearch, setNameSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState<FilterGrade>(FILTER_ALL)
  const [visibleColumns, setVisibleColumns] = useState<Record<TuitionTableColumnId, boolean>>(
    createDefaultVisibleColumns
  )
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const columnMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!columnMenuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (columnMenuRef.current?.contains(e.target as Node)) return
      setColumnMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [columnMenuOpen])

  const visibleColumnCount = useMemo(
    () => TABLE_COLUMN_DEFS.filter((c) => visibleColumns[c.id]).length,
    [visibleColumns]
  )

  const showCol = (id: TuitionTableColumnId) => visibleColumns[id]
  const toggleColumnVisibility = (id: TuitionTableColumnId) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      const count = TABLE_COLUMN_DEFS.filter((c) => next[c.id]).length
      if (count === 0) return prev
      return next
    })
  }

  const filteredStudents = useMemo(() => {
    let list = displayStudents
    const q = nameSearch.trim().toLowerCase()
    if (q) {
      list = list.filter((row) => (row.name ?? '').toLowerCase().includes(q))
    }
    if (filterGrade !== FILTER_ALL) {
      list = list.filter((row) => row.grade === filterGrade)
    }
    return list
  }, [displayStudents, nameSearch, filterGrade])

  const totalCount = students.length
  const filteredCount = filteredStudents.length
  const hasFilter = nameSearch.trim() || filterGrade !== FILTER_ALL

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
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative z-50" ref={columnMenuRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-md shadow-sm gap-1.5"
              aria-expanded={columnMenuOpen}
              aria-haspopup="dialog"
              onClick={() => setColumnMenuOpen((o) => !o)}
            >
              <Columns3 className="h-4 w-4 shrink-0" />
              컬럼 설정
            </Button>
            {columnMenuOpen && (
              <div
                className="absolute right-0 top-full z-[120] mt-1.5 w-[min(calc(100vw-2rem),280px)] max-h-[min(70vh,22rem)] overflow-y-auto rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                role="dialog"
                aria-label="표시할 컬럼 선택"
              >
                <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">표시할 컬럼</p>
                <ul className="space-y-0.5">
                  {TABLE_COLUMN_DEFS.map((col) => (
                    <li key={col.id}>
                      <Label
                        htmlFor={`col-vis-${col.id}`}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/80"
                      >
                        <Checkbox
                          id={`col-vis-${col.id}`}
                          checked={visibleColumns[col.id]}
                          onCheckedChange={() => toggleColumnVisibility(col.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <span className="leading-tight">{col.label}</span>
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button type="button" onClick={() => addStudent()} className="rounded-md shadow-sm">
            + 행 추가
          </Button>
        </div>
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
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/60 text-xs hover:bg-muted/60">
              {showCol('no') && (
                <TableHead className="w-14 shrink-0 py-2.5 font-semibold">No</TableHead>
              )}
              {showCol('name') && <SortableHead column="name">이름</SortableHead>}
              {showCol('grade') && <SortableHead column="grade">구분</SortableHead>}
              {showCol('mathFee') && (
                <TableHead className="py-2.5 font-semibold">수학 수강료</TableHead>
              )}
              {showCol('discount') && (
                <SortableHead column="discount" className="whitespace-nowrap font-semibold">
                  할인
                </SortableHead>
              )}
              {showCol('shuttle') && <SortableHead column="shuttle">셔틀</SortableHead>}
              {showCol('materialsFee') && (
                <TableHead className="py-2.5 font-semibold">교재비</TableHead>
              )}
              {showCol('materialsFeeReason') && (
                <TableHead className="py-2.5 font-semibold">교재비 사유</TableHead>
              )}
              {showCol('absenceDeduction') && (
                <TableHead className="py-2.5 font-semibold">결석 차감</TableHead>
              )}
              {showCol('baseTuition') && (
                <TableHead className="whitespace-nowrap py-2.5 font-semibold">기본 수업료</TableHead>
              )}
              {showCol('shuttleFee') && (
                <TableHead className="whitespace-nowrap py-2.5 font-semibold">셔틀비</TableHead>
              )}
              {showCol('discountAmount') && (
                <TableHead className="whitespace-nowrap py-2.5 font-semibold text-destructive">
                  할인금액
                </TableHead>
              )}
              {showCol('finalAmount') && (
                <SortableHead column="finalAmount" className="whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-1">
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
              )}
              {showCol('notes') && (
                <TableHead className="whitespace-nowrap py-2.5 font-semibold">비고</TableHead>
              )}
              {showCol('copyMent') && (
                <TableHead className="whitespace-nowrap py-2.5 font-semibold">학부모용 멘트</TableHead>
              )}
              {showCol('actions') && (
                <TableHead className="whitespace-nowrap py-2.5 font-semibold">작업</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Math.max(visibleColumnCount, 1)}
                  className="h-32 text-center text-muted-foreground"
                >
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
                  visibleColumns={visibleColumns}
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
