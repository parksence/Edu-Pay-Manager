/** 학생 구분 (기본 수업료 결정) */
export type StudentGrade =
  | 'elementary_principal'  // 초등(원장)
  | 'elementary_regular'    // 초등
  | 'middle_principal'     // 중등(원장)
  | 'middle_regular'       // 중등
  | 'high';                // 고등

/** 셔틀 유형 (셔틀비 결정) */
export type ShuttleType =
  | 'dunsan_one'   // 둔산 편도
  | 'dunsan_round' // 둔산 왕복
  | 'other_one'    // 기타 지역 편도
  | 'other_round'  // 기타 지역 왕복
  | 'none';        // 해당 없음

export interface StudentRow {
  id: string;
  name: string;
  grade: StudentGrade;
  siblingDiscount: boolean;
  shuttle: ShuttleType;
  materialsFee: number;
  absenceDeduction: number;
  /** 계산 필드: 기본 수업료 */
  baseTuition?: number;
  /** 계산 필드: 셔틀비 */
  shuttleFee?: number;
  /** 계산 필드: 최종 금액 */
  finalAmount?: number;
}
