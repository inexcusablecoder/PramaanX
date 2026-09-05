import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const success = await login(email.trim(), password);
      setLoading(false);
      if (success) {
        const savedUserStr = localStorage.getItem('px_user');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
        const sector = savedUser?.allowedSector;
        if (sector === 'it') setLocation('/dashboard/it');
        else if (sector === 'construction') setLocation('/dashboard/construction');
        else if (sector === 'medical') setLocation('/dashboard/medical');
        else setLocation('/');
      } else {
        setErrorMsg('Invalid credentials. Please verify your individual email and password.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect to authentication gateway. Please try again.');
    }
  };

  const handleRegisterStart = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation('/onboarding');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center bg-[hsl(var(--sidebar))] text-white p-4 overflow-hidden noise">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-[hsl(var(--primary))]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-[500px] rounded-full bg-[hsl(var(--accent))]/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="relative grid size-10 place-items-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-md">
              <span className="absolute size-6 rounded-md border-2 border-current rotate-45" />
              <span className="relative size-2 rounded-full bg-current" />
            </span>
            <span className="text-2xl font-extrabold tracking-[-.04em]">
              Pramaan<span className="text-[hsl(var(--accent))]">X</span>
            </span>
          </div>
          <p className="mono text-xs text-slate-400 uppercase tracking-[.25em]">
            Enterprise Verification &amp; Risk Operations
          </p>
        </div>

        {/* Card Frame */}
        <div className="rounded-2xl border border-white/10 bg-white/[.035] backdrop-blur-xl p-6 sm:p-7 shadow-2xl">
          {/* Auth Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-white/[.06] border border-white/10">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="tab-login"
            >
              Individual Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="tab-register-company"
            >
              Register Company
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-in fade-in duration-200">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Corporate Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pramaanx.io or user@company.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[.06] border border-white/10 text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                    data-testid="input-login-email"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link has been dispatched to your corporate email.')}
                    className="text-[10px] text-[hsl(var(--accent))] hover:underline"
                    data-testid="button-forgot-password"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[.06] border border-white/10 text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))] transition-colors"
                    data-testid="input-login-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold shadow-lg hover:brightness-110 active:scale-[.98] transition-all disabled:opacity-50 cursor-pointer"
                data-testid="button-submit-login"
              >
                {loading ? (
                  'Authenticating…'
                ) : (
                  <>
                    Sign In to Console <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              {/* Individual / Admin Account Reference Note */}
              <div className="mt-4 p-3 rounded-xl bg-white/[.03] border border-white/5 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px]">
                  <UserCheck className="size-3.5 text-[hsl(var(--accent))]" />
                  <span>Credential Guide</span>
                </div>
                <div className="text-[10px] leading-relaxed text-slate-400">
                  <strong className="text-amber-400 font-semibold">Administrator Access:</strong> Enter admin email (e.g. <code className="text-slate-200 bg-white/10 px-1 py-0.5 rounded">shreyash@pramaanx.io</code> or <code className="text-slate-200 bg-white/10 px-1 py-0.5 rounded">admin@pramaanx.io</code>).
                </div>
                <div className="text-[10px] leading-relaxed text-slate-400">
                  <strong className="text-blue-400 font-semibold">Workforce / Personnel:</strong> Enter your individual corporate email (e.g. <code className="text-slate-200 bg-white/10 px-1 py-0.5 rounded">ananya@apexlogistics.in</code> or your registered account).
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[.04] border border-white/10 text-center">
                <Building2 className="size-8 mx-auto mb-2 text-[hsl(var(--accent))]" />
                <h3 className="text-sm font-extrabold text-white">Setup Your Enterprise Account</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Start company verification, department setup, and workforce credential onboarding.
                </p>
              </div>

              <button
                onClick={handleRegisterStart}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold shadow-lg hover:brightness-105 active:scale-[.98] transition-all cursor-pointer"
                data-testid="button-start-onboarding"
              >
                Start Onboarding Wizard <Sparkles className="size-4" />
              </button>
            </div>
          )}

          {/* Social SSO Options */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Sign in with Enterprise SSO
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocation('/')}
                className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[.05] border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/[.1] transition-colors cursor-pointer"
                data-testid="sso-google"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.8-1.5-.8-3.5 0-5z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => setLocation('/')}
                className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[.05] border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/[.1] transition-colors cursor-pointer"
                data-testid="sso-microsoft"
              >
                <svg className="size-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>256-bit AES Encrypted · SOC2 Type II Certified</span>
        </div>
      </div>
    </div>
  );
}

