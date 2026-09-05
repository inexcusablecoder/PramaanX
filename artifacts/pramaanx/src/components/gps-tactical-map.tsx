import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  Map as MapIcon,
  Globe,
  Navigation,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import type { Asset } from '@workspace/api-client-react';

interface GpsTacticalMapProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: Asset) => void;
  sectorFilter?: string;
  onPingAsset?: (id: string) => void;
}

type MapLayerType = 'dark' | 'street' | 'satellite';

interface LayerConfig {
  name: string;
  baseUrl: string;
  overlayUrl?: string;
  attribution: string;
  maxZoom: number;
}

const TILE_LAYERS: Record<MapLayerType, LayerConfig> = {
  dark: {
    name: 'Tactical Dark',
    baseUrl: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 16,
  },
  street: {
    name: 'Street Map',
    baseUrl: 'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
  satellite: {
    name: 'Satellite View',
    baseUrl: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping',
    maxZoom: 18,
  },
};

export function GpsTacticalMap({
  assets,
  selectedAssetId,
  onSelectAsset,
  sectorFilter = 'all',
}: GpsTacticalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileBaseRef = useRef<L.TileLayer | null>(null);
  const tileOverlayRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const geofencesLayerRef = useRef<L.LayerGroup | null>(null);
  const trailsLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayerType, setActiveLayerType] = useState<MapLayerType>('dark');
  const [showGeofences, setShowGeofences] = useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  const filteredAssets = useMemo(() => {
    if (!sectorFilter || sectorFilter === 'all') return assets;
    return assets.filter((a) => (a.fieldSector || '').toLowerCase() === sectorFilter.toLowerCase());
  }, [assets, sectorFilter]);

  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  // Sector Color Helper
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

  // Switch Tile Layer Helper
  const switchTiles = (mapInstance: L.Map, layerType: MapLayerType) => {
    const layerConfig = TILE_LAYERS[layerType];

    // Remove old layers
    if (tileBaseRef.current) {
      mapInstance.removeLayer(tileBaseRef.current);
      tileBaseRef.current = null;
    }
    if (tileOverlayRef.current) {
      mapInstance.removeLayer(tileOverlayRef.current);
      tileOverlayRef.current = null;
    }

    // Add Base Layer
    const baseLayer = L.tileLayer(layerConfig.baseUrl, {
      maxZoom: layerConfig.maxZoom,
      attribution: layerConfig.attribution,
    }).addTo(mapInstance);
    baseLayer.bringToBack();
    tileBaseRef.current = baseLayer;

    // Add Reference / Place Names Overlay if defined
    if (layerConfig.overlayUrl) {
      const overlayLayer = L.tileLayer(layerConfig.overlayUrl, {
        maxZoom: layerConfig.maxZoom,
      }).addTo(mapInstance);
      overlayLayer.bringToBack();
      baseLayer.bringToBack();
      tileOverlayRef.current = overlayLayer;
    }
  };

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center on Central/West India (Mumbai-Pune-Delhi transit corridor)
    const initialCenter: [number, number] = [19.076, 72.8777];
    const initialZoom = 6;

    const mapInstance = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Add Initial Tile Layers
    switchTiles(mapInstance, activeLayerType);

    // Add Vector Layer Groups
    geofencesLayerRef.current = L.layerGroup().addTo(mapInstance);
    trailsLayerRef.current = L.layerGroup().addTo(mapInstance);
    markersLayerRef.current = L.layerGroup().addTo(mapInstance);

    mapRef.current = mapInstance;
    setIsMapReady(true);

    // Invalidate size once container renders
    const timer = setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when user switches style
  useEffect(() => {
    if (!mapRef.current) return;
    switchTiles(mapRef.current, activeLayerType);
  }, [activeLayerType]);

  // Update Markers, Geofences, and Trails
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !geofencesLayerRef.current || !trailsLayerRef.current) return;

    // Clear previous layers
    markersLayerRef.current.clearLayers();
    geofencesLayerRef.current.clearLayers();
    trailsLayerRef.current.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    filteredAssets.forEach((asset) => {
      if (typeof asset.latitude !== 'number' || typeof asset.longitude !== 'number') return;

      const latLng: [number, number] = [asset.latitude, asset.longitude];
      bounds.push(latLng);

      const isSelected = asset.id === selectedAssetId;
      const sectorColor = getSectorColor(asset.fieldSector);
      const isBreached = asset.geofenceStatus === 'breached';
      const isWarning = asset.geofenceStatus === 'warning';
      const isAlert = asset.custodyStatus === 'attention' || isBreached || isWarning;
      const isMoving = (asset.speedKmh || 0) > 0;

      // 1. Geofence Perimeter Circle
      if (showGeofences) {
        const radiusMeters = asset.geofenceRadiusMeters || 2500;
        const strokeColor = isBreached ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

        const circle = L.circle(latLng, {
          radius: radiusMeters,
          color: strokeColor,
          weight: isSelected ? 2.5 : 1.5,
          opacity: 0.8,
          fillColor: strokeColor,
          fillOpacity: isBreached ? 0.22 : 0.07,
          dashArray: '5, 5',
        });
        geofencesLayerRef.current?.addLayer(circle);
      }

      // 2. Historical Breadcrumb Trails
      if (showBreadcrumbs) {
        let crumbs: Array<{ lat: number; lng: number }> = [];
        try {
          crumbs =
            typeof asset.telemetryBreadcrumbs === 'string'
              ? JSON.parse(asset.telemetryBreadcrumbs)
              : asset.telemetryBreadcrumbs || [];
        } catch {
          crumbs = [];
        }

        if (crumbs.length >= 2) {
          const latLngTrail: [number, number][] = crumbs.map((c) => [c.lat, c.lng]);

          const polyline = L.polyline(latLngTrail, {
            color: sectorColor,
            weight: 3,
            opacity: 0.7,
            dashArray: '6, 6',
          });
          trailsLayerRef.current?.addLayer(polyline);

          // Tiny waypoint markers
          crumbs.forEach((crumb) => {
            const waypoint = L.circleMarker([crumb.lat, crumb.lng], {
              radius: 3,
              fillColor: sectorColor,
              fillOpacity: 0.8,
              color: '#ffffff',
              weight: 1,
            });
            trailsLayerRef.current?.addLayer(waypoint);
          });
        }
      }

      // 3. Custom HTML DivIcon Marker
      const customIcon = L.divIcon({
        className: 'custom-asset-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; cursor: pointer; transform: translate(-14px, -14px);">
            ${
              isSelected
                ? `<div style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; background-color: ${sectorColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -7px; left: -7px;"></div>`
                : ''
            }
            ${
              isAlert
                ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; border: 2px solid #ef4444; opacity: 0.6; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; top: -4px; left: -4px;"></div>`
                : ''
            }
            <!-- Node Center -->
            <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #0c1017; border: 2.5px solid ${
              isSelected ? '#ffffff' : isAlert ? '#ef4444' : sectorColor
            }; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
              <div style="width: 10px; height: 10px; border-radius: 9999px; background-color: ${
                isAlert ? '#ef4444' : sectorColor
              };"></div>
            </div>

            <!-- Heading Pointer -->
            <div style="position: absolute; top: -5px; left: 10px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 7px solid ${sectorColor}; transform: rotate(${
              asset.headingDegrees || 0
            }deg); transform-origin: center bottom;"></div>

            <!-- Callout Tag -->
            <div style="margin-left: 8px; padding: 2px 7px; border-radius: 6px; background-color: rgba(12, 16, 23, 0.92); border: 1px solid ${
              isSelected ? sectorColor : 'rgba(255,255,255,0.18)'
            }; color: #ffffff; font-size: 10.5px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 5px; backdrop-filter: blur(4px);">
              <span>${asset.name.length > 17 ? asset.name.slice(0, 17) + '…' : asset.name}</span>
              <span style="font-family: monospace; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: bold; color: ${
                isMoving ? '#22d3ee' : '#94a3b8'
              }; background-color: ${isMoving ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.06)'};">
                ${asset.speedKmh ? `${asset.speedKmh}k` : '0k'}
              </span>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      // Click Event
      marker.on('click', () => {
        onSelectAsset(asset);
      });

      // Tooltip Hover Popup
      marker.bindTooltip(
        `
        <div style="font-family: system-ui, sans-serif; font-size: 11px;">
          <div style="font-weight: bold; color: #fff; display: flex; align-items: center; gap: 6px;">
            <span>${asset.name}</span>
            <span style="font-size: 9px; padding: 1px 5px; border-radius: 4px; background: rgba(255,255,255,0.1); text-transform: uppercase;">${asset.fieldSector}</span>
          </div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${asset.location || 'In Transit'}</div>
          <div style="display: flex; gap: 8px; margin-top: 4px; font-family: monospace; font-size: 9.5px;">
            <span style="color: #22d3ee;">${asset.speedKmh || 0} km/h</span>
            <span style="color: #cbd5e1;">${asset.headingDegrees || 0}° HDG</span>
            <span style="color: ${isBreached ? '#f43f5e' : '#10b981'}; font-weight: bold;">${asset.geofenceStatus || 'inside'}</span>
          </div>
        </div>
      `,
        {
          direction: 'top',
          offset: [0, -16],
          className: 'pramaanx-custom-tooltip',
        }
      );

      markersLayerRef.current?.addLayer(marker);
    });

    // Auto-center or fit bounds on initial ready or filter change
    if (bounds.length > 0 && mapRef.current) {
      if (selectedAsset && typeof selectedAsset.latitude === 'number' && typeof selectedAsset.longitude === 'number') {
        mapRef.current.flyTo([selectedAsset.latitude, selectedAsset.longitude], 10, {
          duration: 0.8,
        });
      } else if (!selectedAssetId) {
        mapRef.current.fitBounds(L.latLngBounds(bounds), {
          padding: [45, 45],
          maxZoom: 9,
        });
      }
    }
  }, [filteredAssets, selectedAssetId, showGeofences, showBreadcrumbs, isMapReady]);

  // Handler to center on all assets
  const handleFitAll = () => {
    if (!mapRef.current) return;
    const validCoords: [number, number][] = filteredAssets
      .filter((a) => typeof a.latitude === 'number' && typeof a.longitude === 'number')
      .map((a) => [a.latitude!, a.longitude!]);

    if (validCoords.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(validCoords), {
        padding: [50, 50],
        maxZoom: 9,
      });
    }
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#0b0e14] overflow-hidden shadow-2xl select-none">
      {/* HUD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#0b0e14]/90 border-b border-white/10 backdrop-blur-md z-20 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              NavIC / GPS Tactical Radar &amp; Geospatial Map
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 border-l border-white/10 pl-3">
            {filteredAssets.length} Active Beacons
          </span>
        </div>

        {/* Map Layer Switcher & Tactical Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Layer Selector */}
          <div className="flex items-center bg-white/[.05] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setActiveLayerType('dark')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                activeLayerType === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Esri Tactical Dark Map"
            >
              <Crosshair className="size-3" />
              Tactical Dark
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerType('street')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                activeLayerType === 'street'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Esri World Street Map"
            >
              <MapIcon className="size-3" />
              Streets
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerType('satellite')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                activeLayerType === 'satellite'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Esri World Satellite Imagery"
            >
              <Globe className="size-3" />
              Satellite
            </button>
          </div>

          {/* Geofence Toggle */}
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

          {/* Trails Toggle */}
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

          {/* Zoom & Fit Controls */}
          <div className="flex items-center bg-white/[.05] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitAll}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Fit All Assets in View"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Leaflet Map Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] bg-[#07090e] z-10 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Asset Quick Diagnostics Float Bar */}
        {selectedAsset && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md p-3.5 rounded-xl bg-[#121622]/95 border border-white/15 backdrop-blur-xl shadow-2xl z-[1000] animate-in fade-in slide-in-from-bottom-3 duration-200">
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
                    {selectedAsset.location || 'In Transit'}
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

            <div className="mt-2.5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onSelectAsset(selectedAsset)}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Open Telemetry Inspector</span>
                <ExternalLink className="size-3" />
              </button>
            </div>
          </div>
        )}

        {/* Map Legend Overlay (Bottom Right) */}
        <div className="hidden sm:flex absolute bottom-4 right-4 flex-col gap-1.5 p-2.5 rounded-xl bg-[#121622]/90 border border-white/10 backdrop-blur-md text-[10px] text-slate-300 font-medium pointer-events-none z-[1000]">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Operational Fields
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-500" />
            <span>Construction &amp; Heavy Machinery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-cyan-500" />
            <span>Logistics &amp; Cold-Chain Fleet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-500" />
            <span>Healthcare &amp; Emergency Medical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span>IT Nodes &amp; Smart Infrastructure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
