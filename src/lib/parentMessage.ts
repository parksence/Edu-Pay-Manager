import type { StudentRow } from '@/types'
import { SIBLING_DISCOUNT_RATE } from './constants'

/** 만원/천원 포맷: 350000 → "35만원", 5000 → "5천원", 1400 → "1,400원" */
export function formatManChonWon(n: number): string {
  if (n >= 10_000) {
    const man = n / 10_000
    return (man % 1 === 0 ? man : man.toFixed(1)) + '만원'
  }
  if (n >= 1_000) {
    const chon = n / 1_000
    return (chon % 1 === 0 ? chon : chon.toFixed(1)) + '천원'
  }
  return n.toLocaleString('ko-KR') + '원'
}

/** 교재비 등 원 단위 그대로 표기 */
export function formatWonOnly(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

/**
 * 학부모에게 보낼 복붙 멘트 한 줄 생성
 * - N월 수강료(영어 O만원[, 수학 O만원]), N월 셔틀비(O만원), 교재비(사유_O원)[, - 결석 차감][, - 형제 할인]
 */
export function buildParentMessage(row: StudentRow, month?: number): string {
  const m = month ?? new Date().getMonth() + 1
  const baseTuition = row.baseTuition ?? 0
  const discountedBase = Math.round(
    baseTuition * (row.siblingDiscount ? SIBLING_DISCOUNT_RATE : 1)
  )
  const mathFee = row.mathFee ?? 0
  const shuttleFee = row.shuttleFee ?? 0
  const materialsFee = Number(row.materialsFee) || 0
  const materialsFeeReason = (row.materialsFeeReason ?? '').trim()
  const absenceDeduction = Number(row.absenceDeduction) || 0
  const siblingDiscountAmount = row.siblingDiscount ? baseTuition - discountedBase : 0

  const parts: string[] = []

  // 수강료 (0원이면 생략)
  if (discountedBase > 0 || mathFee > 0) {
    if (mathFee === 0) {
      parts.push(`${m}월 수강료(${formatManChonWon(discountedBase)})`)
    } else {
      parts.push(
        `${m}월 수강료 (영어 ${formatManChonWon(discountedBase)}, 수학 ${formatManChonWon(mathFee)})`
      )
    }
  }

  // 셔틀비 (0원이면 생략)
  if (shuttleFee > 0) {
    parts.push(`${m}월 셔틀비(${formatManChonWon(shuttleFee)})`)
  }

  // 교재비
  if (materialsFee > 0) {
    if (materialsFeeReason) {
      parts.push(`교재비(${materialsFeeReason}_${formatWonOnly(materialsFee)})`)
    } else {
      parts.push(`교재비(${formatWonOnly(materialsFee)})`)
    }
  }

  // 차감: 결석 차감 먼저, 형제 할인 나중
  if (absenceDeduction > 0) {
    parts.push(` - 결석 차감 ${formatManChonWon(absenceDeduction)}`)
  }
  if (siblingDiscountAmount > 0) {
    parts.push(` - 형제 할인 ${formatManChonWon(siblingDiscountAmount)}`)
  }

  return parts.join(', ')
}
