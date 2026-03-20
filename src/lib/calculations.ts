import type { StudentRow, StudentGrade, ShuttleType } from '@/types'
import { BASE_TUITION, SHUTTLE_FEE, SIBLING_DISCOUNT_RATE } from './constants'

export function getBaseTuition(grade: StudentGrade): number {
  return BASE_TUITION[grade] ?? 0
}

export function getShuttleFee(shuttle: ShuttleType): number {
  return SHUTTLE_FEE[shuttle] ?? 0
}

type RowWithLegacy = StudentRow & { siblingDiscount?: boolean }

/**
 * 기본+수학 합산 수업료에 적용되는 할인액(원).
 * - `discount` 입력값(음수는 0으로)
 * - 예전 저장 데이터: 형제할인 O 이고 할인 0이면 5%에 해당하는 금액으로 환산
 * - 수업료 합을 넘지 않도록 상한
 */
export function appliedTuitionDiscountWon(row: StudentRow, effectiveBase: number): number {
  let d = Math.max(0, Number(row.discount) || 0)
  const legacy = row as RowWithLegacy
  if (d === 0 && legacy.siblingDiscount === true) {
    d = Math.round(effectiveBase * (1 - SIBLING_DISCOUNT_RATE))
  }
  return Math.min(d, effectiveBase)
}

/**
 * 최종 금액 = max(0, 기본+수학 − 할인) + 셔틀비 + 교재비 − 결석 차감
 */
export function calculateFinalAmount(row: StudentRow): Pick<StudentRow, 'baseTuition' | 'shuttleFee' | 'discountAmount' | 'finalAmount'> {
  const gradeBase = getBaseTuition(row.grade)
  const mathFee = Number(row.mathFee) || 0
  const effectiveBase = gradeBase + mathFee
  const shuttleFee = getShuttleFee(row.shuttle)
  const tuitionDiscount = appliedTuitionDiscountWon(row, effectiveBase)
  const tuitionAfter = Math.max(0, effectiveBase - tuitionDiscount)
  const materialsFee = Number(row.materialsFee) || 0
  const absenceDeduction = Number(row.absenceDeduction) || 0
  const finalAmount = Math.max(0, tuitionAfter + shuttleFee + materialsFee - absenceDeduction)
  const discountAmount = tuitionDiscount + absenceDeduction
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
