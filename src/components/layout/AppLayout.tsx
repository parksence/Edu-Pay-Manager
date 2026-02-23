import { SummaryDashboard } from '@/components/tuition/SummaryDashboard'
import { TuitionTable } from '@/components/tuition/TuitionTable'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            학원 수강료 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            수강료 자동 계산 · 엑셀 불러오기/내보내기
          </p>
        </header>
        <div className="space-y-8">
          <SummaryDashboard />
          <TuitionTable />
        </div>
      </div>
    </div>
  )
}
