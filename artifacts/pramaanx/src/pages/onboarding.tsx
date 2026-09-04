import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck,
  FileText,
  HeartPulse,
  Laptop,
  Layers,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Upload,
  UserPlus,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';

type IndustryType = 'IT & Software' | 'Private Sector' | 'Healthcare' | 'Education';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companySize, setCompanySize] = useState('51-200 Employees');
  const [industry, setIndustry] = useState<IndustryType>('IT & Software');
  const [businessType, setBusinessType] = useState('Software Development');

  // Organization Setup
  const [departments, setDepartments] = useState<string[]>(['HR', 'Operations', 'Engineering']);
  const [branches, setBranches] = useState('Headquarters (San Francisco), Regional HQ (London)');
  const [capacity, setCapacity] = useState('250');

  // Verification Status Simulation
  const [docUploaded, setDocUploaded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified'>('pending');

  // Employee Invite State
  const [employeeName, setEmployeeName] = useState('Rahul Sharma');
  const [employeeEmail, setEmployeeEmail] = useState('rahul.s@company.com');
  const [employeeDept, setEmployeeDept] = useState('Engineering');
  const [employeeRole, setEmployeeRole] = useState('Lead Systems Architect');
  const [employeeDocsUploaded, setEmployeeDocsUploaded] = useState(false);
  const [employeeVerifStatus, setEmployeeVerifStatus] = useState<'Verified' | 'Under Review' | 'Rejected'>('Verified');
  const [assignedAssets, setAssignedAssets] = useState<string[]>(['Laptop', 'Mobile']);

  const businessTypeOptions: Record<IndustryType, string[]> = {
    'IT & Software': ['Software Development', 'IT Services', 'Product Company', 'Startup'],
    'Private Sector': ['Construction', 'Logistics', 'Manufacturing', 'Retail', 'Warehousing'],
    Healthcare: ['Hospital', 'Clinic', 'Diagnostic Center'],
    Education: ['University', 'K-12 School Network', 'Online Learning Platform'],
  };

  const handleIndustryChange = (ind: IndustryType) => {
    setIndustry(ind);
    setBusinessType(businessTypeOptions[ind][0]);
  };

  const toggleDept = (dept: string) => {
    setDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleAsset = (asset: string) => {
    setAssignedAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    );
  };

  const runAdminVerification = () => {
    setDocUploaded(true);
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerificationStatus('verified');
    }, 1200);
  };

  const { register } = useAuth();

  const finishOnboarding = async () => {
    await register(
      {
        companyName,
        companyEmail,
        companySize,
        industry,
        businessType,
        departments,
        branches,
        capacity,
      },
      {
        adminName: employeeName || 'Enterprise Admin',
        adminEmail: companyEmail,
        adminRole: 'CEO / Executive',
        adminDept: 'Operations',
      }
    );

    // Land on the corresponding sector dashboard
    if (industry === 'IT & Software') setLocation('/dashboard/it');
    else if (industry === 'Private Sector') setLocation('/dashboard/construction');
    else if (industry === 'Healthcare') setLocation('/dashboard/medical');
    else setLocation('/');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--sidebar))] text-white px-4 py-8 noise flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : setLocation('/login'))}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          data-testid="button-onboarding-back"
        >
          <ArrowLeft className="size-4" /> {step > 1 ? 'Previous Step' : 'Back to Login'}
        </button>
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] uppercase tracking-widest text-[hsl(var(--accent))] font-bold">
            Step {step} of 6
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-6 bg-[hsl(var(--accent))]'
                    : i < step
                    ? 'w-3 bg-emerald-400'
                    : 'w-3 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[.035] backdrop-blur-xl p-8 shadow-2xl rise-in">
        {/* STEP 1: COMPANY REGISTRATION & SIZE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="mono text-[10px] uppercase tracking-widest text-slate-400">
                Phase 1 · Basic Details
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">Company Registration</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your official organization credentials to initialize PramaanX verification perimeter.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Cybernetics Ltd."
                  className="w-full h-11 px-4 rounded-xl bg-white/[.06] border border-white/10 text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))]"
                  data-testid="input-company-name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Company Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="admin@acmecybernetics.com"
                  className="w-full h-11 px-4 rounded-xl bg-white/[.06] border border-white/10 text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))]"
                  data-testid="input-company-email"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Company Size
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['1-50 Employees', '51-200 Employees', '201-1000 Employees', '1000+ Employees'].map(
                    (size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setCompanySize(size)}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          companySize === size
                            ? 'bg-[hsl(var(--accent))]/15 border-[hsl(var(--accent))] text-[hsl(var(--accent))] shadow'
                            : 'bg-white/[.04] border-white/10 text-slate-300 hover:bg-white/[.08]'
                        }`}
                        data-testid={`btn-size-${size.replaceAll(' ', '-')}`}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold shadow-lg hover:brightness-110"
                data-testid="btn-next-step-2"
              >
                Continue to Industry Selection <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 & 3: SELECT INDUSTRY & BUSINESS TYPE */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="mono text-[10px] uppercase tracking-widest text-slate-400">
                Phase 2 · Operational Context
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">Select Industry & Business Type</h2>
              <p className="text-xs text-slate-400 mt-1">
                PramaanX customizes compliance rules, asset custody maps, and risk engines based on your sector.
              </p>
            </div>

            {/* Industry Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-3">
                1. Primary Sector
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'IT & Software', icon: Cpu, desc: 'Tech products, IT services, cloud & software' },
                  { id: 'Private Sector', icon: Truck, desc: 'Construction, logistics, manufacturing, warehousing' },
                  { id: 'Healthcare', icon: HeartPulse, desc: 'Hospitals, clinics, diagnostic centers' },
                  { id: 'Education', icon: Building, desc: 'Universities, schools, training institutes' },
                ].map(({ id, icon: Icon, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleIndustryChange(id as IndustryType)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      industry === id
                        ? 'bg-[hsl(var(--accent))]/15 border-[hsl(var(--accent))] text-white shadow-lg'
                        : 'bg-white/[.04] border-white/10 text-slate-400 hover:bg-white/[.08]'
                    }`}
                    data-testid={`btn-industry-${id.replaceAll(' ', '-')}`}
                  >
                    <Icon className={`size-6 mb-2 ${industry === id ? 'text-[hsl(var(--accent))]' : 'text-slate-400'}`} />
                    <div className="text-sm font-bold text-white">{id}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Type Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-3">
                2. Sub Business Type (for {industry})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {businessTypeOptions[industry].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      businessType === type
                        ? 'bg-[hsl(var(--primary))]/20 border-[hsl(var(--primary))] text-[hsl(var(--accent))] shadow'
                        : 'bg-white/[.04] border-white/10 text-slate-300 hover:bg-white/[.08]'
                    }`}
                    data-testid={`btn-btype-${type.replaceAll(' ', '-')}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="h-11 px-5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold shadow-lg hover:brightness-110"
                data-testid="btn-next-step-3"
              >
                Organization Setup <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ORGANIZATION SETUP */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="mono text-[10px] uppercase tracking-widest text-slate-400">
                Phase 3 · Structure & Governance
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">Organization & Department Setup</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure operational units, regional branches, and workforce capacity.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Active Departments
                </label>
                <div className="flex flex-wrap gap-2">
                  {['HR', 'Operations', 'Finance', 'Engineering', 'Sales', 'Logistics', 'Compliance', 'Security'].map(
                    (dept) => {
                      const active = departments.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => toggleDept(dept)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-white/[.04] border-white/10 text-slate-400 hover:bg-white/[.08]'
                          }`}
                        >
                          {active && <Check className="size-3.5" />} {dept}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Branches / Facilities Locations
                </label>
                <input
                  type="text"
                  value={branches}
                  onChange={(e) => setBranches(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[.06] border border-white/10 text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))]"
                  data-testid="input-branches"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Total Employee Capacity Limit
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[.06] border border-white/10 text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[hsl(var(--accent))]"
                  data-testid="input-capacity"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="h-11 px-5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold shadow-lg hover:brightness-110"
                data-testid="btn-next-step-4"
              >
                Proceed to Verification <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 & 6: ADMIN VERIFICATION & AI CHECK */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="mono text-[10px] uppercase tracking-widest text-slate-400">
                Phase 4 · Admin Verification
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">Upload Compliance Documents</h2>
              <p className="text-xs text-slate-400 mt-1">
                PramaanX AI validates company authenticity against national registries.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-dashed border-white/20 bg-white/[.02] text-center">
              <Upload className="size-10 mx-auto mb-3 text-[hsl(var(--accent))]" />
              <h3 className="text-sm font-bold text-white">Upload Corporate Credentials</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Required: Company Reg Certificate, GST Certificate, PAN Card, Business License (.pdf or .png)
              </p>

              {!docUploaded ? (
                <button
                  type="button"
                  onClick={runAdminVerification}
                  className="px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold hover:brightness-105"
                  data-testid="btn-sim-upload"
                >
                  Upload & Analyze Documents
                </button>
              ) : verifying ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[hsl(var(--accent))]">
                  <Sparkles className="size-4 animate-spin" /> AI scanning document security features & seals...
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
                  <CheckCircle2 className="size-4" /> AI Verified: Verified Company Status Granted
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                'Company Registration',
                'GST Certificate',
                'Corporate PAN',
                'Business License',
              ].map((doc) => (
                <div
                  key={doc}
                  className="p-3 rounded-xl bg-white/[.04] border border-white/10 text-center"
                >
                  <FileText className="size-5 mx-auto mb-1 text-slate-400" />
                  <div className="text-[11px] font-semibold text-slate-200">{doc}</div>
                  <div className="text-[9px] mono text-emerald-400 mt-1">
                    {verificationStatus === 'verified' ? '✓ Verified' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="h-11 px-5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Back
              </button>
              <button
                disabled={verificationStatus !== 'verified'}
                onClick={() => setStep(5)}
                className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold shadow-lg hover:brightness-110 disabled:opacity-50"
                data-testid="btn-next-step-5"
              >
                Setup Roles & Access <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7 & 8: ADMIN DASHBOARD ACCESS & EMPLOYEE INVITATION */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="mono text-[10px] uppercase tracking-widest text-slate-400">
                Phase 5 · Team Invitation & Access
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">Admin Roles & Employee Invitations</h2>
              <p className="text-xs text-slate-400 mt-1">
                Grant role-based administrative permissions (CEO, Manager, Supervisor, Employee).
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['CEO / Executive', 'Manager', 'Supervisor', 'Employee'].map((role) => (
                  <div
                    key={role}
                    className={`p-3 rounded-xl border text-center text-xs font-bold ${
                      employeeRole === role
                        ? 'bg-[hsl(var(--accent))]/15 border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                        : 'bg-white/[.04] border-white/10 text-slate-400'
                    }`}
                  >
                    {role}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white/[.04] border border-white/10 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <UserPlus className="size-4 text-[hsl(var(--accent))]" /> Send Employee Invitation
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Full Name"
                    className="h-10 px-3 rounded-lg bg-white/[.06] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="email"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="Email Address"
                    className="h-10 px-3 rounded-lg bg-white/[.06] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="h-11 px-5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="h-11 px-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-white text-xs font-bold shadow-lg hover:brightness-110"
                data-testid="btn-next-step-6"
              >
                Employee Onboarding Check <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 9 & 10: EMPLOYEE VERIFICATION & ONBOARDING */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <span className="mono text-[10px] uppercase tracking-widest text-slate-400">
                Phase 6 · Employee Verification & Asset Assignment
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">Onboarding Simulation</h2>
              <p className="text-xs text-slate-400 mt-1">
                Preview how incoming employee credentials and asset custody are verified.
              </p>
            </div>

            {/* Employee Upload Checklist */}
            <div className="p-4 rounded-xl bg-white/[.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Employee Document Pipeline ({employeeName})</span>
                <span className="mono text-[10px] text-emerald-400 font-bold">Status: {employeeVerifStatus}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                {['ID Card', 'Aadhaar / SSN', 'PAN Card', 'Degree Cert', 'Experience Cert'].map((doc) => (
                  <div key={doc} className="p-2 rounded-lg bg-white/[.06] border border-white/10">
                    <FileCheck className="size-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-slate-300 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Assignment */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                Assign Hardware Assets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Laptop', icon: Laptop },
                  { name: 'Mobile', icon: Smartphone },
                  { name: 'Vehicle', icon: Truck },
                  { name: 'Equipment', icon: Wrench },
                ].map(({ name, icon: Icon }) => {
                  const active = assignedAssets.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleAsset(name)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        active
                          ? 'bg-[hsl(var(--accent))]/15 border-[hsl(var(--accent))] text-[hsl(var(--accent))]'
                          : 'bg-white/[.04] border-white/10 text-slate-400 hover:bg-white/[.08]'
                      }`}
                    >
                      <Icon className="size-5" />
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(5)}
                className="h-11 px-5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={finishOnboarding}
                className="h-11 px-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-bold shadow-xl hover:brightness-105"
                data-testid="btn-launch-dashboard"
              >
                Launch {industry} Command Center <Sparkles className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
