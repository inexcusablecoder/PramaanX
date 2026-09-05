import React, { useMemo, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Radio,
  Layers,
  Truck,
  HardHat,
  HeartPulse,
  Server,
} from 'lucide-react';
import type { Asset } from '@workspace/api-client-react';

interface GpsTacticalMapProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: Asset) => void;
  sectorFilter?: string;
  onPingAsset?: (id: string) => void;
}

export function GpsTacticalMap({
  assets,
  selectedAssetId,
  onSelectAsset,
  sectorFilter = 'all',
}: GpsTacticalMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGeofences, setShowGeofences] = useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);

  // Coordinate projection bounding box (Covering active operations: India central/west/south/north)
  // Bounding box: Lat 11.5°N to 29.5°N, Lng 71.5°E to 79.5°E
  const minLat = 11.5;
  const maxLat = 29.5;
  const minLng = 71.5;
  const maxLng = 79.5;

  const mapWidth = 900;
  const mapHeight = 600;

  // Convert GPS (lat, lng) to SVG pixel coordinates
  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    // Invert Y because SVG coordinates increase downwards
    const y = ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
    return { x, y };
  };

  const filteredAssets = useMemo(() => {
    if (!sectorFilter || sectorFilter === 'all') return assets;
    return assets.filter((a) => (a.fieldSector || '').toLowerCase() === sectorFilter.toLowerCase());
  }, [assets, sectorFilter]);

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  // Major Regional Reference Points
  const referenceCities = [
    { name: 'Delhi-NCR (North Hub)', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai (Maritime & Metro)', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune (Automotive & Bio)', lat: 18.5204, lng: 73.8567 },
    { name: 'Nashik (Fulfillment)', lat: 19.9975, lng: 73.7898 },
    { name: 'Hyderabad (Bio-Tech Corridor)', lat: 17.3850, lng: 78.4867 },
    { name: 'Bengaluru (Silicon Corridor)', lat: 12.9716, lng: 77.5946 },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Sector Icon Helper
  const getSectorIcon = (sector?: string) => {
    switch ((sector || '').toLowerCase()) {
      case 'construction':
        return <HardHat className="size-3 text-amber-400" />;
      case 'medical':
        return <HeartPulse className="size-3 text-rose-400" />;
      case 'it':
        return <Server className="size-3 text-emerald-400" />;
      case 'logistics':
      default:
        return <Truck className="size-3 text-cyan-400" />;
    }
  };

  const getSectorColor = (sector?: string) => {
    switch ((sector || '').toLowerCase()) {
      case 'construction':
        return '#f59e0b';
      case 'medical':
        return '#f43f5e';
      case 'it':
        return '#10b981';
      case 'logistics':
      default:
        return '#06b6d4';
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#0b0e14] overflow-hidden shadow-2xl select-none">
      {/* HUD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white/[.02] border-b border-white/10 backdrop-blur-md z-20 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              NavIC / GPS Tactical Radar
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 border-l border-white/10 pl-3">
            {filteredAssets.length} Active Feeds
          </span>
        </div>

        {/* Tactical Map Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGeofences(!showGeofences)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              showGeofences
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white/[.03] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Geofence Perimeters"
          >
            <Layers className="size-3 inline mr-1" />
            Geofences
          </button>

          <button
            type="button"
            onClick={() => setShowBreadcrumbs(!showBreadcrumbs)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              showBreadcrumbs
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                : 'bg-white/[.03] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Historical Breadcrumb Trails"
          >
            <Radio className="size-3 inline mr-1" />
            Trails
          </button>

          <div className="flex items-center bg-white/[.05] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded"
              title="Zoom In"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded"
              title="Reset View"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div
        className="relative w-full h-[480px] sm:h-[540px] cursor-grab active:cursor-grabbing overflow-hidden bg-[#07090e]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Tactical Coordinate Canvas */}
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Coordinate Grid Lines */}
          <g className="opacity-15 stroke-white" strokeWidth="0.5" strokeDasharray="3 3">
            {[15, 20, 25].map((lat) => {
              const { y } = project(lat, minLng);
              return <line key={`lat-${lat}`} x1="0" y1={y} x2={mapWidth} y2={y} />;
            })}
            {[73, 75, 77].map((lng) => {
              const { x } = project(minLat, lng);
              return <line key={`lng-${lng}`} x1={x} y1="0" x2={x} y2={mapHeight} />;
            })}
          </g>

          {/* Major Transit Corridor Connectors (Expressways & Corridors) */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none">
            {/* Mumbai - Pune Expressway */}
            <path
              d={`M ${project(19.076, 72.877).x} ${project(19.076, 72.877).y} Q ${project(18.75, 73.41).x} ${project(18.75, 73.41).y} ${project(18.52, 73.856).x} ${project(18.52, 73.856).y}`}
              strokeDasharray="4 4"
            />
            {/* Pune - Bengaluru Tech Transit */}
            <path
              d={`M ${project(18.52, 73.856).x} ${project(18.52, 73.856).y} L ${project(12.971, 77.594).x} ${project(12.971, 77.594).y}`}
              strokeDasharray="4 4"
            />
            {/* Mumbai - Delhi Logistics Corridor */}
            <path
              d={`M ${project(19.076, 72.877).x} ${project(19.076, 72.877).y} L ${project(28.613, 77.209).x} ${project(28.613, 77.209).y}`}
              strokeDasharray="4 4"
            />
          </g>

          {/* Reference Cities / Industrial Hubs */}
          <g>
            {referenceCities.map((city) => {
              const { x, y } = project(city.lat, city.lng);
              return (
                <g key={city.name} transform={`translate(${x}, ${y})`}>
                  <circle r="3" fill="#64748b" opacity="0.6" />
                  <circle r="7" fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.4" />
                  <text
                    x="10"
                    y="3"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="600"
                    opacity="0.75"
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Geofence Perimeter Rings */}
          {showGeofences && (
            <g>
              {filteredAssets.map((asset) => {
                const lat = asset.latitude || 18.52;
                const lng = asset.longitude || 73.85;
                const { x, y } = project(lat, lng);
                const radiusMeters = asset.geofenceRadiusMeters || 2000;
                const radiusPx = Math.max(14, (radiusMeters / 1000) * 8);

                const isBreached = asset.geofenceStatus === 'breached';
                const isWarning = asset.geofenceStatus === 'warning';
                const strokeColor = isBreached ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

                return (
                  <g key={`geofence-${asset.id}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={radiusPx}
                      fill={strokeColor}
                      fillOpacity={isBreached ? 0.15 : 0.04}
                      stroke={strokeColor}
                      strokeWidth={asset.id === selectedAssetId ? '2' : '1'}
                      strokeDasharray="4 3"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Breadcrumb Historical Route Trails */}
          {showBreadcrumbs && (
            <g>
              {filteredAssets.map((asset) => {
                let crumbs: Array<{ lat: number; lng: number }> = [];
                try {
                  crumbs =
                    typeof asset.telemetryBreadcrumbs === 'string'
                      ? JSON.parse(asset.telemetryBreadcrumbs)
                      : asset.telemetryBreadcrumbs || [];
                } catch {
                  crumbs = [];
                }
                if (crumbs.length < 2) return null;

                const points = crumbs
                  .map((c) => {
                    const p = project(c.lat, c.lng);
                    return `${p.x},${p.y}`;
                  })
                  .join(' ');

                const sectorColor = getSectorColor(asset.fieldSector);

                return (
                  <g key={`trail-${asset.id}`}>
                    <polyline
                      points={points}
                      fill="none"
                      stroke={sectorColor}
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      opacity="0.65"
                    />
                    {crumbs.map((c, idx) => {
                      const p = project(c.lat, c.lng);
                      return (
                        <circle
                          key={`crumb-${idx}`}
                          cx={p.x}
                          cy={p.y}
                          r="2.5"
                          fill={sectorColor}
                          opacity="0.8"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}

          {/* Tracked Assets Markers */}
          <g>
            {filteredAssets.map((asset) => {
              const lat = asset.latitude || 18.52;
              const lng = asset.longitude || 73.85;
              const { x, y } = project(lat, lng);
              const isSelected = asset.id === selectedAssetId;
              const sectorColor = getSectorColor(asset.fieldSector);
              const isMoving = (asset.speedKmh || 0) > 0;
              const isAlert = asset.custodyStatus === 'attention' || asset.geofenceStatus === 'warning' || asset.geofenceStatus === 'breached';

              return (
                <g
                  key={asset.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAsset(asset);
                  }}
                >
                  {/* Selected / Alert Radar Ring */}
                  {isSelected && (
                    <circle
                      r="22"
                      fill="none"
                      stroke={sectorColor}
                      strokeWidth="1.5"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Motion / Alert Pulse */}
                  {isAlert ? (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  ) : isMoving ? (
                    <circle
                      r="16"
                      fill="none"
                      stroke={sectorColor}
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  ) : null}

                  {/* Marker Outer Shell */}
                  <circle
                    r={isSelected ? 14 : 11}
                    fill="#10141d"
                    stroke={isSelected ? '#ffffff' : isAlert ? '#ef4444' : sectorColor}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#glow)"
                  />

                  {/* Heading Arrow Pointer */}
                  <g transform={`rotate(${asset.headingDegrees || 0})`}>
                    <path
                      d="M 0,-14 L 3,-8 L -3,-8 Z"
                      fill={sectorColor}
                    />
                  </g>

                  {/* Center Dot with Sector Color */}
                  <circle
                    r="4"
                    fill={isAlert ? '#ef4444' : sectorColor}
                  />

                  {/* Asset Callout Pill */}
                  <g transform="translate(16, -6)">
                    <rect
                      x="0"
                      y="-10"
                      width={Math.max(100, asset.name.length * 5.8 + 40)}
                      height="22"
                      rx="6"
                      fill="#0e131d"
                      fillOpacity="0.88"
                      stroke={isSelected ? sectorColor : 'rgba(255,255,255,0.12)'}
                      strokeWidth="1"
                    />
                    <text
                      x="8"
                      y="5"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="700"
                      fontFamily="system-ui, sans-serif"
                    >
                      {asset.name.length > 16 ? asset.name.slice(0, 16) + '…' : asset.name}
                    </text>
                    <text
                      x={Math.max(100, asset.name.length * 5.8 + 40) - 8}
                      y="5"
                      textAnchor="end"
                      fill={isMoving ? '#22d3ee' : '#94a3b8'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {asset.speedKmh ? `${asset.speedKmh}k` : '0k'}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Asset Quick Diagnostics Float Bar */}
        {selectedAsset && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md p-3.5 rounded-xl bg-[#121622]/95 border border-white/15 backdrop-blur-xl shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="grid size-9 place-items-center rounded-xl border border-white/10"
                  style={{ backgroundColor: `${getSectorColor(selectedAsset.fieldSector)}20` }}
                >
                  {getSectorIcon(selectedAsset.fieldSector)}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>{selectedAsset.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-white/10 text-slate-300">
                      {selectedAsset.fieldSector}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {selectedAsset.location}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="mono text-xs font-bold text-cyan-400">
                  {selectedAsset.speedKmh || 0} km/h
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {selectedAsset.headingDegrees || 0}° HDG
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-white/[.03] border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Coords</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {selectedAsset.latitude?.toFixed(3)}°, {selectedAsset.longitude?.toFixed(3)}°
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[.03] border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Geofence</span>
                <span
                  className={`font-semibold capitalize ${
                    selectedAsset.geofenceStatus === 'breached'
                      ? 'text-rose-400 font-bold'
                      : selectedAsset.geofenceStatus === 'warning'
                      ? 'text-amber-400 font-bold'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedAsset.geofenceStatus || 'inside'}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-white/[.03] border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Custodian</span>
                <span className="text-slate-200 font-semibold truncate block">
                  {selectedAsset.assignedPersonnel || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Map Legend Overlay (Bottom Right) */}
        <div className="hidden sm:flex absolute bottom-4 right-4 flex-col gap-1.5 p-2.5 rounded-xl bg-[#121622]/90 border border-white/10 backdrop-blur-md text-[10px] text-slate-300 font-medium pointer-events-none">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Operational Fields
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span>Construction &amp; Heavy Field</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-cyan-500" />
            <span>Logistics &amp; Fleet Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span>Healthcare &amp; Mobile Medical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>IT &amp; Digital Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
