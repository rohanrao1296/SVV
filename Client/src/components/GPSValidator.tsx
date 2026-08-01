import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ShieldCheck, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { calculateDistanceMeters, getDeviceAndBrowserInfo, formatDistance } from '../utils/geoUtils';
import type { GeoLocationDetails } from '../types';

interface GPSValidatorProps {
  onValidationChange: (isValid: boolean, details: GeoLocationDetails | null) => void;
}

export const GPSValidator: React.FC<GPSValidatorProps> = ({ onValidationChange }) => {
  const { settings } = useAppData();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInside, setIsInside] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(true); // Default to simulated for testing

  const getRealLocation = () => {
    setIsValidating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsValidating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setIsValidating(false);
      },
      (err) => {
        console.error(err);
        setError(`Failed to retrieve GPS location: ${err.message}. Enabling testing simulation override.`);
        setIsSimulated(true);
        setIsValidating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Run validation on location changes
  useEffect(() => {
    if (isSimulated) {
      // Seed coordinates based on simulation choice
      // Inside School Campus
      setCoords({
        latitude: settings.campusLatitude + 0.0002, // ~20m off
        longitude: settings.campusLongitude - 0.0001,
        accuracy: 10
      });
      setError(null);
    } else {
      getRealLocation();
    }
  }, [isSimulated, settings]);

  useEffect(() => {
    if (!coords) {
      onValidationChange(false, null);
      return;
    }

    const dist = calculateDistanceMeters(
      coords.latitude,
      coords.longitude,
      settings.campusLatitude,
      settings.campusLongitude
    );
    
    setDistance(dist);
    const inside = dist <= settings.allowedRadiusMetres;
    setIsInside(inside);

    if (settings.gpsVerificationEnabled) {
      const device = getDeviceAndBrowserInfo();
      const details: GeoLocationDetails = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        verified: inside,
        verificationMethod: 'GPS',
        deviceTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        browser: device.browser,
        deviceName: device.deviceName
      };
      
      onValidationChange(inside, details);
    } else {
      // GPS verification is disabled by admin
      onValidationChange(true, null);
    }
  }, [coords, settings]);

  const toggleSimulationState = () => {
    if (isSimulated) {
      // Toggle to outside campus simulator coordinates
      setCoords({
        latitude: settings.campusLatitude + 0.085, // ~10km away
        longitude: settings.campusLongitude - 0.065,
        accuracy: 30
      });
      setIsSimulated(false); // Toggle simulator off -> triggers browser GPS or triggers outdoor mock
    } else {
      setIsSimulated(true);
    }
  };

  const forceSimulateOutside = () => {
    setCoords({
      latitude: settings.campusLatitude + 0.015, // ~2km away
      longitude: settings.campusLongitude - 0.015,
      accuracy: 25
    });
  };

  const forceSimulateInside = () => {
    setCoords({
      latitude: settings.campusLatitude + 0.0001, // ~10m away
      longitude: settings.campusLongitude - 0.0001,
      accuracy: 5
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-premium">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
            <Navigation size={18} className="text-primary animate-bounce" />
            GPS Verification
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Attendance requires location validation. School Radius: {settings.allowedRadiusMetres}m.
          </p>
        </div>
        
        {settings.gpsVerificationEnabled ? (
          <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Active Geofence
          </span>
        ) : (
          <span className="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Geofence Bypassed
          </span>
        )}
      </div>

      {/* Main Geofence Status UI */}
      <div className="flex items-center gap-4 p-4 rounded-xl mb-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <div className="relative flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isInside ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'}`}>
            <MapPin size={24} />
          </div>
          {isValidating && (
            <div className="absolute w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          )}
          {isInside && (
            <div className="absolute w-14 h-14 rounded-full border border-emerald-500 radar-pulse-ring"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className={`text-sm font-bold ${isInside ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isInside ? 'Inside School Campus' : 'Outside School Campus'}
            </h4>
            {isInside ? (
              <ShieldCheck size={16} className="text-emerald-500" />
            ) : (
              <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
            )}
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {distance !== null ? `Distance: ${formatDistance(distance)} from School Center` : 'Determining distance...'}
          </p>
          
          {coords && (
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono mt-0.5">
              Lat: {coords.latitude.toFixed(5)}, Lon: {coords.longitude.toFixed(5)} (Acc: {coords.accuracy.toFixed(1)}m)
            </p>
          )}
        </div>

        {!isSimulated && (
          <button 
            onClick={getRealLocation} 
            disabled={isValidating}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 btn-tap-effect disabled:opacity-50"
            title="Refresh Location"
          >
            <RefreshCw size={16} className={isValidating ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Simulator / Tester Controls */}
      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            Developer Simulator Controls
          </span>
          <button 
            onClick={toggleSimulationState}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-blue-400 hover:underline btn-tap-effect"
          >
            {isSimulated ? (
              <>
                Simulator Active
                <ToggleRight size={22} className="text-emerald-500" />
              </>
            ) : (
              <>
                Real GPS Active
                <ToggleLeft size={22} className="text-slate-400" />
              </>
            )}
          </button>
        </div>
        
        {isSimulated && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={forceSimulateInside}
              className={`text-xs py-2 px-3 rounded-lg border text-center font-medium transition-all ${isInside ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              Simulate Inside (20m)
            </button>
            <button
              onClick={forceSimulateOutside}
              className={`text-xs py-2 px-3 rounded-lg border text-center font-medium transition-all ${!isInside ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
            >
              Simulate Outside (2km)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default GPSValidator;
