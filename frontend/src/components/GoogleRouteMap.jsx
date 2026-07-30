import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker as GoogleMarker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTruck, FaClock, FaRoute, FaLocationArrow } from 'react-icons/fa';

// Fix Leaflet default marker icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Leaflet Icons
const driverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: `<div style="background:#10b981; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 4px 14px rgba(16,185,129,0.5);">
          <span style="font-size:16px;">🚛</span>
         </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const citizenIcon = L.divIcon({
  className: 'custom-citizen-icon',
  html: `<div style="background:#f43f5e; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 4px 12px rgba(244,63,94,0.5);">
          <span style="font-size:14px;">📍</span>
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const defaultCenter = { lat: 13.0850, lng: 80.2100 }; // Anna Nagar / Koyambedu inland Chennai

// Helper for inland Chennai coordinates
const getPickupCoords = (p, idx, basePos) => {
  const addressStr = ((p.pickupAddress?.street || '') + ' ' + (p.pickupAddress?.city || '') + ' ' + (p.address || '')).toLowerCase();
  
  if (addressStr.includes('anna nagar')) return { lat: 13.0850, lng: 80.2100 };
  if (addressStr.includes('adyar')) return { lat: 13.0067, lng: 80.2570 };
  if (addressStr.includes('velachery')) return { lat: 12.9780, lng: 80.2180 };
  if (addressStr.includes('t.nagar') || addressStr.includes('t nagar')) return { lat: 13.0418, lng: 80.2341 };
  if (addressStr.includes('vadapalani')) return { lat: 13.0500, lng: 80.2120 };
  if (addressStr.includes('guindy')) return { lat: 13.0067, lng: 80.2020 };
  if (addressStr.includes('nungambakkam')) return { lat: 13.0600, lng: 80.2400 };
  
  // Safe inland offset (moves West/Southwest into the city, never into Bay of Bengal)
  const latOffset = (idx % 2 === 0 ? -0.008 : 0.006) * (idx + 1);
  const lngOffset = -0.012 * (idx + 1);
  return {
    lat: basePos.lat + latOffset,
    lng: basePos.lng + lngOffset
  };
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
];

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
};

// Component to dynamically re-center Leaflet map
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
};

