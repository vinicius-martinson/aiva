import {
  Phone,
  CalendarCheck,
  Clock,
  SmilePlus,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  kpis,
  recentCalls,
  hourlyVolume,
  agentStats,
  type KPI,
  type RecentCall,
} from "@/data/dashboardMockData"

const kpiIcons = [Phone, CalendarCheck, Clock, SmilePlus]

const outcomeBadgeClass: Record<RecentCall["outcome"], string> = {
  Booked: "bg-green-100 text-green-700",
  "Follow-up": "bg-yellow-100 text-yellow-700",
  Missed: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-500",
}

function KPICard({ kpi, icon: Icon }: { kpi: KPI; icon: typeof Phone }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {kpi.changeType === "positive" ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : kpi.changeType === "negative" ? (
            <TrendingDown className="h-3 w-3 text-red-600" />
          ) : null}
          <span
            className={cn(
              kpi.changeType === "positive" && "text-green-600",
              kpi.changeType === "negative" && "text-red-600"
            )}
          >
            {kpi.change}
          </span>{" "}
          vs yesterday
        </p>
      </CardContent>
    </Card>
  )
}

function CallsChart() {
  const maxCalls = Math.max(...hourlyVolume.map((h) => h.calls))
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base">Calls by Hour</CardTitle>
        <CardDescription>Inbound call volume throughout today's business hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          {hourlyVolume.map((h) => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{h.calls}</span>
              <div
                className="w-full bg-blue-500 rounded-t transition-all"
                style={{ height: `${(h.calls / maxCalls) * 160}px` }}
              />
              <span className="text-[10px] text-muted-foreground">{h.hour}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentCallsTable() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Calls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="pb-2 font-medium">Caller</th>
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 font-medium">Outcome</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium">{call.callerName}</td>
                  <td className="py-2.5 text-muted-foreground">{call.service}</td>
                  <td className="py-2.5">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        outcomeBadgeClass[call.outcome]
                      )}
                    >
                      {call.outcome}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{call.duration}</td>
                  <td className="py-2.5 text-muted-foreground text-right">{call.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function AgentPerformance() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-base">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {agentStats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of your AI phone agent
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} kpi={kpi} icon={kpiIcons[i]} />
        ))}
      </div>

      {/* Calls by Hour */}
      <CallsChart />

      {/* Recent Calls Table */}
      <RecentCallsTable />

      {/* Agent Performance */}
      <AgentPerformance />
    </div>
  )
}
