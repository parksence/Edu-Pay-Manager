import { jsPDF } from 'jspdf'
import type { StudentsByGrade, UnpaidStudent } from '@/store/useTuitionStore'

const MARGIN = 24
const PAGE_WIDTH = 210
const FONT = 'helvetica'

function formatWon(n: number): string {
  return `${n.toLocaleString('en-US')}`
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

export interface KpiPdfParams {
  expectedRevenue: number
  studentsByGrade: StudentsByGrade
  materialsRevenue: number
  totalDeduction: number
  unpaidCount: number
  totalUnpaidAmount: number
  unpaidStudents: UnpaidStudent[]
}

/** KPI PDF 다운로드 (레이아웃·테이블 정리) */
export function downloadKpiPdf(params: KpiPdfParams): void {
  const {
    expectedRevenue,
    studentsByGrade,
    materialsRevenue,
    totalDeduction,
    unpaidCount,
    totalUnpaidAmount,
    unpaidStudents,
  } = params

  const doc = new jsPDF()
  let y = MARGIN

  // ----- 헤더 -----
  doc.setFontSize(22)
  doc.setFont(FONT, 'bold')
  doc.text('Principal KPI Report', MARGIN, y)
  y += 10

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont(FONT, 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${formatDate(new Date())}`, MARGIN, y)
  doc.setTextColor(0, 0, 0)
  y += 14

  // ----- 섹션 공통 -----
  const sectionTitle = (title: string) => {
    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    doc.setTextColor(40, 40, 40)
    doc.text(title, MARGIN, y)
    doc.setFont(FONT, 'normal')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    y += 6
  }
  const sectionLine = (label: string, value: string) => {
    doc.text(label, MARGIN, y)
    doc.text(value, PAGE_WIDTH - MARGIN, y, { align: 'right' })
    y += 6
  }

  sectionTitle('1. Expected revenue (this month)')
  sectionLine('Amount:', `${formatWon(expectedRevenue)} KRW`)
  y += 6

  sectionTitle('2. Students by grade')
  sectionLine('Elementary:', String(studentsByGrade.초등))
  sectionLine('Middle:', String(studentsByGrade.중등))
  sectionLine('High:', String(studentsByGrade.고등))
  y += 6

  sectionTitle('3. Other revenue (materials)')
  sectionLine('Amount:', `${formatWon(materialsRevenue)} KRW`)
  y += 6

  sectionTitle('4. Deductions (e.g. absence)')
  sectionLine('Amount:', `${formatWon(totalDeduction)} KRW`)
  y += 6

  sectionTitle('5. Unpaid summary')
  sectionLine('Count:', `${unpaidCount} person(s)`)
  sectionLine('Total unpaid:', `${formatWon(totalUnpaidAmount)} KRW`)
  y += 10

  // ----- 미납자 명단 테이블 -----
  if (unpaidStudents.length > 0) {
    sectionTitle('6. Unpaid list')

    const tableLeft = MARGIN
    const tableWidth = PAGE_WIDTH - 2 * MARGIN
    const colName = tableLeft + 20
    const colAmount = PAGE_WIDTH - MARGIN - 52
    const colNotes = colAmount + 8
    const colPhone = colNotes + 24
    const rowH = 8
    const headY = y

    doc.setFont(FONT, 'bold')
    doc.setFontSize(9)
    doc.setFillColor(245, 245, 245)
    doc.rect(tableLeft, headY - 5, tableWidth, rowH, 'F')
    doc.text('No', tableLeft + 4, headY)
    doc.text('Name', colName, headY)
    doc.text('Amount (KRW)', colAmount - 2, headY, { align: 'right' })
    doc.text('Notes', colNotes, headY)
    doc.text('Phone', colPhone, headY)
    y = headY + rowH

    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(tableLeft, y, PAGE_WIDTH - MARGIN, y)
    y += 4

    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    for (let i = 0; i < unpaidStudents.length; i++) {
      if (y > 270) {
        doc.addPage()
        y = MARGIN
      }
      const { name, unpaidAmount, notes, phone } = unpaidStudents[i]
      const nameStr = (name && name.trim()) ? name.trim() : '(no name)'
      const notesStr = (notes && notes.trim()) ? notes.trim().slice(0, 18) : '-'
      const phoneStr = (phone && phone.trim()) ? phone.trim().slice(0, 14) : '-'
      doc.text(String(i + 1), tableLeft + 4, y)
      doc.text(nameStr, colName, y)
      doc.text(formatWon(unpaidAmount), colAmount - 2, y, { align: 'right' })
      doc.text(notesStr, colNotes, y)
      doc.text(phoneStr, colPhone, y)
      y += rowH
    }

    y += 4
    doc.setDrawColor(220, 220, 220)
    doc.line(tableLeft, y, PAGE_WIDTH - MARGIN, y)
    y += 8
  }

  doc.save(`KPI_${new Date().toISOString().slice(0, 10)}.pdf`)
}
