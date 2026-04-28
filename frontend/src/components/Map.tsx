"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in leaflet with nextjs
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// A custom icon for the vehicle (red marker)
const vehicleIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapUpdater({ vehiclePosition }) {
    const map = useMap();
    useEffect(() => {
        if (vehiclePosition) {
            map.flyTo([vehiclePosition.lat, vehiclePosition.lng], map.getZoom(), { animate: true, duration: 1 });
        }
    }, [vehiclePosition, map]);
    return null;
}

export default function TrackerMap({ route, vehicleState, origin, destination }) {
  if (!route || route.length === 0) return <div className="h-full w-full bg-gray-900 animate-pulse rounded-lg border border-gray-800 flex items-center justify-center">Loading Map...</div>;

  const positions = route.map(point => [point.lat, point.lng]);
  const currentPos = vehicleState?.position ? [vehicleState.position.lat, vehicleState.position.lng] : positions[0];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-800 shadow-xl z-0">
        <MapContainer center={currentPos} zoom={8} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles"
            />
            {/* Origin & Destination */}
            {origin && <Marker position={[origin.lat, origin.lng]} icon={icon}><Popup>Origin</Popup></Marker>}
            {destination && <Marker position={[destination.lat, destination.lng]} icon={icon}><Popup>Destination</Popup></Marker>}
            
            {/* The Path */}
            <Polyline positions={positions} pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.7 }} />

            {/* The Vehicle */}
            {vehicleState?.position && (
                <Marker position={currentPos} icon={vehicleIcon}>
                    <Popup>
                        <strong>Vehicle</strong><br/>
                        Speed: {vehicleState.speed} mph<br/>
                        Temp: {vehicleState.temperature} °F
                    </Popup>
                </Marker>
            )}

            {/* Auto Follow Vehicle */}
            <MapUpdater vehiclePosition={vehicleState?.position} />
        </MapContainer>
    </div>
  );
}
