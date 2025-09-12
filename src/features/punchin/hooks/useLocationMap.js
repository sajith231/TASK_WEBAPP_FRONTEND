import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { getCurrentPosition } from '../../../hooks';
import { distanceKm } from '../../../utils/geoDis';
import { addAccuracyCircle, initHybridMap, setViewAndMarker } from '../../../utils/mapHelpers';
import { logger } from '../../../utils/logger';

// Custom hook for location mapping functionality
const useLocationMap = (selectedCustomer, capturedImage) => {
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [distance, setDistance] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const mapContainerRef = useRef(null);
  const initializationTimeoutRef = useRef(null);

  const getLocation = useCallback(async () => {
    if (isGettingLocation) return;
    
    setIsGettingLocation(true);
    setLocationError(null);
    
    try {
      const pos = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
      
      const newLoc = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: Date.now()
      };
      
      setCapturedLocation(newLoc);

      if (mapRef.current) {
        // Remove existing accuracy circle if it exists
        if (accuracyCircleRef.current) {
          try {
            mapRef.current.removeLayer(accuracyCircleRef.current);
            accuracyCircleRef.current = null;
          } catch (error) {
            logger.warn('Error removing accuracy circle:', error);
          }
        }

        // Set marker and view
        setViewAndMarker(mapRef.current, markerRef, newLoc.latitude, newLoc.longitude, 19);
        
        // Add accuracy circle with a small delay to ensure map is ready
        setTimeout(() => {
          if (mapRef.current) {
            try {
              accuracyCircleRef.current = addAccuracyCircle(
                mapRef.current, 
                newLoc.latitude, 
                newLoc.longitude, 
                pos.coords.accuracy
              );
              logger.info('Accuracy circle added', { 
                accuracy: pos.coords.accuracy, 
                circleAdded: !!accuracyCircleRef.current 
              });
            } catch (error) {
              logger.error('Error adding accuracy circle:', error);
            }
          }
        }, 100);
      }
      
      logger.info('Location captured successfully', { location: newLoc });
    } catch (err) {
      const errorMessage = err.message || 'Failed to get current location';
      setLocationError(errorMessage);
      logger.error('Error fetching location:', err);
    } finally {
      setIsGettingLocation(false);
    }
  }, [isGettingLocation]);

  // Debounced map initialization to prevent lag
  const initializeMap = useCallback(() => {
    if (initializationTimeoutRef.current) {
      clearTimeout(initializationTimeoutRef.current);
    }

    initializationTimeoutRef.current = setTimeout(() => {
      if (mapContainerRef.current && !mapRef.current && selectedCustomer?.latitude && capturedImage) {
        try {
          mapRef.current = initHybridMap(mapContainerRef.current, {
            center: [selectedCustomer.latitude, selectedCustomer.longitude],
            zoom: 18,
          });
          
          // Wait for map to be ready before fetching location
          if (mapRef.current) {
            mapRef.current.whenReady(() => {
              console.log('Map ready, now fetching location');
              if (!capturedLocation && !isGettingLocation) {
                getLocation();
              }
            });
          }
        } catch (error) {
          logger.error('Failed to initialize map:', error);
          setLocationError('Failed to initialize map');
        }
      }
    }, 100); // Small delay to prevent rapid re-initialization
  }, [selectedCustomer?.latitude, selectedCustomer?.longitude, capturedImage, getLocation, capturedLocation, isGettingLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (mapRef.current) {
        try {
          // Clean up marker and accuracy circle references
          markerRef.current = null;
          accuracyCircleRef.current = null;
          
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          logger.warn('Error cleaning up map:', error);
        }
      }
    };
  }, [initializeMap]);

  // Memoized distance calculation
  const calculatedDistance = useMemo(() => {
    if (selectedCustomer?.latitude && capturedLocation?.latitude) {
      try {
        return distanceKm(
          selectedCustomer.latitude,
          selectedCustomer.longitude,
          capturedLocation.latitude,
          capturedLocation.longitude
        );
      } catch (error) {
        logger.error('Error calculating distance:', error);
        return 'N/A';
      }
    }
    return "";
  }, [selectedCustomer?.latitude, selectedCustomer?.longitude, capturedLocation?.latitude, capturedLocation?.longitude]);

  useEffect(() => {
    setDistance(calculatedDistance);
  }, [calculatedDistance]);

  return {
    capturedLocation,
    distance,
    locationError,
    isGettingLocation,
    mapContainerRef,
    getLocation,
  };
};

export default useLocationMap;
