import type { StudentGrade, ShuttleType } from '@/types'

/** 구분별 기본 수업료 (원) */
export const BASE_TUITION: Record<StudentGrade, number> = {
  elementary_principal: 320_000,
  elementary_regular: 300_000,
  middle_principal: 340_000,
  middle_regular: 320_000,
  high: 350_000,
}

/** 셔틀 유형별 요금 (원) */
export const SHUTTLE_FEE: Record<ShuttleType, number> = {
  dunsan_one: 10_000,
  dunsan_round: 20_000,
  other_one: 15_000,
  other_round: 30_000,
  none: 0,
}

/** 형제 할인율 (기본 수업료 × 0.95) */
export const SIBLING_DISCOUNT_RATE = 0.95

/** 구분 한글 라벨 (UI·엑셀 매핑) */
export const GRADE_LABELS: Record<StudentGrade, string> = {
  elementary_principal: '초등(원장)',
  elementary_regular: '초등',
  middle_principal: '중등(원장)',
  middle_regular: '중등',
  high: '고등',
}

/** 셔틀 한글 라벨 (둔산 왕복→둔산, 기타 왕복→기타) */
export const SHUTTLE_LABELS: Record<ShuttleType, string> = {
  dunsan_one: '둔산 편도',
  dunsan_round: '둔산',
  other_one: '기타 편도',
  other_round: '기타',
  none: '해당 없음',
}

/** Select 옵션용 배열 */
export const GRADE_OPTIONS = Object.entries(GRADE_LABELS).map(([value, label]) => ({
  value: value as StudentGrade,
  label,
}))

export const SHUTTLE_OPTIONS = Object.entries(SHUTTLE_LABELS).map(([value, label]) => ({
  value: value as ShuttleType,
  label,
}))

/** 한글 라벨 → 내부 값 (엑셀 Import용, 예전 라벨도 호환) */
export const LABEL_TO_GRADE: Record<string, StudentGrade> = {
  ...Object.fromEntries(Object.entries(GRADE_LABELS).map(([k, v]) => [v, k as StudentGrade])),
  '초등(원장님반)': 'elementary_principal',
  '초등(일반)': 'elementary_regular',
  '중등(원장님반)': 'middle_principal',
  '중등(일반)': 'middle_regular',
}

/** 한글 라벨 → 셔틀 (빈값=해당 없음, 예전 표기 호환) */
export const LABEL_TO_SHUTTLE: Record<string, ShuttleType> = {
  ...Object.fromEntries(Object.entries(SHUTTLE_LABELS).map(([k, v]) => [v, k as ShuttleType])),
  '둔산 왕복': 'dunsan_round',
  '기타 왕복': 'other_round',
}