const GoogleRouteMap = ({
  driverName = 'Driver',
  vehicleNumber = '',
  pickups = [],
  driverLocation = null,
  userLocation = null,
  onLocationUpdate = null,
  isLiveTracking = true,
  height = '320px'
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
    preventGoogleFontsLoading: false
  });

  const [currentPos, setCurrentPos] = useState(driverLocation || defaultCenter);
  const [userPos, setUserPos] = useState(userLocation || null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Watch device live GPS position
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentPos(newCoords);
        if (onLocationUpdate) {
          onLocationUpdate(newCoords);
        }
      },
      (err) => {
        console.warn('Geolocation notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  // Sync external driver location updates
  useEffect(() => {
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      setCurrentPos(driverLocation);
    }
  }, [driverLocation]);

  // Sync external user location updates
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      setUserPos(userLocation);
    }
  }, [userLocation]);

  // Google Maps directions service calculation
  useEffect(() => {
    if (!apiKey || !isLoaded || !window.google || !currentPos) return;

    const directionsService = new window.google.maps.DirectionsService();
    let destCoords = userPos || null;

    if (pickups && pickups.length > 0) {
      const valid = pickups.filter(p => p.pickupAddress);
      if (valid.length > 0) {
        const last = valid[valid.length - 1];
        destCoords = `${last.pickupAddress.street}, ${last.pickupAddress.city}`;
      }
    }

    if (!destCoords) return;

    directionsService.route(
      {
        origin: currentPos,
        destination: destCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          if (result.routes[0]?.legs[0]) {
            const leg = result.routes[0].legs[0];
            setDistance(leg.distance?.text || '');
            setDuration(leg.duration?.text || '');
          }
        }
      }
    );
  }, [apiKey, isLoaded, currentPos, userPos, pickups]);

  // Inland route coordinates for Leaflet map display
  const leafletPolyline = [
    [currentPos.lat, currentPos.lng],
    ...(pickups.length > 0
      ? pickups.map((p, idx) => {
          const coords = getPickupCoords(p, idx, currentPos);
          return [coords.lat, coords.lng];
        })
      : userPos
      ? [[userPos.lat, userPos.lng]]
      : [[currentPos.lat - 0.012, currentPos.lng - 0.015]])
  ];

  // IF GOOGLE MAPS API KEY IS NOT PROVIDED -> RENDER REAL INTERACTIVE OPENSTREETMAP LEAFLET MAP
  if (!apiKey) {
    return (
      <div className="space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-white">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-extrabold text-emerald-400">Live GPS OpenStreetMap Active</span>
            {driverName && <span className="text-slate-400">({driverName})</span>}
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black">
            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700">
              Live GPS Tracking
            </span>
          </div>
        </div>

        {/* Leaflet OpenStreetMap Container */}
        <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-xl z-0" style={{ height }}>
          <MapContainer
            center={[currentPos.lat, currentPos.lng]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <ChangeView center={currentPos} />
            {/* Dark CartoDB Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {/* Driver Live Marker */}
            <LeafletMarker position={[currentPos.lat, currentPos.lng]} icon={driverIcon}>
              <Popup>
                <div className="text-slate-900 text-xs font-bold p-1">
                  🚛 Driver: {driverName} ({vehicleNumber})
                  <br />
                  <span className="text-[10px] text-slate-500 font-mono">
                    Lat: {currentPos.lat.toFixed(4)}, Lng: {currentPos.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </LeafletMarker>

            {/* Pickups / Destination Markers */}
            {pickups.map((p, idx) => {
              const coords = getPickupCoords(p, idx, currentPos);
              return (
                <LeafletMarker key={p._id || idx} position={[coords.lat, coords.lng]} icon={citizenIcon}>
                  <Popup>
                    <div className="text-slate-900 text-xs p-1">
                      <strong className="block text-emerald-700">{p.user?.name || `Pickup #${idx + 1}`}</strong>
                      <span>Category: {p.wasteCategory} ({p.estimatedWeight}kg)</span>
                    </div>
                  </Popup>
                </LeafletMarker>
              );
            })}

            {/* Route Polyline */}
            <Polyline positions={leafletPolyline} color="#10b981" weight={4} dashArray="6,8" />
          </MapContainer>
        </div>
      </div>
    );
  }

  // IF GOOGLE MAPS API KEY IS AVAILABLE -> RENDER GOOGLE MAPS JS SDK
  if (loadError) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white text-center space-y-2" style={{ minHeight: height }}>
        <p className="text-xs text-rose-400 font-bold">Google Maps API Error</p>
        <p className="text-[11px] text-slate-400">{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col items-center justify-center space-y-3" style={{ minHeight: height }}>
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-bold">Loading Google Maps GPS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Live Route Summary Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-white">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-extrabold text-emerald-400">Google Maps GPS Routing</span>
          {driverName && <span className="text-slate-400">({driverName})</span>}
        </div>
        {(distance || duration) && (
          <div className="flex items-center space-x-3 text-[11px] font-black">
            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700">
              Dist: {distance}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center space-x-1">
              <FaClock className="h-3 w-3" />
              <span>ETA: {duration}</span>
            </span>
          </div>
        )}
      </div>

      {/* Google Map Canvas */}
      <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-xl z-0" style={{ height }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPos}
          zoom={14}
          options={{
            styles: darkMapStyle,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false
          }}
        >
          {currentPos && (
            <GoogleMarker
              position={currentPos}
              title={`Driver: ${driverName}`}
              onClick={() => setSelectedMarker({ type: 'driver', name: driverName, vehicle: vehicleNumber })}
              icon={{
                url: 'https://maps.google.com/mapfiles/kml/shapes/truck.png',
                scaledSize: new window.google.maps.Size(32, 32)
              }}
            />
          )}

          {userPos && (
            <GoogleMarker
              position={userPos}
              title="Pickup Destination"
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
            />
          )}

          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: '#10b981',
                  strokeWeight: 5,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default GoogleRouteMap;
