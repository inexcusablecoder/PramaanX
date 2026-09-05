import React, { useState } from 'react';
import {
  X,
  Radio,
  Compass,
  Battery,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  RefreshCw,
  User,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Gauge,
  Satellite,
  HardHat,
  Truck,
  HeartPulse,
  Server,
} from 'lucide-react';
import type { Asset } from '@workspace/api-client-react';

interface AssetGpsInspectorModalProps {
  asset: Asset | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function AssetGpsInspectorModal({
  asset,
  onClose,
  onRefresh,
}: AssetGpsInspectorModalProps) {
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [lockingDown, setLockingDown] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!asset) return null;

  const lat = asset.latitude || 18.5204;
  const lng = asset.longitude || 73.8567;
  const speed = asset.speedKmh || 0;
  const battery = asset.batteryLevel ?? 95;
  const heading = asset.headingDegrees || 0;
  const altitude = asset.altitudeMeters || 520;
  const geofenceStatus = asset.geofenceStatus || 'inside';
  const isBreached = geofenceStatus === 'breached';
  const isWarning = geofenceStatus === 'warning';

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePing = async () => {
    setPinging(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/assets/${asset.id}/ping`, { method: 'POST' });
      if (res.ok) {
        setStatusMessage('Satellite ping synchronized: telemetry & coordinates updated.');
        onRefresh();
      }
    } catch {
      setStatusMessage('Failed to communicate with satellite telemetry gateway.');
    } finally {
      setPinging(false);
    }
  };

  const handleEmergencyLockdown = async () => {
    if (!confirm(`Engage Emergency Remote Lockdown for "${asset.name}"? This will immobilize propulsion and alert security operations.`)) {
      return;
    }
    setLockingDown(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/assets/${asset.id}/lockdown`, { method: 'POST' });
      if (res.ok) {
        setStatusMessage('Emergency Remote Lockdown engaged! Propulsion immobilized and audit trail logged.');
        onRefresh();
      }
    } catch {
      setStatusMessage('Lockdown signal failed to reach field unit.');
    } finally {
      setLockingDown(false);
    }
  };

  const getSectorIcon = (sector?: string) => {
    switch ((sector || '').toLowerCase()) {
      case 'construction':
        return <HardHat className="size-4 text-amber-400" />;
      case 'medical':
        return <HeartPulse className="size-4 text-rose-400" />;
      case 'it':
        return <Server className="size-4 text-emerald-400" />;
      case 'logistics':
      default:
        return <Truck className="size-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#0f131d] text-white p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 size-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-white/[.05] border border-white/10">
              {getSectorIcon(asset.fieldSector)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">{asset.name}</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {asset.fieldSector || 'General'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{asset.category} · {asset.location}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Status Alert Notification if any */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-2">
            <Radio className="size-4 shrink-0 animate-pulse" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Real-time Telemetry Grid */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Coordinates Card */}
            <div className="p-3 rounded-xl bg-white/[.03] border border-white/5 col-span-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3 text-cyan-400" />
                  GPS Coordinates
                </span>
                <button
                  type="button"
                  onClick={copyCoordinates}
                  className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mono text-xs font-extrabold text-white">
                {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Altitude: {altitude}m ASL · NavIC Fix
              </div>
            </div>

            {/* Speedometer */}
            <div className="p-3 rounded-xl bg-white/[.03] border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                <Gauge className="size-3 text-emerald-400" />
                Velocity
              </span>
              <div className="mono text-sm font-extrabold text-white">
                {speed} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
              </div>
              <span className="text-[9px] text-slate-400">
                {speed > 0 ? '● In-Transit' : '○ Stationary'}
              </span>
            </div>

            {/* Heading Compass */}
            <div className="p-3 rounded-xl bg-white/[.03] border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1 mb-1">
                <Compass className="size-3 text-amber-400" />
                Heading
              </span>
              <div className="mono text-sm font-extrabold text-white">
                {heading}°
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                {heading >= 315 || heading < 45 ? 'North' : heading < 135 ? 'East' : heading < 225 ? 'South' : 'West'}
              </span>
            </div>
          </div>

          {/* Battery & Satellite Health */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[.03] border border-white/5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Battery className="size-3 text-emerald-400" />
                  Tracker Battery
                </span>
                <span className="font-mono text-emerald-400">{battery}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    battery > 50 ? 'bg-emerald-400' : battery > 20 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${battery}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">Telemetry Beacon Active</div>
            </div>

            <div className="p-3 rounded-xl bg-white/[.03] border border-white/5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Satellite className="size-3 text-cyan-400" />
                  Constellation Lock
                </span>
                <span className="text-emerald-400 font-bold">3D FIX</span>
              </div>
              <div className="mono text-xs font-bold text-white">12 Satellites</div>
              <div className="text-[9px] text-slate-400 mt-0.5">NavIC / IRNSS + GPS L1/L5</div>
            </div>
          </div>

          {/* Geofence Card */}
          <div className="p-4 rounded-xl bg-white/[.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Geofence Security Perimeter
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isBreached
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isBreached ? (
                  <>
                    <ShieldAlert className="size-3" /> Geofence Breached
                  </>
                ) : isWarning ? (
                  <>
                    <AlertTriangle className="size-3" /> Near Perimeter
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-3" /> Inside Safe Zone
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Assigned Zone</span>
                <span className="font-semibold text-slate-200">{asset.geofenceZone || 'Operational Area'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Perimeter Radius</span>
                <span className="font-mono font-semibold text-slate-200">
                  {asset.geofenceRadiusMeters ? `${asset.geofenceRadiusMeters} meters` : '2,000 meters'}
                </span>
              </div>
            </div>
          </div>

          {/* Custodian & Verification Trust Card */}
          <div className="p-4 rounded-xl bg-white/[.03] border border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white/[.06] border border-white/10 text-slate-300">
                <User className="size-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Custodian</span>
                <div className="text-xs font-extrabold text-white">{asset.assignedPersonnel || 'Unassigned'}</div>
                <div className="text-[10px] text-slate-400">{asset.assignedPersonnelRole || 'Field Operator'}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Trust Score</span>
              <div className="mono text-base font-extrabold text-emerald-400">
                {asset.trustScore || 98}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <span className="text-[9px] text-emerald-500 font-semibold">Verified KYC</span>
            </div>
          </div>

          {/* Tactical Action Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={pinging}
              onClick={handleSimulatePing}
              className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-600/30 transition-all active:scale-[.98] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-4 ${pinging ? 'animate-spin' : ''}`} />
              {pinging ? 'Pinging Satellites…' : 'Simulate Satellite Ping'}
            </button>

            <button
              type="button"
              disabled={lockingDown}
              onClick={handleEmergencyLockdown}
              className="h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-600/30 transition-all active:scale-[.98] disabled:opacity-50 cursor-pointer"
            >
              <Lock className="size-4" />
              {lockingDown ? 'Engaging Lockdown…' : 'Emergency Remote Lockdown'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
