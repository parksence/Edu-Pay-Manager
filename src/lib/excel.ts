import * as XLSX from 'xlsx'
import type { StudentRow, StudentGrade, ShuttleType } from '@/types'
import { GRADE_LABELS, SHUTTLE_LABELS, LABEL_TO_GRADE, LABEL_TO_SHUTTLE } from './constants'
import { applyCalculations } from './calculations'

const EXPORT_HEADERS = [
  '이름',
  '구분',
  '수학 수강료',
  '할인',
  '셔틀',
  '교재비',
  '교재비 사유',
  '결석차감',
  '비고',
] as const

type RawRow = Record<string, string | number | boolean | undefined>

/** 파싱 직후 계산용(구 양식 형제할인 O → siblingDiscount 플래그) */
type ParsedStudent = StudentRow & { siblingDiscount?: boolean }

function parseNumber(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.-]/g, ''))
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

/** 구 양식 엑셀: 형제할인 O만 예 */
function parseLegacySiblingFlag(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const s = v.trim()
    if (s === 'O' || s === 'o' || s === '예') return true
  }
  return false
}

/** 엑셀 시트의 한글 헤더/값을 StudentRow[]로 변환 */
export function parseExcelToStudents(file: File): Promise<StudentRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('파일을 읽을 수 없습니다.'))
          return
        }
        const wb = XLSX.read(data, { type: 'array' })
        const firstSheet = wb.SheetNames[0]
        if (!firstSheet) {
          reject(new Error('시트가 없습니다.'))
          return
        }
        const sheet = wb.Sheets[firstSheet]
        const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' })
        const students: ParsedStudent[] = rows.map((raw, index) => {
          const name = String(raw['이름'] ?? raw['name'] ?? '').trim()
          const gradeRaw = String(raw['구분'] ?? raw['grade'] ?? '').trim()
          const shuttleRaw = String(raw['셔틀'] ?? raw['shuttle'] ?? '').trim()
          const grade: StudentGrade = LABEL_TO_GRADE[gradeRaw] ?? 'elementary_regular'
          const shuttle: ShuttleType = shuttleRaw === '' ? 'none' : (LABEL_TO_SHUTTLE[shuttleRaw] ?? 'none')
          const notes = String(raw['비고'] ?? raw['notes'] ?? '').trim()
          const materialsFeeReason = String(raw['교재비 사유'] ?? raw['materialsFeeReason'] ?? '').trim()
          const discount = parseNumber(raw['할인'] ?? raw['discount'] ?? 0)
          const row: ParsedStudent = {
            id: crypto.randomUUID(),
            name: name || `학생 ${index + 1}`,
            grade,
            discount,
            shuttle,
            mathFee: parseNumber(raw['수학 수강료'] ?? raw['수학금액'] ?? raw['mathFee'] ?? 0),
            materialsFee: parseNumber(raw['교재비'] ?? raw['materialsFee'] ?? 0),
            materialsFeeReason,
            absenceDeduction: parseNumber(raw['결석차감'] ?? raw['absenceDeduction'] ?? 0),
            notes,
          }
          if (discount === 0 && parseLegacySiblingFlag(raw['형제할인'] ?? raw['siblingDiscount'] ?? '')) {
            row.siblingDiscount = true
          }
          return row
        })
        resolve(applyCalculations(students))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsArrayBuffer(file)
  })
}

/** StudentRow[]를 엑셀 시트용 배열로 변환 (한글 헤더) */
export function studentsToExportData(students: StudentRow[]): Record<string, string | number>[] {
  return students.map((row) => ({
    [EXPORT_HEADERS[0]]: row.name,
    [EXPORT_HEADERS[1]]: GRADE_LABELS[row.grade],
    [EXPORT_HEADERS[2]]: row.mathFee ?? 0,
    [EXPORT_HEADERS[3]]: row.discount ?? 0,
    [EXPORT_HEADERS[4]]: SHUTTLE_LABELS[row.shuttle],
    [EXPORT_HEADERS[5]]: row.materialsFee,
    [EXPORT_HEADERS[6]]: row.materialsFeeReason ?? '',
    [EXPORT_HEADERS[7]]: row.absenceDeduction,
    [EXPORT_HEADERS[8]]: row.notes ?? '',
  }))
}

/** 엑셀 파일로 다운로드 */
export function downloadStudentsExcel(students: StudentRow[], filename?: string): void {
  const data = studentsToExportData(students)
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '수강료')
  const name = filename ?? `수강료_내역_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
  XLSX.writeFile(wb, name)
}

/** 불러오기용 엑셀 양식 다운로드 (헤더 + 조건별 예시 행) */
const IMPORT_HEADERS = [
  '이름',
  '구분',
  '수학 수강료',
  '할인',
  '셔틀',
  '교재비',
  '교재비 사유',
  '결석차감',
  '비고',
] as const

export function downloadTemplateExcel(): void {
  const exampleRows = [
    {
      이름: '예시1_초등원장',
      구분: '초등(원장)',
      '수학 수강료': 0,
      할인: 0,
      셔틀: '해당 없음',
      교재비: 0,
      '교재비 사유': '',
      결석차감: 0,
      비고: '',
    },
    {
      이름: '예시2_초등',
      구분: '초등',
      '수학 수강료': 20000,
      할인: 16000,
      셔틀: '둔산 편도',
      교재비: 15000,
      '교재비 사유': '워크북',
      결석차감: 0,
      비고: '',
    },
    {
      이름: '예시3_중등원장',
      구분: '중등(원장)',
      '수학 수강료': 0,
      할인: 0,
      셔틀: '둔산',
      교재비: 20000,
      '교재비 사유': '',
      결석차감: 0,
      비고: '',
    },
    {
      이름: '예시4_중등',
      구분: '중등',
      '수학 수강료': 0,
      할인: 0,
      셔틀: '기타 편도',
      교재비: 0,
      '교재비 사유': '',
      결석차감: 3000,
      비고: '',
    },
    {
      이름: '예시5_고등',
      구분: '고등',
      '수학 수강료': 0,
      할인: 0,
      셔틀: '기타',
      교재비: 25000,
      '교재비 사유': '문제집',
      결석차감: 5000,
      비고: '',
    },
  ]
  const ws = XLSX.utils.json_to_sheet(exampleRows, { header: [...IMPORT_HEADERS] })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '명단')
  XLSX.writeFile(wb, '수강료_명단_양식.xlsx')
}
