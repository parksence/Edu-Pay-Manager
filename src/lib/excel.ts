import * as XLSX from 'xlsx'
import type { StudentRow, StudentGrade, ShuttleType } from '@/types'
import { GRADE_LABELS, SHUTTLE_LABELS, LABEL_TO_GRADE, LABEL_TO_SHUTTLE } from './constants'
import { applyCalculations } from './calculations'

const EXPORT_HEADERS = [
  '이름',
  '구분',
  '형제할인',
  '셔틀',
  '교재비',
  '결석차감',
  '기본수업료',
  '셔틀비',
  '최종금액',
] as const

type RawRow = Record<string, string | number | boolean | undefined>

function parseNumber(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.-]/g, ''))
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

/** 형제할인: O만 예, 빈값·그 외는 아니오 */
function parseSiblingDiscount(v: unknown): boolean {
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
        const students: StudentRow[] = rows.map((raw, index) => {
          const name = String(raw['이름'] ?? raw['name'] ?? '').trim()
          const gradeRaw = String(raw['구분'] ?? raw['grade'] ?? '').trim()
          const shuttleRaw = String(raw['셔틀'] ?? raw['shuttle'] ?? '').trim()
          const grade: StudentGrade = LABEL_TO_GRADE[gradeRaw] ?? 'elementary_regular'
          const shuttle: ShuttleType = shuttleRaw === '' ? 'none' : (LABEL_TO_SHUTTLE[shuttleRaw] ?? 'none')
          return {
            id: crypto.randomUUID(),
            name: name || `학생 ${index + 1}`,
            grade,
            siblingDiscount: parseSiblingDiscount(raw['형제할인'] ?? raw['siblingDiscount'] ?? ''),
            shuttle,
            materialsFee: parseNumber(raw['교재비'] ?? raw['materialsFee'] ?? 0),
            absenceDeduction: parseNumber(raw['결석차감'] ?? raw['absenceDeduction'] ?? 0),
          }
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
    [EXPORT_HEADERS[2]]: row.siblingDiscount ? 'O' : '',
    [EXPORT_HEADERS[3]]: SHUTTLE_LABELS[row.shuttle],
    [EXPORT_HEADERS[4]]: row.materialsFee,
    [EXPORT_HEADERS[5]]: row.absenceDeduction,
    [EXPORT_HEADERS[6]]: row.baseTuition ?? 0,
    [EXPORT_HEADERS[7]]: row.shuttleFee ?? 0,
    [EXPORT_HEADERS[8]]: row.finalAmount ?? 0,
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
const IMPORT_HEADERS = ['이름', '구분', '형제할인', '셔틀', '교재비', '결석차감'] as const

export function downloadTemplateExcel(): void {
  const exampleRows = [
    { 이름: '예시1_초등원장', 구분: '초등(원장)', 형제할인: '', 셔틀: '해당 없음', 교재비: 0, 결석차감: 0 },
    { 이름: '예시2_초등', 구분: '초등', 형제할인: 'O', 셔틀: '둔산 편도', 교재비: 15000, 결석차감: 0 },
    { 이름: '예시3_중등원장', 구분: '중등(원장)', 형제할인: '', 셔틀: '둔산', 교재비: 20000, 결석차감: 0 },
    { 이름: '예시4_중등', 구분: '중등', 형제할인: 'O', 셔틀: '기타 편도', 교재비: 0, 결석차감: 3000 },
    { 이름: '예시5_고등', 구분: '고등', 형제할인: '', 셔틀: '기타', 교재비: 25000, 결석차감: 5000 },
  ]
  const ws = XLSX.utils.json_to_sheet(exampleRows, { header: [...IMPORT_HEADERS] })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '명단')
  XLSX.writeFile(wb, '수강료_명단_양식.xlsx')
}
