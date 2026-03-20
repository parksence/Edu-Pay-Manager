import type { StudentsByGrade } from '@/store/useTuitionStore'

/** 구분별 매출 (파이 차트용) */
export type PieDataItem = { name: string; value: number }

/** 링크에 담아 공유할 KPI 스냅샷 (원장님 보기용) */
export interface KpiSnapshot {
  t: number
  expectedRevenue: number
  studentsByGrade: StudentsByGrade
  materialsRevenue: number
  totalDeduction: number
  /** 구분별 매출 비중 (초/중/고) - 차트용 */
  pieData?: PieDataItem[]
}

const KPI_HASH_PREFIX = '#kpi='

export function buildKpiSnapshot(payload: Omit<KpiSnapshot, 't'>): KpiSnapshot {
  return { ...payload, t: Date.now() }
}

export function buildShareUrl(snapshot: KpiSnapshot): string {
  if (typeof window === 'undefined') return ''
  const base = window.location.origin + window.location.pathname
  const encoded = encodeURIComponent(JSON.stringify(snapshot))
  return `${base}${KPI_HASH_PREFIX}${encoded}`
}

export function parseKpiFromHash(): KpiSnapshot | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith(KPI_HASH_PREFIX)) return null
  try {
    const json = decodeURIComponent(hash.slice(KPI_HASH_PREFIX.length))
    const data = JSON.parse(json) as KpiSnapshot
    if (
      typeof data.expectedRevenue !== 'number' ||
      !data.studentsByGrade ||
      typeof data.materialsRevenue !== 'number' ||
      typeof data.totalDeduction !== 'number'
    ) {
      return null
    }
    return data
  } catch {
    return null
  }
}
