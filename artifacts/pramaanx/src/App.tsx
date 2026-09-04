import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FilePlus2,
  FileSearch2,
  Filter,
  FolderOpen,
  AlertTriangle,
  Brain,
  Gauge,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  Upload,
  UsersRound,
  X,
  Zap,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import {
  getGetDashboardSummaryQueryKey,
  getGetDocumentQueryKey,
  getListActivityQueryKey,
  getListAssetsQueryKey,
  getListDocumentsQueryKey,
  getListWorkforceQueryKey,
  useGetDashboardSummary,
  useGetDocument,
  useListActivity,
  useListAssets,
  useListDocuments,
  useListWorkforce,
  useUploadDocument,
  useVerifyDocument,
  type ActivityItem,
  type Asset,
  type Document,
  type DocumentDetail,
  type WorkforceMember,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Onboarding from '@/pages/onboarding';
import ITDashboard from '@/pages/dashboards/it-dashboard';
import ConstructionDashboard from '@/pages/dashboards/construction-dashboard';
import MedicalDashboard from '@/pages/dashboards/medical-dashboard';
import { AICopilotDrawer, AlertCenterDrawer } from '@/components/common-modules';

const queryClient = new QueryClient();

const navItems = [
  { href: '/', label: 'Command center', icon: LayoutDashboard },
  { href: '/documents', label: 'Verification queue', icon: FileCheck2 },
  { href: '/workforce', label: 'Workforce', icon: UsersRound },
  { href: '/assets', label: 'Assets', icon: PackageCheck },
  { href: '/activity', label: 'Audit activity', icon: Activity },
];

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '—';
const formatShortDate = (value?: string) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—';
const titleCase = (value?: string) => (value || 'unknown').replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
      <span className="relative grid size-9 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm">
        <span className="absolute size-5 rounded-md border-2 border-current rotate-45" />
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      <span>
        <span className="block text-[15px] font-extrabold tracking-[-.03em] text-white">Pramaan<span className="text-[hsl(var(--accent))]">X</span></span>
        <span className="mono block text-[8px] uppercase tracking-[.2em] text-slate-400">operations intelligence</span>
      </span>
    </Link>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, company, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [alertCenterOpen, setAlertCenterOpen] = useState(false);

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PX';

  return (
    <div className="noise min-h-[100dvh] bg-background">
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-4 py-5 transition-transform duration-200 lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="mb-8 flex items-center justify-between px-2">
          <Logo />
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/10 lg:hidden" data-testid="button-close-menu"><X className="size-4" /></button>
        </div>

        {/* Sector Dashboards Quick Selector */}
        <div className="mb-4 px-3">
          <div className="mb-2 mono text-[9px] font-medium uppercase tracking-[.2em] text-slate-500">Sectors</div>
          <div className="space-y-1">
            <Link href="/" className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-colors', location === '/' ? 'bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/30' : 'text-slate-400 hover:bg-white/[.06] hover:text-white')}>
              <LayoutDashboard className="size-3.5" /> Executive Command
            </Link>
            <Link href="/dashboard/it" className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-colors', location === '/dashboard/it' ? 'bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/30' : 'text-slate-400 hover:bg-white/[.06] hover:text-white')}>
              <span className="size-2 rounded-full bg-blue-400" /> IT & Software
            </Link>
            <Link href="/dashboard/construction" className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-colors', location === '/dashboard/construction' ? 'bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/30' : 'text-slate-400 hover:bg-white/[.06] hover:text-white')}>
              <span className="size-2 rounded-full bg-amber-400" /> Construction / Field
            </Link>
            <Link href="/dashboard/medical" className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-colors', location === '/dashboard/medical' ? 'bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/30' : 'text-slate-400 hover:bg-white/[.06] hover:text-white')}>
              <span className="size-2 rounded-full bg-rose-400" /> Healthcare / Medical
            </Link>
          </div>
        </div>

        <div className="mb-2 px-3 mono text-[9px] font-medium uppercase tracking-[.2em] text-slate-500">Modules</div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-colors', active ? 'bg-white/[.1] text-white' : 'text-slate-400 hover:bg-white/[.06] hover:text-slate-100')} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon className={cn('size-[17px]', active ? 'text-[hsl(var(--accent))]' : 'text-slate-500 group-hover:text-slate-300')} strokeWidth={active ? 2.4 : 1.8} />
                {label}
                {label === 'Verification queue' && <span className="ml-auto rounded-full bg-[hsl(var(--accent))]/15 px-1.5 py-0.5 mono text-[9px] text-[hsl(var(--accent))]">12</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[.045] p-3">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-slate-200"><span className="size-1.5 rounded-full bg-emerald-400" /> Systems nominal</div>
            <p className="text-[10px] leading-relaxed text-slate-500">All verification pipelines responding.</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 border-t border-white/10 pt-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] text-[11px] font-bold text-white shadow-sm">{userInitials}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-semibold text-slate-200">{user?.name || 'Ari Raghavan'}</div>
              <div className="truncate text-[10px] text-slate-400">{company?.name || user?.role || 'Control Room'}</div>
            </div>
            {isAuthenticated ? (
              <button onClick={() => logout()} title="Sign out" className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-white/10 transition-colors" data-testid="button-logout">
                <LogOut className="size-4" />
              </button>
            ) : (
              <button onClick={() => setLocation('/login')} title="Sign in" className="ml-auto text-slate-400 hover:text-white text-[11px] font-bold" data-testid="button-login-page">
                Sign In
              </button>
            )}
          </div>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" data-testid="button-open-menu"><Menu className="size-5" /></button>
            <div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex"><span className="mono text-[10px] uppercase tracking-[.14em]">Control room</span><ChevronRight className="size-3" /><span className="font-semibold text-foreground">{navItems.find((item) => item.href !== '/' && location.startsWith(item.href))?.label || 'Overview'}</span></div>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Copilot & Alert Center Drawer Triggers */}
            <button onClick={() => setCopilotOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--accent))]/15 border border-[hsl(var(--accent))]/30 text-[11px] font-bold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/25 transition-all">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse" /> AI Copilot
            </button>
            <button onClick={() => setAlertCenterOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-600 hover:bg-red-500/20 transition-all">
              Alert Center
            </button>
            <div className="relative">
              <button onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }} className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" data-testid="button-notifications"><Bell className="size-[17px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[hsl(var(--accent))]" /></button>
              {notificationsOpen && <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-md)]"><div className="flex items-center justify-between"><span className="text-[11px] font-bold">Signal inbox</span><span className="mono text-[9px] text-emerald-600">ALL CLEAR</span></div><p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">No new critical signals. The command center is operating within expected parameters.</p><button onClick={() => setNotificationsOpen(false)} className="mt-3 text-[10px] font-bold text-[hsl(var(--primary))] hover:underline" data-testid="button-dismiss-notifications">Dismiss</button></div>}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8 lg:py-9">{children}</main>

        <AICopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
        <AlertCenterDrawer isOpen={alertCenterOpen} onClose={() => setAlertCenterOpen(false)} />
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mono mb-2 text-[10px] font-medium uppercase tracking-[.19em] text-[hsl(var(--primary))]">{eyebrow}</div><h1 className="text-[27px] font-extrabold tracking-[-.04em] text-foreground sm:text-[31px]">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-[12px] text-muted-foreground">{description}</p>}</div>{action}</div>;
}

