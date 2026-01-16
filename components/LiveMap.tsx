
import React, { useEffect, useRef } from 'react';
import { LocationData } from '../types';
// Fix: Added missing import for MapPin icon used in the loading overlay
import { MapPin } from 'lucide-react';

// Declare L as global since we load it via script tag
declare const L: any;

interface LiveMapProps {
  location: LocationData | null;
  targetName: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ location, targetName }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const mapContainerId = "map-container";

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerId, { zoomControl: false }).setView([0, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB'
      }).addTo(mapRef.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      const pos = [location.lat, location.lng];
      
      if (!markerRef.current) {
        markerRef.current = L.marker(pos).addTo(mapRef.current)
          .bindPopup(`<b>${targetName}</b><br>Sedang di sini sayang.`)
          .openPopup();
        circleRef.current = L.circle(pos, { 
          radius: location.accuracy,
          color: '#e11d48',
          fillColor: '#fb7185',
          fillOpacity: 0.2
        }).addTo(mapRef.current);
        mapRef.current.setView(pos, 16);
      } else {
        markerRef.current.setLatLng(pos);
        circleRef.current.setLatLng(pos).setRadius(location.accuracy);
        mapRef.current.panTo(pos);
      }
    }
  }, [location, targetName]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-900">
      <div id={mapContainerId} className="w-full h-full" />
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-[1000]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-rose-600 w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-rose-900/50">
                <MapPin className="text-white w-10 h-10" />
              </div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Mencari Koordinat Mey...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
