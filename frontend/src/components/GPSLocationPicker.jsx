import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationArrow, FaCheckCircle, FaSpinner, FaMapPin, FaCrosshairs, FaCheck } from 'react-icons/fa';

// Custom Pin Icon for Leaflet
const userPinIcon = L.divIcon({
  className: 'custom-gps-pin',
  html: `<div style="background: linear-gradient(135deg, #10b981, #0d9488); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 16px rgba(16,185,129,0.5); transform: translate(-50%, -50%);">
          <span style="font-size: 18px;">📍</span>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Map click & drag event handler
function LocationMarker({ position, setPosition, onReverseGeocode }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onReverseGeocode(e.latlng.lat, e.latlng.lng);
    }
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={userPinIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
          onReverseGeocode(pos.lat, pos.lng);
        }
      }}
    />
  );
}

// Controller to smoothly pan map when coordinates change
function RecenterMap({ position }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

const GPSLocationPicker = ({ onLocationSelected, initialAddress = null, onClose }) => {
  // Default coordinates (Inland Chennai / Anna Nagar)
  const defaultCoords = [13.0850, 80.2100];
  const [position, setPosition] = useState(defaultCoords);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  
  const [addressDetails, setAddressDetails] = useState({
    street: initialAddress?.street || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zipCode: initialAddress?.zipCode || '',
    landmark: ''
  });

  // Reverse Geocoding via Nominatim API with fallback
  const reverseGeocode = async (lat, lon) => {
    setIsGeocoding(true);
    setLocationStatus('Resolving street address...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.street || addr.pedestrian || addr.suburb || addr.neighbourhood || 'Doorstep Location';
          const suburb = addr.suburb || addr.city_district || '';
          const streetCombined = [road, suburb].filter(Boolean).join(', ');
          const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || 'Chennai';
          const state = addr.state || 'Tamil Nadu';
          const zipCode = addr.postcode || '600040';

          setAddressDetails(prev => ({
            ...prev,
            street: streetCombined || prev.street || 'GPS Doorstep Location',
            city,
            state,
            zipCode
          }));
          setLocationStatus('📍 Location detected accurately!');
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding network notice:', err);
      setLocationStatus('Pin placed. Enter house/flat number below.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Trigger GPS Geolocation
  const detectLiveGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setLocationStatus('Getting high-accuracy satellite GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newCoords = [lat, lng];
        setPosition(newCoords);
        setIsDetecting(false);
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsDetecting(false);
        console.warn('GPS location fallback:', err.message);
        setLocationStatus('Could not access GPS. Please tap on map to drop pin.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Auto detect GPS on initial modal open
  useEffect(() => {
    detectLiveGPS();
  }, []);

  const handleConfirmLocation = () => {
    if (!addressDetails.street.trim()) {
      setLocationStatus('Please provide a street or house address.');
      return;
    }
    onLocationSelected({
      street: addressDetails.street,
      city: addressDetails.city || 'Chennai',
      state: addressDetails.state || 'Tamil Nadu',
      zipCode: addressDetails.zipCode || '600001',
      landmark: addressDetails.landmark || '',
      coordinates: {
        lat: position[0],
        lng: position[1]
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base border border-emerald-500/30">
            <FaCrosshairs className="animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Live GPS Pin Drop Location</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Satellite GPS
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Tap or drag the marker on the map to pinpoint your exact doorstep.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={detectLiveGPS}
          disabled={isDetecting}
          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
        >
          {isDetecting ? (
            <>
              <FaSpinner className="animate-spin h-3.5 w-3.5" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <FaLocationArrow className="h-3 w-3" />
              <span>Use Current GPS</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Leaflet Map View */}
      <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner z-0">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onReverseGeocode={reverseGeocode}
          />
          <RecenterMap position={position} />
        </MapContainer>

        {/* Floating Instruction Chip */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-white text-[10px] font-mono flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="truncate">{locationStatus || 'Drag marker or tap map to adjust location'}</span>
          </span>
          <span className="font-bold text-emerald-400 flex-shrink-0 ml-2">
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </span>
        </div>
      </div>

      {/* Form Input Auto-Filled Address Fields */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Door / Flat No & Street Address *
            </label>
            <input
              type="text"
              value={addressDetails.street}
              onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
              placeholder="e.g. Flat 302, Green Meadows Apartment, MG Road"
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Landmark / Delivery Notes
            </label>
            <input
              type="text"
              value={addressDetails.landmark}
              onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
              placeholder="e.g. Near Apollo Pharmacy / 3rd Floor"
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              City
            </label>
            <input
              type="text"
              value={addressDetails.city}
              onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
              placeholder="City"
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              State
            </label>
            <input
              type="text"
              value={addressDetails.state}
              onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })}
              placeholder="State"
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              PIN Code
            </label>
            <input
              type="text"
              value={addressDetails.zipCode}
              onChange={(e) => setAddressDetails({ ...addressDetails, zipCode: e.target.value })}
              placeholder="PIN Code"
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirmLocation}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
        >
          <FaCheck className="h-3 w-3" />
          <span>Confirm This GPS Location</span>
        </button>
      </div>
    </div>
  );
};

export default GPSLocationPicker;
