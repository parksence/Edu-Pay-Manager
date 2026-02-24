import { useMemo } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { persist } from 'zustand/middleware'
import type { StudentRow } from '@/types'
import { calculateFinalAmount, applyCalculations } from '@/lib/calculations'
import { sortStudents, type SortColumn } from '@/lib/sortStudents'

interface TuitionState {
  students: StudentRow[]
  sortBy: SortColumn | null
  sortOrder: 'asc' | 'desc'
  /** 원장님 브리핑 모드 (테이블 숨김, 카드·차트 위주) */
  briefingMode: boolean
  setStudents: (rows: StudentRow[]) => void
  setSort: (column: SortColumn | null, order: 'asc' | 'desc' | null) => void
  setBriefingMode: (on: boolean) => void
  addStudent: (row?: Partial<StudentRow>) => void
  updateStudent: (id: string, patch: Partial<StudentRow>) => void
  removeStudent: (id: string) => void
}

export const useTuitionStore = create<TuitionState>()(
  persist(
    (set, get) => ({
      students: [],
      sortBy: null,
      sortOrder: 'asc',
      briefingMode: false,

      setStudents: (rows) => set({ students: applyCalculations(rows) }),
      setBriefingMode: (on) => set({ briefingMode: on }),

      setSort: (column, order) =>
        set({
          sortBy: order !== null && column !== null ? column : null,
          sortOrder: order ?? get().sortOrder,
        }),

      addStudent: (row) => {
        const id = crypto.randomUUID()
        const newRow: StudentRow = {
          id,
          name: row?.name ?? '',
          grade: row?.grade ?? 'elementary_regular',
          siblingDiscount: row?.siblingDiscount ?? false,
          shuttle: row?.shuttle ?? 'none',
          materialsFee: row?.materialsFee ?? 0,
          absenceDeduction: row?.absenceDeduction ?? 0,
          isPaid: row?.isPaid ?? true,
          paidAmount: row?.paidAmount ?? 0,
          notes: row?.notes ?? '',
          phone: row?.phone ?? '',
        }
        const withCalc = applyCalculations([newRow])[0]
        set({ students: [...get().students, withCalc] })
      },

      updateStudent: (id, patch) => {
        set({
          students: get().students.map((s) => {
            if (s.id !== id) return s
            const updated = { ...s, ...patch }
            const calc = calculateFinalAmount(updated)
            return { ...updated, ...calc }
          }),
        })
      },

      removeStudent: (id) =>
        set({ students: get().students.filter((s) => s.id !== id) }),
    }),
    {
      name: 'edu-pay-storage',
      partialize: (state) => ({ students: state.students }), // sortBy, sortOrder는 저장 안 함
    }
  )
)

/** 총 예상 매출액 (selector로 반응형) */
export function useTotalRevenue(): number {
  return useTuitionStore((state) =>
    state.students.reduce((sum, s) => sum + (s.finalAmount ?? 0), 0)
  )
}

/** 기타 수익 (교재비 합계) */
export function useMaterialsRevenue(): number {
  return useTuitionStore((state) =>
    state.students.reduce((sum, s) => sum + (s.materialsFee ?? 0), 0)
  )
}

/** 미수금/차감 현황 (결석 차감 합계) */
export function useTotalDeduction(): number {
  return useTuitionStore((state) =>
    state.students.reduce((sum, s) => sum + (s.absenceDeduction ?? 0), 0)
  )
}

/** 미납 인원 수 & 미납 금액 합계 (원장님 KPI용) */
export function useUnpaidSummary(): { count: number; totalAmount: number } {
  return useTuitionStore(
    useShallow((state) => {
      let count = 0
      let totalAmount = 0
      for (const s of state.students) {
        const final = s.finalAmount ?? 0
        const paid =
          (s.isPaid ?? true) && (s.paidAmount ?? 0) === 0 ? final : (s.paidAmount ?? 0)
        const unpaid = final - paid
        if (unpaid > 0) {
          count += 1
          totalAmount += unpaid
        }
      }
      return { count, totalAmount }
    })
  )
}

/** 미납자 명단: 이름 + 미납 금액 (원장님 KPI/PDF용) */
export type UnpaidStudent = { name: string; unpaidAmount: number; notes?: string; phone?: string }

/** students에서 미납자만 추출 (컴포넌트에서 useMemo와 함께 사용) */
export function getUnpaidStudents(students: StudentRow[]): UnpaidStudent[] {
  const list: UnpaidStudent[] = []
  for (const s of students) {
    const final = s.finalAmount ?? 0
    const paid =
      (s.isPaid ?? true) && (s.paidAmount ?? 0) === 0 ? final : (s.paidAmount ?? 0)
    const unpaid = final - paid
    if (unpaid > 0) {
      list.push({ name: s.name || '(이름 없음)', unpaidAmount: unpaid, notes: s.notes ?? '', phone: s.phone ?? '' })
    }
  }
  return list
}

/** 학생 수 현황: 초/중/고 등급별 인원 */
export type StudentsByGrade = { 초등: number; 중등: number; 고등: number }

export function useStudentsByGrade(): StudentsByGrade {
  return useTuitionStore(
    useShallow((state) => {
      const acc: StudentsByGrade = { 초등: 0, 중등: 0, 고등: 0 }
      for (const s of state.students) {
        if (s.grade.startsWith('elementary')) acc.초등 += 1
        else if (s.grade.startsWith('middle')) acc.중등 += 1
        else if (s.grade === 'high') acc.고등 += 1
      }
      return acc
    })
  )
}

/** 정렬된 학생 목록 (테이블·엑셀 내보내기 공용) */
export function useDisplayStudents(): StudentRow[] {
  const students = useTuitionStore((s) => s.students)
  const sortBy = useTuitionStore((s) => s.sortBy)
  const sortOrder = useTuitionStore((s) => s.sortOrder)
  return useMemo(
    () => sortStudents(students, sortBy, sortOrder),
    [students, sortBy, sortOrder]
  )
}