function StatusBadge({ value }: { value?: string }) {
  const normalized = (value || '').toLowerCase();
  const tone = normalized.includes('verified') || normalized.includes('secure') || normalized.includes('active') || normalized.includes('compliant') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : normalized.includes('flag') || normalized.includes('alert') || normalized.includes('attention') || normalized.includes('expired') ? 'bg-red-50 text-red-700 border-red-200' : normalized.includes('transit') || normalized.includes('pending') || normalized.includes('review') || normalized.includes('expir') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold', tone)}><span className="size-1.5 rounded-full bg-current opacity-70" />{titleCase(value)}</span>;
}

function Score({ value, compact = false }: { value?: number; compact?: boolean }) {
  const score = Math.round(value || 0);
  const color = score >= 85 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600';
  return <span className={cn('mono font-medium', compact ? 'text-[11px]' : 'text-[22px] font-bold', color)}>{score}<span className={compact ? 'text-[9px]' : 'text-[12px]'}>/100</span></span>;
}

function MetricCard({ label, value, detail, icon: Icon, tone = 'teal', delay = 0 }: { label: string; value: string | number; detail: string; icon: typeof Gauge; tone?: 'teal' | 'amber' | 'blue' | 'red'; delay?: number }) {
  const tones = { teal: 'bg-teal-50 text-teal-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700' };
  return <div className="rise-in rounded-xl border border-card-border bg-card p-4 shadow-[var(--shadow-sm)]" style={{ animationDelay: `${delay}ms` }} data-testid={`card-metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="mb-5 flex items-start justify-between"><span className="text-[11px] font-semibold text-muted-foreground">{label}</span><span className={cn('grid size-8 place-items-center rounded-lg', tones[tone])}><Icon className="size-4" /></span></div><div className="text-[26px] font-extrabold tracking-[-.045em] text-foreground">{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{detail}</div></div>;
}

function Panel({ title, meta, children, className }: { title: string; meta?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cn('rounded-xl border border-card-border bg-card shadow-[var(--shadow-sm)]', className)}><div className="flex items-center justify-between border-b border-border/70 px-5 py-4"><h2 className="text-[12px] font-bold text-foreground">{title}</h2>{meta}</div>{children}</section>;
}

function LoadingPanel({ rows = 4 }: { rows?: number }) {
  return <div className="space-y-3 p-5">{Array.from({ length: rows }).map((_, i) => <div key={i} className="flex items-center gap-3"><div className="skeleton size-8 rounded-lg" /><div className="flex-1 space-y-2"><div className="skeleton h-2.5 w-2/5 rounded" /><div className="skeleton h-2 w-1/4 rounded" /></div><div className="skeleton h-5 w-16 rounded-full" /></div>)}</div>;
}

function ErrorState({ message = 'Unable to load this surface.', retry }: { message?: string; retry?: () => void }) {
  return <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center"><span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600"><TriangleAlert className="size-5" /></span><p className="text-[12px] font-semibold">{message}</p>{retry && <button onClick={retry} className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-[hsl(var(--primary))] hover:underline" data-testid="button-retry"><RefreshCw className="size-3" /> Try again</button>}</div>;
}

function EmptyState({ icon: Icon = FolderOpen, title, message }: { icon?: typeof FolderOpen; title: string; message: string }) {
  return <div className="flex flex-col items-center justify-center px-5 py-14 text-center"><span className="mb-3 grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-5" /></span><p className="text-[12px] font-bold">{title}</p><p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted-foreground">{message}</p></div>;
}

function Dashboard() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const activityQuery = useListActivity({ limit: 6 }, { query: { queryKey: getListActivityQueryKey({ limit: 6 }) } });
  const summary = summaryQuery.data;
  const trend = summary?.processingTrend || [];
  const maxTrend = Math.max(...trend.map((point) => point.verified + point.flagged), 1);
  return <div className="space-y-7">
    <SectionHeading eyebrow="Friday · 04 Sep 2026" title="Good morning, Ari." description="Your verification command center is clear. Here is the operational picture." action={<Link href="/documents" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5" data-testid="link-open-queue"><FileSearch2 className="size-3.5" /> Open verification queue</Link>} />
    {summaryQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-[148px] rounded-xl" />)}</div> : summaryQuery.isError ? <ErrorState message="Command center data is unavailable." retry={() => summaryQuery.refetch()} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Verification throughput" value={summary?.verification?.total ?? 0} detail={`${summary?.verification?.pending ?? 0} pending review`} icon={ClipboardCheck} tone="teal" delay={0} />
      <MetricCard label="Workforce coverage" value={`${summary?.workforce?.complianceRate ?? 0}%`} detail={`${summary?.workforce?.expiringSoon ?? 0} credentials expiring soon`} icon={UsersRound} tone="blue" delay={40} />
      <MetricCard label="Assets in custody" value={summary?.assets?.total ?? 0} detail={`${summary?.assets?.inTransit ?? 0} currently in transit`} icon={Box} tone="amber" delay={80} />
      <MetricCard label="Trust index" value={summary?.risk?.trustScore ?? 0} detail={`${summary?.risk?.openAlerts ?? 0} open risk alerts`} icon={ShieldCheck} tone="red" delay={120} />
    </div>}
    <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <Panel title="Verification pulse" meta={<span className="mono text-[10px] text-muted-foreground">LAST 7 DAYS</span>}>
        <div className="p-5">
          <div className="mb-7 flex items-end justify-between"><div><div className="mono text-[34px] font-medium tracking-[-.06em] text-foreground">{summary?.verification?.verified ?? '—'}</div><div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600"><ArrowUpRight className="size-3" /> 8.4% vs prior period</div></div><div className="text-right"><div className="text-[11px] font-semibold text-muted-foreground">Avg. processing time</div><div className="mono mt-1 text-[15px] text-foreground">{summary?.verification?.averageTimeSeconds ?? '—'} sec</div></div></div>
          <div className="flex h-40 items-end gap-2 sm:gap-4">{trend.length ? trend.map((point) => <div key={point.label} className="group flex flex-1 flex-col items-center gap-2"><div className="relative flex h-32 w-full items-end justify-center gap-1"><div className="w-1/2 rounded-t-sm bg-[hsl(var(--primary))] transition-all duration-300 group-hover:bg-[hsl(var(--chart-3))]" style={{ height: `${Math.max((point.verified / maxTrend) * 100, 5)}%` }} /><div className="w-1/2 rounded-t-sm bg-[hsl(var(--accent))] transition-all duration-300 group-hover:bg-amber-400" style={{ height: `${Math.max((point.flagged / maxTrend) * 100, 3)}%` }} /></div><span className="mono text-[9px] text-muted-foreground">{point.label}</span></div>) : <div className="flex w-full items-center justify-center text-[11px] text-muted-foreground">No trend points available.</div>}</div>
          <div className="mt-4 flex gap-4 border-t border-border/70 pt-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[hsl(var(--primary))]" /> Verified</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[hsl(var(--accent))]" /> Flagged</span></div>
        </div>
      </Panel>
      <Panel title="Risk posture" meta={<Link href="/activity" className="text-[10px] font-bold text-[hsl(var(--primary))] hover:underline" data-testid="link-view-audit">View audit <ChevronRight className="inline size-3" /></Link>}>
        <div className="p-5"><div className="flex items-center gap-5"><div className="relative grid size-[112px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) ${(summary?.risk?.trustScore || 0) * 3.6}deg, hsl(var(--muted)) 0deg)` }}><div className="grid size-[88px] place-items-center rounded-full bg-card"><div className="text-center"><div className="mono text-[25px] font-bold">{summary?.risk?.trustScore ?? '—'}</div><div className="text-[9px] text-muted-foreground">TRUST SCORE</div></div></div></div><div><div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ArrowUpRight className="size-3" /> {summary?.risk?.change ?? 0} pts this week</div><p className="max-w-[190px] text-[11px] leading-relaxed text-muted-foreground">Controls are holding. No material drift detected across monitored entities.</p></div></div><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-lg bg-muted/70 p-3"><div className="mono text-[19px] font-medium">{summary?.risk?.openAlerts ?? '—'}</div><div className="mt-1 text-[10px] text-muted-foreground">Open alerts</div></div><div className="rounded-lg bg-muted/70 p-3"><div className="mono text-[19px] font-medium text-amber-600">{titleCase(summary?.risk?.severity)}</div><div className="mt-1 text-[10px] text-muted-foreground">Current severity</div></div></div></div>
      </Panel>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <Panel title="Operational coverage"><div className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0"><Link href="/workforce" className="group p-5 transition-colors hover:bg-muted/40" data-testid="link-dashboard-workforce"><div className="mb-5 flex items-center justify-between"><span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><KeyRound className="size-4" /></span><ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><div className="mono text-[24px]">{summary?.workforce?.active ?? '—'}</div><div className="mt-1 text-[10px] text-muted-foreground">Active workforce</div></Link><Link href="/assets" className="group p-5 transition-colors hover:bg-muted/40" data-testid="link-dashboard-assets"><div className="mb-5 flex items-center justify-between"><span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><PackageCheck className="size-4" /></span><ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><div className="mono text-[24px]">{summary?.assets?.secure ?? '—'}</div><div className="mt-1 text-[10px] text-muted-foreground">Secure assets</div></Link><Link href="/documents?status=flagged" className="group p-5 transition-colors hover:bg-muted/40" data-testid="link-dashboard-attention"><div className="mb-5 flex items-center justify-between"><span className="grid size-8 place-items-center rounded-lg bg-red-50 text-red-700"><ShieldAlert className="size-4" /></span><ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><div className="mono text-[24px]">{summary?.verification?.flagged ?? '—'}</div><div className="mt-1 text-[10px] text-muted-foreground">Needs attention</div></Link></div></Panel>
      <Panel title="Recent activity" meta={<Link href="/activity" className="text-[10px] font-bold text-[hsl(var(--primary))] hover:underline" data-testid="link-view-all-activity">View all <ChevronRight className="inline size-3" /></Link>}>{activityQuery.isLoading ? <LoadingPanel rows={4} /> : activityQuery.isError ? <ErrorState retry={() => activityQuery.refetch()} /> : activityQuery.data?.length ? <div className="divide-y divide-border/70">{activityQuery.data.slice(0, 4).map((item) => <ActivityRow item={item} key={item.id} />)}</div> : <EmptyState icon={Activity} title="No activity yet" message="New audit events will appear here." />}</Panel>
    </div>
  </div>;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return <div className="flex gap-3 px-5 py-3.5" data-testid={`row-activity-${item.id}`}><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Activity className="size-3.5" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-[11px] font-semibold">{item.title}</p><span className="shrink-0 mono text-[9px] text-muted-foreground">{formatDate(item.createdAt)}</span></div><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{item.description}</p><p className="mt-1 text-[9px] font-medium text-[hsl(var(--primary))]">{item.actor}</p></div></div>;
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const upload = useUploadDocument();
  const [form, setForm] = useState({ name: '', type: 'Identity document', subject: '', issuer: '' });
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (Object.values(form).some((value) => !value.trim())) { setError('Complete every field before adding the document.'); return; } setError(''); upload.mutate({ data: form }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); onClose(); } }); };
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="w-full max-w-lg rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><div className="mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">New intake</div><h2 className="mt-1 text-[15px] font-bold">Add document to queue</h2></div><button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" data-testid="button-close-upload"><X className="size-4" /></button></div><form onSubmit={submit} className="space-y-4 p-5"><Field label="Document name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Passport · M. Chen" data-testid="input-document-name" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Document type"><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} data-testid="select-document-type"><option>Identity document</option><option>Credential</option><option>Corporate record</option><option>Proof of address</option><option>Financial document</option></select></Field><Field label="Issuer"><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Issuing authority" data-testid="input-document-issuer" /></Field></div><Field label="Subject"><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Person or entity named on document" data-testid="input-document-subject" /></Field>{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</p>}{upload.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">Upload failed. Check the fields and try again.</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-[11px] font-bold text-muted-foreground hover:bg-muted" data-testid="button-cancel-upload">Cancel</button><button disabled={upload.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-[11px] font-bold text-white disabled:opacity-60" data-testid="button-submit-upload">{upload.isPending ? 'Adding…' : <><Upload className="size-3.5" /> Add to queue</>}</button></div></form></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.08em] text-muted-foreground">{label}</span>{children}</label>;
}

