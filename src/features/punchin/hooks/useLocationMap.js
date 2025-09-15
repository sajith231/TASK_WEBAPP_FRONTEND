import { useState, useRef, useCallback, useEffect } from 'react';
import { getCurrentPosition } from '../../../hooks';
import { distanceKm } from '../../../utils/geoDis';
import { addAccuracyCircle, initHybridMap, setViewAndMarker } from '../../../utils/mapHelpers';
import { logger } from '../../../utils/logger';

// Simple location map hook - only shows user location
const useLocationMap = (targetLocation = null) => {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Get user's current location
  const getLocation = useCallback(async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);
    setLocationError(null);

    try {
      const pos = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000
      });

      const newLoc = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: Date.now()
      };

      setUserLocation(newLoc);

      // Update map if it exists - show user location only
      if (mapRef.current?._map) {
        setViewAndMarker(mapRef.current._map, markerRef, newLoc.latitude, newLoc.longitude, 19);
        addAccuracyCircle(mapRef.current._map, newLoc.latitude, newLoc.longitude, pos.coords.accuracy);
      }
      
      logger.info('Location captured successfully', { location: newLoc });
    } catch (err) {
      const errorMessage = err.message || 'Failed to get current location';
      setLocationError(errorMessage);
      logger.error('Error fetching location:', err);
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  // Initialize map - simple default view
  const initializeMap = useCallback(() => {
    if (mapRef.current && !mapRef.current._map) {
      try {
        // Always start with default location (no customer markers)
        const map = initHybridMap(mapRef.current, {
          center: [51.505, -0.09], // Default center
          zoom: 13,
        });

        mapRef.current._map = map;
        logger.info('Map initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize map:', error);
        setLocationError('Failed to initialize map');
      }
    }
  }, []);

  // Calculate distance only if target location exists
  useEffect(() => {
    if (targetLocation?.latitude && userLocation?.latitude) {
      try {
        const dist = distanceKm(
          targetLocation.latitude,
          targetLocation.longitude,
          userLocation.latitude,
          userLocation.longitude
        );
        setDistance(dist);
      } catch (error) {
        logger.error('Error calculating distance:', error);
        setDistance('N/A');
      }
    } else {
      setDistance("");
    }
  }, [targetLocation?.latitude, targetLocation?.longitude, userLocation?.latitude, userLocation?.longitude]);

  // Auto-initialize map
  useEffect(() => {
    const timer = setTimeout(initializeMap, 100);
    return () => {
      clearTimeout(timer);
      if (mapRef.current?._map) {
        try {
          mapRef.current._map.remove();
          mapRef.current._map = null;
        } catch (error) {
          logger.warn('Error cleaning up map:', error);
        }
      }
    };
  }, [initializeMap]);

  return {
    // For PunchIn compatibility
    punchInLocation: userLocation,
    // For AddLocation compatibility  
    userLocation,
    distance,
    locationError,
    isGettingLocation,
    mapRef,
    getLocation,
    initializeMap,
  };
};

export default useLocationMap;