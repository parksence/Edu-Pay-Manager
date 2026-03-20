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
  /** 수업료(기본+수학)에서 차감할 할인 금액(원). 기본 0 */
  discount: number;
  shuttle: ShuttleType;
  /** 수학 수강료 (원). 있으면 기본 수업료에 포함되어 최종 금액에 반영. optional */
  mathFee?: number;
  materialsFee: number;
  /** 교재비 사유 (메모). optional */
  materialsFeeReason?: string;
  absenceDeduction: number;
  /** 비고 (메모). 기존 저장 데이터 호환용 optional */
  notes?: string;
  /** 계산 필드: 기본 수업료 */
  baseTuition?: number;
  /** 계산 필드: 셔틀비 */
  shuttleFee?: number;
  /** 계산 필드: 할인·차감 합계 (입력 할인 + 결석 차감) */
  discountAmount?: number;
  /** 계산 필드: 최종 금액 */
  finalAmount?: number;
}
