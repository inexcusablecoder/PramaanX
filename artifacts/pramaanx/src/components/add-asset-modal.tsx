import React, { useState } from 'react';
import {
  X,
  Plus,
  MapPin,
  Compass,
  HardHat,
  Truck,
  HeartPulse,
  Server,
  Layers,
  User,
  ShieldCheck,
} from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAssetModal({ isOpen, onClose, onSuccess }: AddAssetModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [fieldSector, setFieldSector] = useState<'construction' | 'logistics' | 'medical' | 'it'>('logistics');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('18.5204');
  const [longitude, setLongitude] = useState('73.8567');
  const [geofenceZone, setGeofenceZone] = useState('Operational Safe Zone');
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState('2500');
  const [assignedPersonnel, setAssignedPersonnel] = useState('');
  const [assignedPersonnelRole, setAssignedPersonnelRole] = useState('Field Operator');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickPresets = [
    { city: 'Mumbai', lat: '19.0760', lng: '72.8777' },
    { city: 'Pune', lat: '18.5204', lng: '73.8567' },
    { city: 'Bengaluru', lat: '12.9716', lng: '77.5946' },
    { city: 'Delhi-NCR', lat: '28.6139', lng: '77.2090' },
    { city: 'Hyderabad', lat: '17.3850', lng: '78.4867' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !location.trim()) {
      setErrorMsg('Please fill in all required asset fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          fieldSector,
          location: location.trim(),
          latitude: parseFloat(latitude) || 18.5204,
          longitude: parseFloat(longitude) || 73.8567,
          geofenceZone: geofenceZone.trim() || 'Operational Zone',
          geofenceRadiusMeters: parseInt(geofenceRadiusMeters, 10) || 2000,
          assignedPersonnel: assignedPersonnel.trim() || 'Operations Lead',
          assignedPersonnelRole: assignedPersonnelRole.trim() || 'Field Operator',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to register asset');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with asset registry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f131d] text-white p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Plus className="size-4 text-cyan-400" /> Register Field Asset with GPS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deploy a tracked physical asset with live telemetry &amp; geofence bounds.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Field / Sector Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Operational Field / Sector
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'construction', label: 'Construction', icon: HardHat, color: 'text-amber-400' },
                { id: 'logistics', label: 'Logistics', icon: Truck, color: 'text-cyan-400' },
                { id: 'medical', label: 'Healthcare', icon: HeartPulse, color: 'text-rose-400' },
                { id: 'it', label: 'IT & Digital', icon: Server, color: 'text-emerald-400' },
              ].map((s) => {
                const Icon = s.icon;
                const isSelected = fieldSector === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFieldSector(s.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-white/10 border-white/30 shadow-md ring-1 ring-white/20'
                        : 'bg-white/[.02] border-white/5 text-slate-400 hover:bg-white/[.05]'
                    }`}
                  >
                    <Icon className={`size-4 mx-auto mb-1 ${s.color}`} />
                    <div className="text-[10px] font-bold text-slate-200">{s.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CAT Excavator Unit 14"
                className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Earthmoving Equipment"
                className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Location Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Physical Location Description *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Chakan Distribution Hub - Bay 4, Pune"
              className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* GPS Coordinates & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GPS Starting Coordinates (Lat / Lng)
              </label>
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <span>Quick:</span>
                {quickPresets.map((p) => (
                  <button
                    key={p.city}
                    type="button"
                    onClick={() => {
                      setLatitude(p.lat);
                      setLongitude(p.lng);
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                  >
                    {p.city}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[.05] border border-white/10 text-xs mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[.05] border border-white/10 text-xs mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Geofence Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Geofence Safe Zone Name
              </label>
              <input
                type="text"
                value={geofenceZone}
                onChange={(e) => setGeofenceZone(e.target.value)}
                placeholder="e.g. Pune Central Industrial Zone"
                className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Safe Radius (Meters)
              </label>
              <input
                type="number"
                value={geofenceRadiusMeters}
                onChange={(e) => setGeofenceRadiusMeters(e.target.value)}
                placeholder="2500"
                className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Assigned Personnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assigned Custodian Name
              </label>
              <input
                type="text"
                value={assignedPersonnel}
                onChange={(e) => setAssignedPersonnel(e.target.value)}
                placeholder="e.g. Rohan Mehta"
                className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Custodian Role
              </label>
              <input
                type="text"
                value={assignedPersonnelRole}
                onChange={(e) => setAssignedPersonnelRole(e.target.value)}
                placeholder="e.g. Field Contractor"
                className="w-full h-10 px-3 rounded-xl bg-white/[.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-xl bg-white/[.05] border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-[.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registering Tracker…' : 'Register & Deploy Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
