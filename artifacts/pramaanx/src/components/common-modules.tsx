import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  Send,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export function AICopilotDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Hello, Ari. I am PramaanX AI Copilot. I monitor credential integrity, asset custody anomalies, and workforce burnout risks in real time. How can I assist your operations command center today?',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const userText = query;
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      let aiResp =
        'Analyzing perimeter telemetry... All credential verification pipelines are within safe operational thresholds.';
      if (userText.toLowerCase().includes('stress') || userText.toLowerCase().includes('burnout')) {
        aiResp =
          'Workforce Stress Monitor indicates 3 engineering squads are operating at 88% capacity. Recommending shift rebalancing and overtime caps.';
      } else if (userText.toLowerCase().includes('asset') || userText.toLowerCase().includes('custody')) {
        aiResp =
          'Asset Telemetry detected 2 laptops in transit to London Hub without registered biometric passkeys. Security alerts issued.';
      } else if (userText.toLowerCase().includes('verify') || userText.toLowerCase().includes('document')) {
        aiResp =
          'Verification engine queue has 12 items pending. AI confidence score for high-priority documents average 96.4%.';
      }
      setMessages((prev) => [...prev, { role: 'ai', text: aiResp }]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[hsl(var(--sidebar))] border-l border-white/10 shadow-2xl flex flex-col noise">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-bold shadow">
            <Bot className="size-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-white">PramaanX AI Copilot</h3>
            <span className="mono text-[9px] text-emerald-400 font-semibold">Active Intelligence</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded"
        >
          Close
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[hsl(var(--primary))] text-white font-medium'
                  : 'bg-white/[.06] border border-white/10 text-slate-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI Copilot about risk, stress, or documents..."
          className="flex-1 h-10 px-3.5 rounded-xl bg-white/[.06] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))]"
        />
        <button
          type="submit"
          className="size-10 grid place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function AlertCenterDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const alerts = [
    { id: 1, title: 'Expiring Medical Licenses', sector: 'Healthcare', severity: 'high', time: '10m ago' },
    { id: 2, title: 'Worker Overtime Threshold Exceeded (Site 4)', sector: 'Construction', severity: 'medium', time: '25m ago' },
    { id: 3, title: 'Unverified Software Developer Certificate', sector: 'IT Sector', severity: 'low', time: '1h ago' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[hsl(var(--sidebar))] border-l border-white/10 shadow-2xl flex flex-col noise">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-red-400" />
          <h3 className="text-xs font-bold text-white">Central Operations Alert Center</h3>
        </div>
        <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-white">
          Close
        </button>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {alerts.map((a) => (
          <div key={a.id} className="p-3.5 rounded-xl bg-white/[.04] border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="mono text-[9px] uppercase tracking-wider text-slate-400">{a.sector}</span>
              <span className="mono text-[9px] text-slate-500">{a.time}</span>
            </div>
            <div className="text-xs font-bold text-white">{a.title}</div>
            <div className="flex items-center justify-between pt-2">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                a.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {a.severity} Priority
              </span>
              <button className="text-[10px] font-bold text-[hsl(var(--accent))] hover:underline">Resolve Alert →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkforceStressMonitorCard() {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-rose-500" />
          <h3 className="text-xs font-bold text-foreground">Workforce Stress & Burnout Monitor</h3>
        </div>
        <span className="mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          HEALTHY (82/100)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-muted/60 text-center">
          <div className="mono text-lg font-bold text-foreground">14.2%</div>
          <div className="text-[10px] text-muted-foreground">Stress Index</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/60 text-center">
          <div className="mono text-lg font-bold text-amber-600">3 Squads</div>
          <div className="text-[10px] text-muted-foreground">High Load Risk</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/60 text-center">
          <div className="mono text-lg font-bold text-emerald-600">94.8%</div>
          <div className="text-[10px] text-muted-foreground">Wellbeing Score</div>
        </div>
      </div>
    </div>
  );
}

export function GPSTrackingCard() {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-teal-600" />
          <h3 className="text-xs font-bold text-foreground">GPS & Hardware Asset Telemetry</h3>
        </div>
        <span className="mono text-[10px] text-muted-foreground">LIVE TRACKING</span>
      </div>

      <div className="h-32 rounded-lg bg-slate-950 p-4 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div>
            <div className="text-xs font-bold">Node Delta-9 (Mobile Transit)</div>
            <div className="mono text-[9px] text-slate-400">Lat: 51.5074 N · Lon: 0.1278 W</div>
          </div>
          <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="z-10 flex justify-between items-end mono text-[10px] text-slate-300">
          <span>Custody Status: SECURE</span>
          <span className="text-teal-400">Telemetry 84ms</span>
        </div>
        <div className="absolute inset-0 opacity-20 panel-grid pointer-events-none" />
      </div>
    </div>
  );
}
