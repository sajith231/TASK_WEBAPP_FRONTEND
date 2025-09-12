import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { IoChevronBack, IoChevronForward, IoRefreshCircle, IoLocation } from 'react-icons/io5';
import { MdOutlineNotListedLocation, MdOutlineSocialDistance, MdNotListedLocation } from 'react-icons/md';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

// Location Capture Step Component
const LocationCaptureStep = ({ 
  selectedCustomer,
  capturedLocation,
  distance,
  mapContainerRef,
  getLocation,
  isGettingLocation,
  locationError,
  onNext,
  onPrev
}) => {
  // Auto-fetch location when component mounts
  useEffect(() => {
    if (!capturedLocation && !isGettingLocation && !locationError) {
      getLocation();
    }
  }, [capturedLocation, isGettingLocation, locationError, getLocation]);

  const getLocationStatusText = () => {
    if (isGettingLocation) return "Fetching...";
    if (locationError) return "Location Failed";
    if (capturedLocation) return "Your Location";
    return "Get Location";
  };

  const getLocationIcon = () => {
    if (locationError) return <MdNotListedLocation className="icon error" />;
    return <MdOutlineNotListedLocation className="icon" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="wizard_step location_capture_step"
    >
      <h2>Capture Location</h2>
      
      <div className="capture_location">
        <div className="location_container">
          <div className="location_header">
            <div className={`your_location ${isGettingLocation ? 'loading' : ''} ${locationError ? 'error' : ''}`}>
              {getLocationIcon()} {getLocationStatusText()}
            </div>
            <button 
              className={`fetch_btn ${isGettingLocation ? 'loading' : ''}`}
              onClick={getLocation}
              disabled={isGettingLocation}
              title={isGettingLocation ? "Getting location..." : "Refresh location"}
            >
              <IoRefreshCircle className={isGettingLocation ? 'rotating' : ''} />
            </button>
          </div>

          <div className="location_map_wrapper">
            {/* Show placeholder only when no location AND not loading AND has error */}
            {!capturedLocation && !isGettingLocation && locationError && (
              <div className="location_placeholder">
                <div className="placeholder_content">
                  <IoLocation className="placeholder_icon" />
                  <p className="placeholder_text">Unable to get your location</p>
                  <button className="retry_btn" onClick={getLocation}>
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {/* Map container - always present but conditionally visible */}
            <div
              className={`location_map ${!capturedLocation && !isGettingLocation ? 'hidden' : ''}`}
              ref={mapContainerRef}
            />

            {/* Loading overlay - only when getting location */}
            {isGettingLocation && (
              <div className="location_loading_overlay">
                <LoadingSpinner size="medium" />
                <p>Getting your current location...</p>
              </div>
            )}
          </div>

          <div className="km_container">
            <div className="mdOutline">
              <MdOutlineSocialDistance className="icon" /> Distance from shop
            </div>
            <div className="km_span">
              {distance ? `${distance} Km` : (isGettingLocation ? "Calculating..." : "N/A")}
            </div>
          </div>

          {locationError && !isGettingLocation && (
            <div className="error_message">
              <p>⚠️ {locationError}</p>
              <p className="error_help">Please check your location permissions and try again.</p>
            </div>
          )}
        </div>
      </div>

      <div className="wizard_actions">
        <button className="wizard_btn secondary" onClick={onPrev}>
          <IoChevronBack /> Previous
        </button>
        {capturedLocation && (
          <button className="wizard_btn primary" onClick={onNext}>
            Next <IoChevronForward />
          </button>
        )}
      </div>
    </motion.div>
  );
};

LocationCaptureStep.propTypes = {
  selectedCustomer: PropTypes.object,
  capturedLocation: PropTypes.object,
  distance: PropTypes.string,
  mapContainerRef: PropTypes.object.isRequired,
  getLocation: PropTypes.func.isRequired,
  isGettingLocation: PropTypes.bool.isRequired,
  locationError: PropTypes.string,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired
};

export default LocationCaptureStep;
