import type { StudentRow, StudentGrade, ShuttleType } from '@/types'
import { BASE_TUITION, SHUTTLE_FEE, SIBLING_DISCOUNT_RATE } from './constants'

export function getBaseTuition(grade: StudentGrade): number {
  return BASE_TUITION[grade] ?? 0
}

export function getShuttleFee(shuttle: ShuttleType): number {
  return SHUTTLE_FEE[shuttle] ?? 0
}

/**
 * 최종 금액 = (기본 수업료(수학 수강료 포함) × 0.95^형제할인) + 셔틀비 + 교재비 - 결석 차감
 * 형제 할인 true → ×0.95, false → ×1
 */
export function calculateFinalAmount(row: StudentRow): Pick<StudentRow, 'baseTuition' | 'shuttleFee' | 'discountAmount' | 'finalAmount'> {
  const gradeBase = getBaseTuition(row.grade)
  const mathFee = Number(row.mathFee) || 0
  const effectiveBase = gradeBase + mathFee
  const shuttleFee = getShuttleFee(row.shuttle)
  const discountedTuition = effectiveBase * Math.pow(SIBLING_DISCOUNT_RATE, row.siblingDiscount ? 1 : 0)
  const materialsFee = Number(row.materialsFee) || 0
  const absenceDeduction = Number(row.absenceDeduction) || 0
  const finalAmount = Math.max(0, discountedTuition + shuttleFee + materialsFee - absenceDeduction)
  const discountAmount = (effectiveBase - discountedTuition) + absenceDeduction
  return {
    baseTuition: effectiveBase,
    shuttleFee,
    discountAmount,
    finalAmount,
  }
}

/** 여러 행에 대해 계산 필드 적용 */
export function applyCalculations(rows: StudentRow[]): StudentRow[] {
  return rows.map((row) => {
    const calc = calculateFinalAmount(row)
    return { ...row, ...calc }
  })
}
