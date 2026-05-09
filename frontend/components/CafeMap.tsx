'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap } from 'react-leaflet';
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

function makeSelectedIcon() {
  return new L.DivIcon({
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
}

const userDotIcon = new L.DivIcon({
  html: `<div style="
    width: 16px; height: 16px;
    background: #1350E0;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 5px rgba(19,80,224,0.20);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
});

/** Smoothly re-center the map when `center` prop changes */
function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
}

/** Zoom into a selected cafe's position */
function FlyToCafe({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 0.9 });
    }
  }, [position, map]);
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
  radius?: number;
  onSelectCafe?: (id: string | number) => void;
  selectedId?: string | number | null;
}

export default function CafeMap({ cafes, center, radius, onSelectCafe, selectedId }: CafeMapProps) {
  const radiusMeters = (radius ?? 10) * 1000;

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

      {/* Zoom controls – bottom right so they don't overlap info */}
      <ZoomControl position="bottomright" />

      <FlyToCenter center={center} />
      <FlyToCafe position={selectedPosition} />

      {/* Search radius circle */}
      <Circle
        center={center}
        radius={radiusMeters}
        pathOptions={{
          color: '#14422D',
          fillColor: '#14422D',
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: '6 4',
        }}
      />

      {/* User location dot */}
      <Marker position={center} icon={userDotIcon}>
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
            icon={isSelected ? makeSelectedIcon() : cafeIcon}
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
