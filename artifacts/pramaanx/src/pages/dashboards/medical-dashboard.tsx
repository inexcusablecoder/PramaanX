import {
  Activity,
  AlertCircle,
  Bed,
  CheckCircle2,
  Clock,
  Crosshair,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import { WorkforceStressMonitorCard } from '@/components/common-modules';

export default function MedicalDashboard() {
  return (
    <div className="space-y-7 rise-in">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mono mb-2 text-[10px] font-medium uppercase tracking-[.19em] text-rose-600 flex items-center gap-2">
            <HeartPulse className="size-3.5" /> Healthcare & Medical Sector Command Center
          </div>
          <h1 className="text-[27px] font-extrabold tracking-[-.04em] text-foreground sm:text-[31px]">
            Clinical Staffing & Medical License Assurance
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12px] text-muted-foreground">
            Live monitoring for doctors & nurses on duty, bed availability, medical license validity, and staff burnout.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Doctors On Duty</span>
            <Stethoscope className="size-4 text-rose-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">84</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3" /> 100% Medical Licenses Verified
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Nurses On Shift</span>
            <UsersRound className="size-4 text-teal-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">210</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Across ER, ICU, and Surgical Wings</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Available ICU / General Beds</span>
            <Bed className="size-4 text-indigo-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">48 / 350</div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold">86.2% Occupancy Rate</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Emergency Response Readiness</span>
            <HeartPulse className="size-4 text-emerald-600" />
          </div>
          <div className="mono text-[26px] font-extrabold text-foreground">99.1%</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">All Trauma Centers Active</div>
        </div>
      </div>

      {/* Doctor Workload & Medical Equipment Status */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <WorkforceStressMonitorCard />

          {/* Shift Management & Critical Alerts */}
          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-foreground">Clinical Shift Management & License Status</h3>
              </div>
              <span className="mono text-[10px] text-emerald-600 font-bold">REGISTRY SYNCED</span>
            </div>

            <div className="space-y-3">
              {[
                { dept: 'Emergency Department (ER)', staff: '24 Doctors · 48 Nurses', license: '100% Validated' },
                { dept: 'Intensive Care Unit (ICU)', staff: '16 Doctors · 40 Nurses', license: '100% Validated' },
                { dept: 'Surgical Operations Wing', staff: '18 Surgeons · 30 Nurses', license: '1 License Expiring in 14d' },
                { dept: 'Diagnostic & Radiology Center', staff: '10 Radiologists · 22 Techs', license: '100% Validated' },
              ].map((row) => (
                <div key={row.dept} className="p-3.5 rounded-xl bg-muted/50 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-foreground">{row.dept}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{row.staff}</div>
                  </div>
                  <span className="mono text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    {row.license}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="space-y-5">
          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
              <AlertCircle className="size-4" />
              <span>Critical Shift & Staff Burnout Index</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ICU Night Shift fatigue score reached 78%. Recommended automated backup call for standby physicians.
            </p>
            <button className="w-full py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold hover:bg-rose-100">
              Dispatch Standby Physician Call →
            </button>
          </div>

          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-foreground">Medical Equipment Calibration</div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between"><span>Ventilators (64 units)</span><span className="text-emerald-600 font-bold">Calibrated</span></div>
              <div className="flex justify-between"><span>Defibrillators (32 units)</span><span className="text-emerald-600 font-bold">Calibrated</span></div>
              <div className="flex justify-between"><span>MRI Diagnostics (4 units)</span><span className="text-amber-600 font-bold">Maintenance Due</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
