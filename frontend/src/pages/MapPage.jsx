import React, { useEffect, useRef, useState } from 'react';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../utils/apiClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MAP_SCRIPT_ID = 'google-maps-api-script';

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const scriptLoadStarted = useRef(false);
  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/map/locations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load locations');
        return res.json();
      })
      .then((data) => {
        setLocations(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Failed to load locations');
        setLocations([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY) {
      setError('Google Maps API key is not set (VITE_GOOGLE_MAPS_API_KEY).');
      return;
    }
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    if (document.getElementById(MAP_SCRIPT_ID)) {
      return;
    }
    if (scriptLoadStarted.current) {
      return;
    }
    scriptLoadStarted.current = true;
    const script = document.createElement('script');
    script.id = MAP_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&loading=async&callback=window.__mapInit`;
    script.async = true;
    script.defer = true;
    window.__mapInit = () => setMapLoaded(true);
    script.onerror = () => {
      setMapError('Failed to load Google Maps script.');
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !window.google?.maps) return;
    setMapError('');

    try {
      const center = { lat: 44.0, lng: 20.9 };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 7,
        mapTypeControl: true,
        streetViewControl: false,
      });
      mapInstanceRef.current = map;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      locations.forEach((loc) => {
        const marker = new window.google.maps.Marker({
          position: { lat: loc.lat, lng: loc.lng },
          map,
          title: loc.name,
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding:8px;min-width:180px;"><strong>${escapeHtml(loc.name)}</strong><br/>${escapeHtml(loc.email)}<br/><em>${escapeHtml(loc.role)}</em></div>`,
        });
        marker.addListener('click', () => {
          markersRef.current.forEach((m) => infoWindow.close());
          infoWindow.open(map, marker);
        });
        markersRef.current.push(marker);
      });
    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.includes('ApiNotActivated') || msg.includes('NOT_FOUND') || msg.includes('InvalidKey')) {
        setMapError('Maps JavaScript API is not enabled or the key is invalid. In Google Cloud Console enable "Maps JavaScript API" and check API key restrictions and billing.');
      } else {
        setMapError(msg || 'Map failed to load.');
      }
    }
  }, [mapLoaded, locations]);

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return (
    <ProtectedLayout>
      <div className="page" style={{ padding: '1.5rem' }}>
        <h1>Map – Suppliers & Importers</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Locations of suppliers and importers (coordinates in Serbia). Run the SQL script to add coordinates to users.
        </p>
        {error && (
          <div style={{ color: '#721c24', marginBottom: '1rem', padding: '0.75rem', background: '#f8d7da', borderRadius: '6px' }}>
            {error}
          </div>
        )}
        {mapError && (
          <div style={{ color: '#721c24', marginBottom: '1rem', padding: '0.75rem', background: '#f8d7da', borderRadius: '6px' }}>
            {mapError}
          </div>
        )}
        {loading && <p>Loading locations…</p>}
        {!GOOGLE_MAPS_KEY && (
          <p style={{ color: '#856404' }}>Set VITE_GOOGLE_MAPS_API_KEY in .env to show the map.</p>
        )}
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '500px',
            borderRadius: '8px',
            background: '#e9ecef',
          }}
        />
      </div>
    </ProtectedLayout>
  );
}