function Documents() {
  const paramsFromUrl = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(paramsFromUrl.get('q') || '');
  const [status, setStatus] = useState(paramsFromUrl.get('status') || '');
  const [showUpload, setShowUpload] = useState(false);
  const params = useMemo(() => ({ ...(search ? { q: search } : {}), ...(status ? { status } : {}) }), [search, status]);
  const query = useListDocuments(params, { query: { queryKey: getListDocumentsQueryKey(params) } });
  return <div className="space-y-7"><SectionHeading eyebrow="Verification / intake" title="Verification queue" description="Review, resolve, and verify incoming evidence across your operating perimeter." action={<button onClick={() => setShowUpload(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5" data-testid="button-open-upload"><Plus className="size-3.5" /> Add document</button>} /><div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)] sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full border-0 bg-muted/70 pl-9 text-[11px] outline-none ring-0 placeholder:text-muted-foreground focus:bg-muted" placeholder="Search name, subject, or issuer…" data-testid="input-search-documents" /></div><div className="flex items-center gap-2"><Filter className="ml-1 size-3.5 text-muted-foreground" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 min-w-[145px] border-0 bg-muted/70 text-[11px] font-semibold outline-none" data-testid="select-document-status"><option value="">All statuses</option><option value="pending">Pending review</option><option value="verified">Verified</option><option value="flagged">Flagged</option></select></div></div><Panel title="Incoming evidence" meta={<span className="mono text-[10px] text-muted-foreground">{query.data?.length ?? 0} RECORDS</span>}>{query.isLoading ? <LoadingPanel rows={6} /> : query.isError ? <ErrorState message="The verification queue could not be reached." retry={() => query.refetch()} /> : query.data?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-border/70 text-[9px] uppercase tracking-[.12em] text-muted-foreground"><th className="px-5 py-3 font-bold">Document</th><th className="px-4 py-3 font-bold">Subject / issuer</th><th className="px-4 py-3 font-bold">Trust</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Updated</th><th className="px-5 py-3" /></tr></thead><tbody>{query.data.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}</tbody></table></div> : <EmptyState icon={FileSearch2} title="Nothing in this view" message="Try widening your filters or add a document to start a new verification run." />}</Panel>{showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}</div>;
}

function DocumentRow({ doc }: { doc: Document }) {
  return <tr className="group border-b border-border/60 last:border-0 hover:bg-muted/35" data-testid={`row-document-${doc.id}`}><td className="px-5 py-4"><Link href={`/documents/${doc.id}`} className="flex items-center gap-3" data-testid={`link-document-${doc.id}`}><span className="grid size-8 place-items-center rounded-lg bg-teal-50 text-teal-700"><FileCheck2 className="size-4" /></span><span><span className="block max-w-[210px] truncate text-[11px] font-bold text-foreground">{doc.name}</span><span className="mono mt-1 block text-[9px] text-muted-foreground">{doc.type}</span></span></Link></td><td className="px-4 py-4"><div className="text-[11px] font-semibold">{doc.subject}</div><div className="mt-1 text-[10px] text-muted-foreground">{doc.issuer}</div></td><td className="px-4 py-4"><Score value={doc.trustScore} compact /></td><td className="px-4 py-4"><StatusBadge value={doc.status} /></td><td className="px-4 py-4 mono text-[10px] text-muted-foreground">{formatShortDate(doc.updatedAt)}</td><td className="px-5 py-4 text-right"><Link href={`/documents/${doc.id}`} className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100" data-testid={`link-open-document-${doc.id}`}><ChevronRight className="size-4" /></Link></td></tr>;
}

function DocumentDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const query = useGetDocument(id, { query: { enabled: Boolean(id), queryKey: getGetDocumentQueryKey(id) } });
  const verify = useVerifyDocument();
  const [notice, setNotice] = useState('');
  const detail = query.data as DocumentDetail | undefined;
  const verifyNow = () => { if (!id) return; setNotice(''); verify.mutate({ id }, { onSuccess: (result) => { setNotice(`Verification complete · ${titleCase(result.decision)} decision`); queryClient.invalidateQueries({ queryKey: getGetDocumentQueryKey(id) }); queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }); }, onError: () => setNotice('Verification could not be completed. Try again.') }); };
  return <div className="space-y-7"><Link href="/documents" className="inline-flex items-center gap-2 text-[11px] font-bold text-muted-foreground hover:text-foreground" data-testid="link-back-documents"><ArrowLeft className="size-3.5" /> Back to verification queue</Link>{query.isLoading ? <div className="space-y-5"><div className="skeleton h-32 rounded-xl" /><div className="grid gap-5 lg:grid-cols-2"><div className="skeleton h-72 rounded-xl" /><div className="skeleton h-72 rounded-xl" /></div></div> : query.isError || !detail ? <ErrorState message="Document details are unavailable." retry={() => query.refetch()} /> : <><SectionHeading eyebrow={`Verification / ${detail.type}`} title={detail.name} description={`${detail.subject} · issued by ${detail.issuer}`} action={<div className="flex gap-2"><StatusBadge value={detail.status} /><button onClick={verifyNow} disabled={verify.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-[11px] font-bold text-white disabled:opacity-60" data-testid="button-verify-document">{verify.isPending ? 'Running checks…' : <><ShieldCheck className="size-3.5" /> Verify now</>}</button></div>} />{notice && <div className={cn('rounded-lg border px-4 py-3 text-[11px] font-semibold', notice.includes('could not') ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')} data-testid="status-verification-result">{notice}</div>}<div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><Panel title="Extracted fields" meta={<span className="flex items-center gap-1.5 text-[10px] text-emerald-600"><CheckCircle2 className="size-3" /> AI extracted</span>}>{detail.fields?.length ? <div className="divide-y divide-border/70">{detail.fields.map((field) => <div key={field.label} className="flex items-center justify-between gap-5 px-5 py-4"><div><div className="text-[10px] font-bold uppercase tracking-[.08em] text-muted-foreground">{field.label}</div><div className="mt-1 text-[12px] font-semibold">{field.value}</div></div><div className="text-right"><div className="mono text-[11px] text-emerald-600">{Math.round(field.confidence)}%</div><div className="mt-1 text-[9px] text-muted-foreground">confidence</div></div></div>)}</div> : <EmptyState title="No extracted fields" message="Fields will appear after the document is processed." />}</Panel><div className="space-y-5"><Panel title="Trust assessment"><div className="flex items-center gap-4 p-5"><div className="grid size-16 place-items-center rounded-full border-[6px] border-[hsl(var(--primary))]/20"><Score value={detail.trustScore} /></div><div><div className="text-[12px] font-bold">Identity confidence</div><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Composite score from issuer, field, and integrity checks.</p></div></div>{detail.signals?.length ? <div className="divide-y divide-border/70 border-t border-border/70">{detail.signals.map((signal) => <div key={signal.label} className="flex items-center justify-between px-5 py-3"><div className="flex items-center gap-2 text-[11px] font-semibold"><span className={cn('size-1.5 rounded-full', signal.severity.toLowerCase().includes('high') ? 'bg-red-500' : signal.severity.toLowerCase().includes('medium') ? 'bg-amber-500' : 'bg-emerald-500')} />{signal.label}</div><span className="text-[10px] text-muted-foreground">{signal.value}</span></div>)}</div> : null}</Panel><Panel title="Verification timeline"><div className="divide-y divide-border/70">{detail.timeline?.length ? detail.timeline.map((item) => <ActivityRow item={item} key={item.id} />) : <EmptyState icon={Clock3} title="No events yet" message="Verification events will be recorded here." />}</div></Panel></div></div></>}</div>;
}

function EmployeeStressAssessmentModal({ member, onClose }: { member: WorkforceMember; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [shiftHours, setShiftHours] = useState(member.shiftHours ?? 8);
  const [overtimeHours, setOvertimeHours] = useState(member.overtimeHours ?? 0);
  const [workloadTasks, setWorkloadTasks] = useState(member.workloadTasks ?? 3);
  const [restBreakIndex, setRestBreakIndex] = useState(member.restBreakIndex ?? 4);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notice, setNotice] = useState('');

  const calculatedScore = Math.max(
    5,
    Math.min(
      99,
      Math.round(shiftHours * 4.5 + workloadTasks * 6 + overtimeHours * 8 - restBreakIndex * 5)
    )
  );

  const calculatedLevel =
    calculatedScore >= 70 ? 'Burnout Risk' : calculatedScore >= 40 ? 'Elevated' : 'Optimal';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setNotice('');
    try {
      const res = await fetch(`/api/pramaanx/workforce/${member.id}/stress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftHours,
          overtimeHours,
          workloadTasks,
          restBreakIndex,
        }),
      });
      if (res.ok) {
        setNotice('Stress assessment updated successfully!');
        queryClient.invalidateQueries({ queryKey: getListWorkforceQueryKey() });
        setTimeout(() => onClose(), 800);
      } else {
        setNotice('Failed to update stress metrics.');
      }
    } catch (_err) {
      setNotice('Network error updating stress metrics.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
              <Heart className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Employee Stress Assessment</h2>
              <p className="text-[11px] text-muted-foreground">{member.name} · {member.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-4 border border-border/50">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calculated Stress Score</div>
            <div className="mono text-2xl font-extrabold text-foreground">{calculatedScore} / 100</div>
          </div>
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-bold border',
            calculatedScore >= 70 ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' : calculatedScore >= 40 ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
          )}>
            {calculatedLevel}
          </span>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span>Shift Duration</span>
                <span className="mono font-bold text-foreground">{shiftHours} Hours</span>
              </div>
              <input type="range" min={6} max={16} value={shiftHours} onChange={(e) => setShiftHours(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span>Overtime Hours</span>
                <span className="mono font-bold text-foreground">{overtimeHours} Hours</span>
              </div>
              <input type="range" min={0} max={8} value={overtimeHours} onChange={(e) => setOvertimeHours(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span>Active Workload / Tasks</span>
                <span className="mono font-bold text-foreground">{workloadTasks} Active Tasks</span>
              </div>
              <input type="range" min={1} max={15} value={workloadTasks} onChange={(e) => setWorkloadTasks(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span>Rest & Break Rating (1=Minimal, 5=Optimal)</span>
                <span className="mono font-bold text-foreground">Rating {restBreakIndex}/5</span>
              </div>
              <input type="range" min={1} max={5} value={restBreakIndex} onChange={(e) => setRestBreakIndex(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start gap-2.5">
            <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {calculatedScore >= 70
                ? 'AI Alert: High burnout risk detected. Recommend mandatory rest period and overtime cap.'
                : calculatedScore >= 40
                ? 'Workload is elevated. Monitor shift fatigue before assigning high-complexity tasks.'
                : 'Optimal stress balance. Employee is performing within safe cognitive & physical operating limits.'}
            </p>
          </div>

          {notice && <p className="text-center text-[11px] font-semibold text-emerald-600">{notice}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted">Cancel</button>
            <button disabled={isUpdating} className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-90 disabled:opacity-60">
              {isUpdating ? 'Calculating…' : 'Save & Update Telemetry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Workforce() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedMember, setSelectedMember] = useState<WorkforceMember | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const queryClient = useQueryClient();

  const params = useMemo(() => ({ ...(search ? { q: search } : {}), ...(status ? { status } : {}) }), [search, status]);
  const query = useListWorkforce(params, { query: { queryKey: getListWorkforceQueryKey(params) } });
  const members = query.data || [];

  const avgStress = members.length
    ? Math.round(members.reduce((acc, m) => acc + (m.stressScore ?? 20), 0) / members.length)
    : 0;

  const highStressCount = members.filter((m) => (m.stressScore ?? 0) >= 70 || m.stressLevel === 'Burnout Risk').length;
  const elevatedCount = members.filter((m) => (m.stressScore ?? 0) >= 40 && (m.stressScore ?? 0) < 70).length;
  const optimalCount = members.filter((m) => (m.stressScore ?? 0) < 40).length;

  const handleRecalculateAll = async () => {
    setIsRecalculating(true);
    try {
      await fetch('/api/pramaanx/workforce/recalculate-stress', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: getListWorkforceQueryKey() });
    } catch (_err) {
      // fallback handling
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="People / credentials & stress telemetry"
        title="Workforce & Stress Monitoring"
        description="Monitor credential assurance, cognitive workload, and burnout telemetry across all personnel."
        action={
          <button
            onClick={handleRecalculateAll}
            disabled={isRecalculating}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
            data-testid="button-recalculate-stress"
          >
            <RefreshCw className={cn('size-3.5', isRecalculating && 'animate-spin')} />
            {isRecalculating ? 'Recalculating Engine…' : 'Recalculate Live Stress'}
          </button>
        }
      />

      {/* Stress Telemetry KPI Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Avg Stress Index</span>
            <Heart className="size-4 text-rose-500" />
          </div>
          <div className="mono text-2xl font-extrabold text-foreground">{avgStress}%</div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn('h-full transition-all duration-500', avgStress >= 60 ? 'bg-rose-500' : avgStress >= 40 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${avgStress}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground">High Burnout Risk</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="mono text-2xl font-extrabold text-rose-600">{highStressCount} Personnel</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Requires workload cap</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Elevated Workload</span>
            <Gauge className="size-4 text-amber-500" />
          </div>
          <div className="mono text-2xl font-extrabold text-amber-600">{elevatedCount} Personnel</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Under close monitoring</div>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Optimal Balance</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mono text-2xl font-extrabold text-emerald-600">{optimalCount} Personnel</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Performing within limits</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)] sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full border-0 bg-muted/70 pl-9 text-[11px] outline-none" placeholder="Search name, role, organization…" data-testid="input-search-workforce" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 bg-muted/70 px-3 text-[11px] font-semibold outline-none sm:w-40" data-testid="select-workforce-status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring soon</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Panel title="Credential & Stress Telemetry Register" meta={<span className="mono text-[10px] text-muted-foreground">{query.data?.length ?? 0} PEOPLE</span>}>
        {query.isLoading ? (
          <LoadingPanel rows={6} />
        ) : query.isError ? (
          <ErrorState message="Workforce records are unavailable." retry={() => query.refetch()} />
        ) : query.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-border/70 text-[9px] uppercase tracking-[.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-bold">Person</th>
                  <th className="px-4 py-3 font-bold">Organization</th>
                  <th className="px-4 py-3 font-bold">Stress Index & Level</th>
                  <th className="px-4 py-3 font-bold">Shift & Workload</th>
                  <th className="px-4 py-3 font-bold">Trust</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((member) => (
                  <WorkforceRow key={member.id} member={member} onAssessStress={() => setSelectedMember(member)} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={UsersRound} title="No workforce records" message="No people match the current filters." />
        )}
      </Panel>

      {selectedMember && (
        <EmployeeStressAssessmentModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
}

function WorkforceRow({ member, onAssessStress }: { member: WorkforceMember; onAssessStress: () => void }) {
  const stress = member.stressScore ?? 20;
  const level = member.stressLevel || (stress >= 70 ? 'Burnout Risk' : stress >= 40 ? 'Elevated' : 'Optimal');
  const levelTone = stress >= 70 ? 'bg-rose-50 text-rose-700 border-rose-200' : stress >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-muted/35" data-testid={`row-workforce-${member.id}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[hsl(var(--primary))]/10 text-[11px] font-bold text-[hsl(var(--primary))]">
            {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </span>
          <div>
            <div className="text-[11px] font-bold">{member.name}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">{member.role}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-[11px] font-semibold text-muted-foreground">{member.organization}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="mono text-xs font-bold w-7 text-right">{stress}%</span>
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
            <div className={cn('h-full', stress >= 70 ? 'bg-rose-500' : stress >= 40 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${stress}%` }} />
          </div>
          <span className={cn('mono text-[9px] font-bold px-2 py-0.5 rounded-full border', levelTone)}>{level}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-[11px]">
        <div className="font-semibold text-foreground">{member.shiftHours || 8}h shift {member.overtimeHours ? <span className="text-amber-600 font-bold">(+{member.overtimeHours}h OT)</span> : null}</div>
        <div className="text-[10px] text-muted-foreground">{member.workloadTasks || 3} active tasks · rest index {member.restBreakIndex || 4}/5</div>
      </td>
      <td className="px-4 py-4"><Score value={member.trustScore} compact /></td>
      <td className="px-4 py-4"><StatusBadge value={member.status} /></td>
      <td className="px-5 py-4 text-right">
        <button
          onClick={onAssessStress}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          data-testid={`button-assess-stress-${member.id}`}
        >
          <Heart className="size-3 text-rose-500" /> Assess Stress
        </button>
      </td>
    </tr>
  );
}

function Assets() {
  const query = useListAssets({ query: { queryKey: getListAssetsQueryKey() } });
  const exportView = () => {
    if (!query.data?.length) return;
    const csv = ['Asset,Category,Location,Custody,Trust score,Last seen', ...query.data.map((asset) => [asset.name, asset.category, asset.location, asset.custodyStatus, asset.trustScore, asset.lastSeen].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'pramaanx-asset-custody.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return <div className="space-y-7"><SectionHeading eyebrow="Inventory / custody" title="Asset custody" description="A live chain of custody for physical and digital assets across every location." action={<button onClick={exportView} disabled={!query.data?.length} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[11px] font-bold shadow-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-export-assets"><BarChart3 className="size-3.5" /> Export view</button>} /><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Tracked assets" value={query.data?.length ?? '—'} detail="Across active locations" icon={Box} tone="blue" /><MetricCard label="Secure custody" value={query.data?.filter((item) => item.custodyStatus.toLowerCase().includes('secure')).length ?? '—'} detail="No action required" icon={ShieldCheck} tone="teal" /><MetricCard label="Attention needed" value={query.data?.filter((item) => !item.custodyStatus.toLowerCase().includes('secure')).length ?? '—'} detail="Review custody status" icon={ShieldAlert} tone="red" /></div><Panel title="Tracked inventory" meta={<span className="mono text-[10px] text-muted-foreground">{query.data?.length ?? 0} ASSETS</span>}>{query.isLoading ? <LoadingPanel rows={6} /> : query.isError ? <ErrorState message="Asset telemetry is unavailable." retry={() => query.refetch()} /> : query.data?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-border/70 text-[9px] uppercase tracking-[.12em] text-muted-foreground"><th className="px-5 py-3 font-bold">Asset</th><th className="px-4 py-3 font-bold">Location</th><th className="px-4 py-3 font-bold">Custody</th><th className="px-4 py-3 font-bold">Trust</th><th className="px-5 py-3 font-bold">Last seen</th></tr></thead><tbody>{query.data.map((asset) => <AssetRow key={asset.id} asset={asset} />)}</tbody></table></div> : <EmptyState icon={Box} title="No assets tracked" message="Connected assets will surface here once telemetry is available." />}</Panel></div>;
}

function AssetRow({ asset }: { asset: Asset }) {
  return <tr className="border-b border-border/60 last:border-0 hover:bg-muted/35" data-testid={`row-asset-${asset.id}`}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Box className="size-4" /></span><div><div className="text-[11px] font-bold">{asset.name}</div><div className="mt-1 text-[10px] text-muted-foreground">{asset.category}</div></div></div></td><td className="px-4 py-4 text-[11px] font-semibold text-muted-foreground">{asset.location}</td><td className="px-4 py-4"><StatusBadge value={asset.custodyStatus} /></td><td className="px-4 py-4"><Score value={asset.trustScore} compact /></td><td className="px-5 py-4 mono text-[10px] text-muted-foreground">{formatDate(asset.lastSeen)}</td></tr>;
}

function ActivityPage() {
  const query = useListActivity({ limit: 50 }, { query: { queryKey: getListActivityQueryKey({ limit: 50 }) } });
  return <div className="space-y-7"><SectionHeading eyebrow="Governance / traceability" title="Audit activity" description="A durable record of the decisions, signals, and people moving through PramaanX." action={<button onClick={() => query.refetch()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-[11px] font-bold shadow-sm hover:bg-muted" data-testid="button-refresh-activity"><RefreshCw className={cn('size-3.5', query.isFetching && 'animate-spin')} /> Refresh feed</button>} /><div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]"><div className="panel-grid relative overflow-hidden rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] p-6 text-white"><div className="relative z-10"><span className="mb-8 grid size-9 place-items-center rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Activity className="size-4" /></span><div className="mono text-[35px] font-medium tracking-[-.07em]">{query.data?.length ?? '—'}</div><div className="mt-1 text-[11px] text-slate-400">events in the current ledger</div><div className="mt-10 flex items-center gap-2 text-[10px] text-emerald-400"><span className="size-1.5 rounded-full bg-current" /> Immutable audit trail active</div></div></div><Panel title="Event ledger" meta={<span className="mono text-[10px] text-muted-foreground">MOST RECENT FIRST</span>}>{query.isLoading ? <LoadingPanel rows={8} /> : query.isError ? <ErrorState message="The audit ledger could not be loaded." retry={() => query.refetch()} /> : query.data?.length ? <div className="divide-y divide-border/70">{query.data.map((item) => <ActivityRow item={item} key={item.id} />)}</div> : <EmptyState icon={Activity} title="The ledger is quiet" message="Verification and custody events will be recorded here." />}</Panel></div></div>;
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  if (location === '/onboarding') return <Onboarding />;
  if (!isAuthenticated || location === '/login') return <Login />;

  return (
    <ErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard/it" component={ITDashboard} />
          <Route path="/dashboard/construction" component={ConstructionDashboard} />
          <Route path="/dashboard/medical" component={MedicalDashboard} />
          <Route path="/documents" component={Documents} />
          <Route path="/documents/:id" component={DocumentDetailPage} />
          <Route path="/workforce" component={Workforce} />
          <Route path="/assets" component={Assets} />
          <Route path="/activity" component={ActivityPage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;