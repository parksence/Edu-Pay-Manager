import { Check, HelpCircle } from 'lucide-react'
import { SummaryDashboard } from '@/components/tuition/SummaryDashboard'
import { PrincipalKpiDashboard } from '@/components/tuition/PrincipalKpiDashboard'
import { TuitionTable } from '@/components/tuition/TuitionTable'
import { StatisticsCharts } from '@/components/tuition/StatisticsCharts'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTuitionStore } from '@/store/useTuitionStore'

const FORMULA_TEXT =
  '최종 금액 = (기본 수업료 × 0.95^형제할인) + 셔틀비 + 교재비 - 결석 차감'

export function AppLayout() {
  const briefingMode = useTuitionStore((s) => s.briefingMode)
  const setBriefingMode = useTuitionStore((s) => s.setBriefingMode)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  학원 수강료 관리
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  수강료 자동 계산 · 엑셀 불러오기/내보내기
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  수강료 산정: 기본료 + 셔틀 + 교재비 - 결석차감
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 inline-flex cursor-help align-middle text-muted-foreground hover:text-foreground">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {FORMULA_TEXT}
                    </TooltipContent>
                  </Tooltip>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="briefing-mode"
                    checked={briefingMode}
                    onCheckedChange={setBriefingMode}
                  />
                  <Label htmlFor="briefing-mode" className="cursor-pointer text-sm font-medium">
                    원장님 브리핑 모드
                  </Label>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>데이터는 브라우저에 자동 저장됩니다</span>
                </div>
              </div>
            </div>
          </header>
        <div className="space-y-8">
          <SummaryDashboard />
          <PrincipalKpiDashboard />
          <StatisticsCharts />
          {!briefingMode && <TuitionTable />}
        </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
