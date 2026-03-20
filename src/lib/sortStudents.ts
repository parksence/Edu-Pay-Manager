import type { StudentRow, StudentGrade, ShuttleType } from '@/types'

/** 정렬 가능한 컬럼 */
export type SortColumn = 'name' | 'grade' | 'discount' | 'shuttle' | 'finalAmount'

const GRADE_ORDER: StudentGrade[] = [
  'elementary_principal',
  'elementary_regular',
  'middle_principal',
  'middle_regular',
  'high',
]

const SHUTTLE_ORDER: ShuttleType[] = [
  'dunsan_one',
  'dunsan_round',
  'other_one',
  'other_round',
  'none',
]

export function sortStudents(
  students: StudentRow[],
  sortBy: SortColumn | null,
  sortOrder: 'asc' | 'desc'
): StudentRow[] {
  if (sortBy === null) return students
  const arr = [...students]
  const mult = sortOrder === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'name':
        cmp = (a.name || '').localeCompare(b.name || '', 'ko-KR')
        break
      case 'grade':
        cmp = GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade)
        break
      case 'discount':
        cmp = (Number(a.discount) || 0) - (Number(b.discount) || 0)
        break
      case 'shuttle':
        cmp = SHUTTLE_ORDER.indexOf(a.shuttle) - SHUTTLE_ORDER.indexOf(b.shuttle)
        break
      case 'finalAmount':
        cmp = (a.finalAmount ?? 0) - (b.finalAmount ?? 0)
        break
      default:
        return 0
    }
    return mult * cmp
  })
  return arr
}
