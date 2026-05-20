'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix webpack mangling Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const cafeIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -36],
  shadowSize: [32, 32],
});

const selectedIcon = new L.DivIcon({
  html: `<div style="
    width: 40px; height: 40px;
    background: #14422D;
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 16px rgba(20,66,45,0.55);
  "></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
  className: '',
});

function makeUserDotIcon(locating: boolean) {
  return new L.DivIcon({
    html: `<div style="
      width: 16px; height: 16px;
      background: ${locating ? '#6b8cff' : '#1350E0'};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 5px rgba(19,80,224,0.20);
      transition: background 0.3s;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',
  });
}

/** Smoothly re-center the map when `center` prop changes */
function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    // Only fly if center actually changed (avoids flying on every render)
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, map.getZoom(), { duration: 1 });
      prevCenter.current = center;
    }
  }, [center, map]);
  return null;
}

/**
 * Flies to the user's GPS dot when it changes (e.g. after "locate me").
 * Skips the very first render so the map doesn't double-fly on load.
 */
function FlyToUserPosition({ position }: { position: [number, number] }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (prevPos.current === null) {
      prevPos.current = position;
      return; // skip initial render
    }
    if (prevPos.current[0] !== position[0] || prevPos.current[1] !== position[1]) {
      map.flyTo(position, 15, { duration: 1 });
      prevPos.current = position;
    }
  }, [position, map]);
  return null;
}

/** Zoom to selected cafe at zoom-17 */
function FlyToCafe({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!position) return;
    if (
      prevPos.current &&
      prevPos.current[0] === position[0] &&
      prevPos.current[1] === position[1]
    ) return;
    map.flyTo(position, 17, { duration: 0.9 });
    prevPos.current = position;
  }, [position, map]);
  return null;
}

/**
 * Draws a driving route from OSRM on the map.
 * Shows a straight dashed line immediately as placeholder, then upgrades to the
 * real road-following route when OSRM responds. Falls back to the dashed line on error.
 */
