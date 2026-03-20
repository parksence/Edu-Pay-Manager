import type { StudentRow } from '@/types'
import { getBaseTuition, appliedTuitionDiscountWon } from './calculations'

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

/** 안내 멘트에 쓸 월(1–12): 기본은 오늘 기준 다음 달(연말→다음 해 1월) */
export function getDefaultMentMonth(reference = new Date()): number {
  return new Date(reference.getFullYear(), reference.getMonth() + 1, 1).getMonth() + 1
}

/**
 * 학부모에게 보낼 복붙 멘트 한 줄 생성
 * - N월 수강료·셔틀비: 기본 N은 다음 달 (`month` 생략 시)
 */
export function buildParentMessage(row: StudentRow, month?: number): string {
  const m = month ?? getDefaultMentMonth()
  const english = getBaseTuition(row.grade)
  const mathFee = Number(row.mathFee) || 0
  const effectiveBase = english + mathFee
  const disc = appliedTuitionDiscountWon(row, effectiveBase)
  const tuitionAfter = Math.max(0, effectiveBase - disc)
  const shuttleFee = row.shuttleFee ?? 0
  const materialsFee = Number(row.materialsFee) || 0
  const materialsFeeReason = (row.materialsFeeReason ?? '').trim()
  const absenceDeduction = Number(row.absenceDeduction) || 0

  const parts: string[] = []

  if (effectiveBase > 0) {
    if (mathFee === 0) {
      parts.push(`${m}월 수강료(${formatManChonWon(tuitionAfter)})`)
    } else {
      const enShare =
        effectiveBase > 0 ? Math.round((tuitionAfter * english) / effectiveBase) : 0
      const mathShare = tuitionAfter - enShare
      parts.push(
        `${m}월 수강료 (영어 ${formatManChonWon(enShare)}, 수학 ${formatManChonWon(mathShare)})`
      )
    }
  }

  if (shuttleFee > 0) {
    parts.push(`${m}월 셔틀비(${formatManChonWon(shuttleFee)})`)
  }

  if (materialsFee > 0) {
    if (materialsFeeReason) {
      parts.push(`교재비(${materialsFeeReason}_${formatWonOnly(materialsFee)})`)
    } else {
      parts.push(`교재비(${formatWonOnly(materialsFee)})`)
    }
  }

  if (absenceDeduction > 0) {
    parts.push(` - 결석 차감 ${formatManChonWon(absenceDeduction)}`)
  }

  return parts.join(', ')
}
