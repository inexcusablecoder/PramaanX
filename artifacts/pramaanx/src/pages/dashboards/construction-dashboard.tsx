import {
  Activity,
  AlertTriangle,
  HardHat,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Truck,
  UsersRound,
  Wrench,
  Zap,
} from 'lucide-react';
import { GPSTrackingCard } from '@/components/common-modules';
import { useAuth } from '@/lib/auth-context';
import { getISTGreeting } from '@/App';

export default function ConstructionDashboard() {
  const { user } = useAuth();
  const { greeting, dateFormatted } = getISTGreeting(user?.name || 'Vikram Malhotra');

  return (
    <div className="space-y-7 rise-in">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mono mb-2 text-[10px] font-medium uppercase tracking-[.19em] text-amber-600 flex items-center gap-2">
            <HardHat className="size-3.5" /> Construction & Field Operations Sector · {dateFormatted}
          </div>
          <h1 className="text-[27px] font-extrabold tracking-[-.04em] text-foreground sm:text-[31px]">
            {greeting}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12px] text-muted-foreground">
            Real-time biometric attendance, site risk mapping, safety certificate tracking, and heavy machinery utilization.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Total Registered Workers</span>
            <UsersRound className="size-4 text-amber-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">1,240</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">1,180 Present On Site Today</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Active Construction Sites</span>
            <MapPin className="size-4 text-teal-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">14</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Metro Infrastructure & Commercial Hubs</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Safety Compliance Rate</span>
            <ShieldCheck className="size-4 text-emerald-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">96.8%</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">OSHA & ISO 45001 Compliant</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Heavy Machinery Utilization</span>
            <Wrench className="size-4 text-indigo-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">84.5%</div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold">2 Cranes Scheduled Maintenance</div>
        </div>
      </div>

      {/* Site Risk Map & Worker Fatigue Index */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-red-600" />
              <h3 className="text-xs font-bold text-foreground">Active Site Risk Map & Safety Compliance</h3>
            </div>
            <span className="mono text-[10px] text-emerald-600 font-bold">ALL SITES MONITORED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { site: 'Site Alpha · Downtown Tower', workers: 420, risk: 'Low Risk', score: 98 },
              { site: 'Site Beta · Metro Transit Line', workers: 310, risk: 'Medium Risk', score: 89 },
              { site: 'Site Gamma · Port Logistics Terminal', workers: 280, risk: 'Low Risk', score: 96 },
              { site: 'Site Delta · Highway Expansion', workers: 170, risk: 'High Wind Alert', score: 82 },
            ].map((s) => (
              <div key={s.site} className="p-3.5 rounded-xl bg-muted/50 space-y-2">
                <div className="text-xs font-bold text-foreground">{s.site}</div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{s.workers} Workers Present</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    s.score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {s.risk} ({s.score}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Worker Fatigue & Shift Load Analysis */}
          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-foreground">Worker Fatigue Index</div>
              <span className="mono text-xs font-bold text-amber-600">FATIGUE: 18%</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              AI biometric camera feeds monitor helmet fit, heat stress levels, and shift rotation compliance.
            </p>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[18%]" />
            </div>
          </div>

          <GPSTrackingCard />
        </div>
      </div>
    </div>
  );
}
