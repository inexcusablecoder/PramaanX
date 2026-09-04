import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Award,
  Box,
  CheckCircle2,
  Cpu,
  Flame,
  KeyRound,
  Laptop,
  Layers,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { WorkforceStressMonitorCard, GPSTrackingCard } from '@/components/common-modules';

export default function ITDashboard() {
  return (
    <div className="space-y-7 rise-in">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mono mb-2 text-[10px] font-medium uppercase tracking-[.19em] text-[hsl(var(--primary))] flex items-center gap-2">
            <Cpu className="size-3.5 text-[hsl(var(--accent))]" /> IT & Software Sector Command Center
          </div>
          <h1 className="text-[27px] font-extrabold tracking-[-.04em] text-foreground sm:text-[31px]">
            Engineering & Software Intelligence
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12px] text-muted-foreground">
            Live tracking for developer credentials, software license compliance, laptop custody, and burnout risk.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Total Developers</span>
            <UsersRound className="size-4 text-blue-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">348</div>
          <div className="mt-1 text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="size-3" /> 332 Fully Verified (95.4%)
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Active Projects</span>
            <Layers className="size-4 text-teal-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">42</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Across 8 Engineering Squads</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Assigned Laptops / Devices</span>
            <Laptop className="size-4 text-amber-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">380</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">100% Encrypted & Tracked</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Certification & Compliance</span>
            <Award className="size-4 text-indigo-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">98.2%</div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold">4 AWS/GCP Certs Expiring</div>
        </div>
      </div>

      {/* Specialized Analytics Modules */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* Workload & Stress Monitor */}
        <div className="space-y-5">
          <WorkforceStressMonitorCard />

          {/* Productivity & Task Completion Rate */}
          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-foreground">Team Productivity & Task Completion</h3>
              </div>
              <span className="mono text-[10px] text-emerald-600 font-bold">+12.4% THIS SPRINT</span>
            </div>

            <div className="space-y-3">
              {[
                { squad: 'Frontend & UX Architecture', progress: 92, status: 'Optimal' },
                { squad: 'Backend & Distributed Services', progress: 88, status: 'Optimal' },
                { squad: 'DevOps & Cloud Infrastructure', progress: 74, status: 'Moderate Load' },
                { squad: 'AI & Machine Learning Engineering', progress: 95, status: 'Optimal' },
              ].map((item) => (
                <div key={item.squad} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>{item.squad}</span>
                    <span className="mono text-muted-foreground">{item.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--primary))] rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Burnout Risk Alerts & Hardware Custody */}
        <div className="space-y-5">
          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold">
              <Flame className="size-4" />
              <span>Burnout Risk Anomaly Alerts</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              AI Engine detected 14 developers with overtime exceeding 52 hours this week.
            </p>
            <button className="w-full py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold hover:bg-red-100">
              Trigger Automatic Workload Balance →
            </button>
          </div>

          <GPSTrackingCard />
        </div>
      </div>
    </div>
  );
}
