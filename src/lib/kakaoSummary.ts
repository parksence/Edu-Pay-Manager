/** 카톡 보고용 요약 데이터 */
export interface KakaoSummaryInput {
  /** 결산일자 (오늘) */
  settlementDate: string
  /** 총 예상 매출 */
  totalRevenue: number
  /** 총 학생 수 */
  studentCount: number
  /** 교재비 합계 */
  materialsRevenue: number
  /** 총 차감액 (결석 등) */
  totalDeduction: number
}

function formatWon(n: number): string {
  return `${n.toLocaleString('ko-KR')}원`
}

/**
 * 대시보드 데이터를 카카오톡 붙여넣기용 텍스트로 변환
 */
export function buildKakaoSummary(input: KakaoSummaryInput): string {
  const lines: string[] = []

  lines.push(`[결산일자] ${input.settlementDate}`)
  lines.push('')
  lines.push(`[매출 요약] 총 예상 매출 ${formatWon(input.totalRevenue)} / 총 ${input.studentCount}명`)
  lines.push('')
  lines.push(`[항목별] 교재비 합계 ${formatWon(input.materialsRevenue)} / 총 차감액 ${formatWon(input.totalDeduction)}`)

  return lines.join('\n')
}
