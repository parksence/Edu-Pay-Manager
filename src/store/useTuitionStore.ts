import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StudentRow } from '@/types'
import { calculateFinalAmount, applyCalculations } from '@/lib/calculations'
import { sortStudents, type SortColumn } from '@/lib/sortStudents'

interface TuitionState {
  students: StudentRow[]
  sortBy: SortColumn | null
  sortOrder: 'asc' | 'desc'
  setStudents: (rows: StudentRow[]) => void
  setSort: (column: SortColumn | null, order: 'asc' | 'desc' | null) => void
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

      setStudents: (rows) => set({ students: applyCalculations(rows) }),

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