function RoutePolyline({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [roadPositions, setRoadPositions] = useState<[number, number][] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRoadPositions(null);

    const controllers = [
      'https://router.project-osrm.org',
      'https://routing.openstreetmap.de/routed-car',
    ];

    const tryFetch = async () => {
      for (const base of controllers) {
        try {
          const url = `${base}/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
          const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
          const data = await r.json();
          if (cancelled) return;
          const coords = data.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
          if (coords?.length) {
            setRoadPositions(coords.map(([lng, lat]) => [lat, lng]));
            return;
          }
        } catch {
          // try next server
        }
      }
    };

    tryFetch();
    return () => { cancelled = true; };
  }, [from[0], from[1], to[0], to[1]]);

  return (
    <>
      {/* Always show a straight dashed line as immediate fallback */}
      {!roadPositions && (
        <Polyline
          positions={[from, to]}
          pathOptions={{ color: '#1350E0', weight: 3, opacity: 0.55, dashArray: '10 7' }}
        />
      )}
      {/* Upgrade to real road-following route when OSRM responds */}
      {roadPositions && (
        <Polyline
          positions={roadPositions}
          pathOptions={{ color: '#1350E0', weight: 5, opacity: 0.8 }}
        />
      )}
    </>
  );
}

const LOCATE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
  fill="none" stroke="#14422D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="8"/>
  <circle cx="12" cy="12" r="3" fill="#14422D" stroke="none"/>
  <line x1="12" y1="2"  x2="12" y2="5"/>
  <line x1="12" y1="19" x2="12" y2="22"/>
  <line x1="2"  y1="12" x2="5"  y2="12"/>
  <line x1="19" y1="12" x2="22" y2="12"/>
</svg>`;

const LOCATE_SVG_SPIN = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
  fill="none" stroke="#14422D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  style="animation:leaflet-spin 1s linear infinite">
  <circle cx="12" cy="12" r="9" stroke-dasharray="40" stroke-dashoffset="15"/>
</svg>
<style>@keyframes leaflet-spin{to{transform:rotate(360deg)}}</style>`;

/**
 * "Go to my location" Leaflet control.
 * Uses a ref so the callback is always fresh even though the effect runs once.
 */
function LocateControl({ onLocate }: { onLocate?: (pos: [number, number]) => void }) {
  const map = useMap();
  const onLocateRef = useRef(onLocate);
  useEffect(() => { onLocateRef.current = onLocate; }, [onLocate]);

  useEffect(() => {
    const btn = L.DomUtil.create('a') as HTMLAnchorElement;
    btn.href = '#';
    btn.title = '現在地へ移動';
    btn.setAttribute('role', 'button');
    btn.innerHTML = LOCATE_SVG;
    Object.assign(btn.style, {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '34px', height: '34px', background: 'white',
      cursor: 'pointer', borderRadius: '2px', textDecoration: 'none',
    });

    L.DomEvent.on(btn, 'click', (e) => {
      L.DomEvent.preventDefault(e);
      L.DomEvent.stopPropagation(e);
      if (!navigator.geolocation) return;

      btn.innerHTML = LOCATE_SVG_SPIN;
      btn.style.opacity = '0.7';

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          map.flyTo(position, 15, { duration: 1 });
          onLocateRef.current?.(position);
          btn.innerHTML = LOCATE_SVG;
          btn.style.opacity = '1';
        },
        () => { btn.innerHTML = LOCATE_SVG; btn.style.opacity = '1'; },
        { timeout: 8000 },
      );
    });

    const LocateControlClass = L.Control.extend({
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.appendChild(btn);
        return container;
      },
    });

    const ctrl = new LocateControlClass({ position: 'bottomright' });
    ctrl.addTo(map);
    return () => { ctrl.remove(); };
  }, [map]);

  return null;
}

/** Zooms the map to fit [userPos, cafePos] when `trigger` increments */
function FitRouteBounds({ from, to, trigger }: { from: [number, number]; to: [number, number]; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (!trigger) return;
    map.fitBounds([from, to], { padding: [60, 60], maxZoom: 16, animate: true });
  }, [trigger]);
  return null;
}

export interface CafeMapItem {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  rating?: number | string;
  address?: string;
  avatar?: string;
}

interface CafeMapProps {
  cafes: CafeMapItem[];
  center: [number, number];
  /** Actual GPS position for the blue dot — can differ from center after "locate me" */
  userPosition?: [number, number];
  radius?: number;
  onSelectCafe?: (id: string | number) => void;
  selectedId?: string | number | null;
  onLocate?: (pos: [number, number]) => void;
  /** Increment to trigger fitBounds on the route */
  fitRouteTrigger?: number;
  /** Only draw the route when true (triggered by 経路 button) */
  showRoute?: boolean;
}

/** Radius of the blue circle drawn around the selected cafe (metres) */
const SELECTED_CAFE_RADIUS_M = 250;

export default function CafeMap({
  cafes, center, userPosition, radius, onSelectCafe, selectedId, onLocate, fitRouteTrigger = 0, showRoute = false,
}: CafeMapProps) {
  const radiusMeters = (radius ?? 10) * 1000;
  const dotPosition = userPosition ?? center;

  const selectedCafe = cafes.find((c) => c.id === selectedId);
  const selectedPosition: [number, number] | null =
    selectedCafe ? [selectedCafe.latitude, selectedCafe.longitude] : null;

  return (
    <MapContainer
      center={center}
      zoom={14}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* LocateControl before ZoomControl → appears below +/- in bottomright stack */}
      <LocateControl onLocate={onLocate} />
      <ZoomControl position="bottomright" />

      <FlyToCenter center={center} />
      <FlyToUserPosition position={dotPosition} />
      <FlyToCafe position={selectedPosition} />

      {/* Search radius circle around USER position — hidden when radius is 0 (e.g. keyword search) */}
      {radiusMeters > 0 && (
        <Circle
          center={dotPosition}
          radius={radiusMeters}
          pathOptions={{
            color: '#14422D', fillColor: '#14422D',
            fillOpacity: 0.06, weight: 1.5, dashArray: '6 4',
          }}
        />
      )}

      {/* Blue area circle around SELECTED cafe */}
      {selectedCafe && (
        <Circle
          center={[selectedCafe.latitude, selectedCafe.longitude]}
          radius={SELECTED_CAFE_RADIUS_M}
          pathOptions={{
            color: '#135899',
            fillColor: '#135899',
            fillOpacity: 0.20,
            weight: 2,
          }}
        />
      )}

      {/* Driving route — only shown after clicking 経路 button */}
      {showRoute && selectedPosition && (
        <>
          <RoutePolyline from={dotPosition} to={selectedPosition} />
          <FitRouteBounds from={dotPosition} to={selectedPosition} trigger={fitRouteTrigger} />
        </>
      )}

      {/* User location dot — moves when "locate me" is pressed */}
      <Marker position={dotPosition} icon={makeUserDotIcon(false)}>
        <Popup>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#1350E0' }}>
            現在地
          </span>
        </Popup>
      </Marker>

      {/* Cafe markers */}
      {cafes.map((cafe) => {
        if (!cafe.latitude || !cafe.longitude) return null;
        const isSelected = selectedId === cafe.id;
        return (
          <Marker
            key={cafe.id}
            position={[cafe.latitude, cafe.longitude]}
            icon={isSelected ? selectedIcon : cafeIcon}
            eventHandlers={{ click: () => onSelectCafe?.(cafe.id) }}
          >
            {!isSelected && (
              <Popup>
                <div style={{ fontFamily: 'Manrope, sans-serif', minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#14422D', marginBottom: 2 }}>
                    {cafe.name}
                  </div>
                  {cafe.rating !== undefined && (
                    <div style={{ fontSize: 11, color: '#904C18', fontWeight: 600 }}>
                      ★ {cafe.rating}
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
