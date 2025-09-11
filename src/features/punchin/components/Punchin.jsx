import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PropTypes from 'prop-types';
import "../styles/punchin.scss";

// Components
import ConfirmModal from "../../../components/ui/Modal/ConfirmModal";
import AddLocation from "./AddLocation";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CamModal from "./CamModal";

// Icons
import {
  IoMdArrowDropdown,
  IoMdArrowDropup,
} from "react-icons/io";
import {
  IoCameraReverse,
  IoCloseCircle,
  IoRefreshCircle,
  IoLocation,
  IoSearchSharp,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import {
  MdOutlineCameraAlt,
  MdOutlineNotListedLocation,
  MdOutlineSocialDistance,
  MdNotListedLocation,
} from "react-icons/md";
import { LuCamera, LuSquarePen } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegClock, FaCheck } from "react-icons/fa";

// Utils & Hooks
import { addAccuracyCircle, initHybridMap, setViewAndMarker } from "../../../utils/mapHelpers";
import { getCurrentPosition, useCamera, useDebounce } from "../../../hooks";
import { distanceKm } from "../../../utils/geoDis";
import { PunchAPI } from "../services/punchService";
import { logger } from "../../../utils/logger";
import { validateCustomer, validateImage, validateLocation } from "../../../utils/validators";

// Constants
const WIZARD_STEPS = Object.freeze({
  CUSTOMER_SELECTION: 1,
  PHOTO_CAPTURE: 2,
  LOCATION_CAPTURE: 3,
  CONFIRMATION: 4
});

const STEP_TITLES = Object.freeze({
  [WIZARD_STEPS.CUSTOMER_SELECTION]: "Select Customer",
  [WIZARD_STEPS.PHOTO_CAPTURE]: "Take Photo",
  [WIZARD_STEPS.LOCATION_CAPTURE]: "Capture Location",
  [WIZARD_STEPS.CONFIRMATION]: "Confirm Punch In"
});

const ANIMATION_VARIANTS = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const DEBOUNCE_DELAY = 300;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Custom Hooks
const useCustomerCache = () => {
  const getCachedCustomers = useCallback(() => {
    try {
      const cached = sessionStorage.getItem('customers_cache');
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      return isExpired ? null : data;
    } catch (error) {
      logger.error('Failed to parse cached customers:', error);
      sessionStorage.removeItem('customers_cache');
      return null;
    }
  }, []);

  const setCachedCustomers = useCallback((customers) => {
    try {
      const cacheData = {
        data: customers,
        timestamp: Date.now()
      };
      sessionStorage.setItem('customers_cache', JSON.stringify(cacheData));
    } catch (error) {
      logger.error('Failed to cache customers:', error);
    }
  }, []);

  return { getCachedCustomers, setCachedCustomers };
};
const useLocationMap = (selectedCustomer, capturedImage) => {
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [distance, setDistance] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
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
        setViewAndMarker(mapRef.current, markerRef, newLoc.latitude, newLoc.longitude, 19);
        addAccuracyCircle(mapRef.current, newLoc.latitude, newLoc.longitude, pos.coords.accuracy);
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
          getLocation();
        } catch (error) {
          logger.error('Failed to initialize map:', error);
          setLocationError('Failed to initialize map');
        }
      }
    }, 100); // Small delay to prevent rapid re-initialization
  }, [selectedCustomer?.latitude, selectedCustomer?.longitude, capturedImage, getLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (mapRef.current) {
        try {
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

// Memoized Step Progress Component
const StepProgress = memo(({ currentStep, totalSteps }) => {
  const progressPercentage = useMemo(() => 
    ((currentStep - 1) / (totalSteps - 1)) * 100
  , [currentStep, totalSteps]);

  return (
    <div className="wizard_progress" role="progressbar" aria-valuenow={currentStep} aria-valuemax={totalSteps}>
      <div className="step_indicators">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div 
              key={stepNumber} 
              className={`step_indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="step_circle">
                {isCompleted ? <FaCheck aria-label="Completed" /> : stepNumber}
              </div>
              <div className="step_label">{STEP_TITLES[stepNumber]}</div>
            </div>
          );
        })}
      </div>
      <div className="progress_bar">
        <div 
          className="progress_fill" 
          style={{ width: `${progressPercentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
});

StepProgress.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired
};

StepProgress.displayName = 'StepProgress';

// Memoized Customer Selection Step with Performance Optimizations
const CustomerSelectionStep = memo(({ 
  customers, 
  selectedCustomer, 
  setSelectedCustomer, 
  onNext,
  isLoading,
  error 
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  // Memoized filtered customers with virtual scrolling support
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return customers;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return customers.filter((customer) => {
      const name = (customer.name || customer.customerName || customer.firm_name || "").toLowerCase();
      return name.includes(searchLower);
    });
  }, [customers, debouncedSearchTerm]);

  // Limit displayed customers for performance (virtual scrolling concept)
  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, 50); // Show max 50 customers at once
  }, [filteredCustomers]);

  const hasMoreCustomers = filteredCustomers.length > displayedCustomers.length;

  const handleCustomerSelect = useCallback((customer) => {
    // Immediate UI feedback
    setDropdownOpen(false);
    setSearchTerm("");
    
    // Debounce the actual selection to prevent lag
    requestAnimationFrame(() => {
      const validation = validateCustomer(customer);
      if (!validation.isValid) {
        logger.warn('Invalid customer selected:', validation.errors);
        return;
      }

      setSelectedCustomer(customer);
      logger.info('Customer selected:', { customerId: customer.id, customerName: customer.name || customer.firm_name });
    });
  }, [setSelectedCustomer]);

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  }, []);

  // Memoize the customer name display
  const selectedCustomerName = useMemo(() => {
    return selectedCustomer?.name || selectedCustomer?.customerName || selectedCustomer?.firm_name || "Select a customer";
  }, [selectedCustomer]);

  const canProceed = useMemo(() => {
    return selectedCustomer && selectedCustomer.latitude && selectedCustomer.longitude;
  }, [selectedCustomer]);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className="wizard_step customer_selection_step"
    >
      <h2>Select Customer</h2>
      
      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <div className="form-field">
        <label htmlFor="customer-dropdown" className="form-label">
          Customer *
        </label>
        <div 
          id="customer-dropdown"
          className="drop_button" 
          onClick={handleDropdownToggle}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          tabIndex={0}
        >
          {selectedCustomerName}
          <span className="dropdown-icon" aria-hidden="true">
            {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

        {dropdownOpen && (
          <div className="dropdownOpen" role="listbox">
            <div className="input_section">
              <span className="search_icon" aria-hidden="true">
                <IoSearchSharp />
              </span>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoFocus
                aria-label="Search customers"
              />
            </div>

            <div className="customer-list">
              {isLoading ? (
                <div className="loading-state">
                  <LoadingSpinner size="small" />
                  <span>Loading customers...</span>
                </div>
              ) : displayedCustomers.length > 0 ? (
                <>
                  {displayedCustomers.map((customer) => (
                    <CustomerItem
                      key={customer.id}
                      customer={customer}
                      onSelect={handleCustomerSelect}
                    />
                  ))}
                  {hasMoreCustomers && (
                    <div className="more-customers-info">
                      Showing {displayedCustomers.length} of {filteredCustomers.length} customers
                      {searchTerm && (
                        <small>Try searching to narrow results</small>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-customers">
                  {searchTerm ? 'No matching customers found' : 'No customers available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && !selectedCustomer.latitude && (
        <div className="location-warning">
          <AddLocation customer={selectedCustomer} />
        </div>
      )}

      <div className="wizard_actions">
        <button 
          className="wizard_btn primary" 
          onClick={onNext}
          disabled={!canProceed || isLoading}
          aria-describedby={!canProceed ? "customer-help" : undefined}
        >
          Next <IoChevronForward aria-hidden="true" />
        </button>
        {!canProceed && (
          <div id="customer-help" className="help-text">
            Please select a customer with location data to continue
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Memoized Customer Item Component for better performance
const CustomerItem = memo(({ customer, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(customer);
  }, [customer, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(customer);
    }
  }, [customer, onSelect]);

  const customerName = useMemo(() => {
    return customer.firm_name || customer.customerName || "Unnamed Customer";
  }, [customer]);

  const hasLocation = useMemo(() => {
    return Boolean(customer.latitude);
  }, [customer.latitude]);

  return (
    <div
      className="customer"
      onClick={handleClick}
      role="option"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className="customer-name">
        {customerName}
      </span>
      <div className="list_icons" aria-label={hasLocation ? "Location available" : "Location not available"}>
        {hasLocation ? (
          <IoLocation style={{ color: "#0bb838" }} />
        ) : (
          <MdNotListedLocation style={{ color: "red" }} />
        )}
      </div>
    </div>
  );
});

CustomerItem.propTypes = {
  customer: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

CustomerSelectionStep.propTypes = {
  customers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    customerName: PropTypes.string,
    firm_name: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number
  })).isRequired,
  selectedCustomer: PropTypes.object,
  setSelectedCustomer: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

CustomerSelectionStep.displayName = 'CustomerSelectionStep';

// Photo Capture Step
const PhotoCaptureStep = ({ 
  capturedImage,
  setCapturedImage,
  showCamera,
  setShowCamera,
  facingMode,
  setFacingMode,
  videoRef,
  capturePhoto,
  onNext,
  onPrev
}) => {
  const handleDiscardImage = useCallback(() => {
    if (capturedImage?.url) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
  }, [capturedImage, setCapturedImage]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="wizard_step photo_capture_step"
    >
      <h2>Take Photo</h2>
      
      {!capturedImage ? (
        <div className="photo_section">
          <div className="photo_label">Image :</div>
          <div className="take_button" onClick={() => setShowCamera(true)}>
            <MdOutlineCameraAlt className="icon" /> Take a Photo
          </div>
        </div>
      ) : (
        <div className="preview_section">
          <div className="photo_container">
            <img src={capturedImage.url} alt="Captured" />
          </div>

          <div className="photo_actions">
            <button className="discard" onClick={handleDiscardImage}>
              <RiDeleteBinLine className="icon" /> Discard
            </button>
            <button className="retake" onClick={() => setShowCamera(true)}>
              <LuSquarePen className="icon" /> Retake
            </button>
          </div>
        </div>
      )}

      <div className="wizard_actions">
        <button className="wizard_btn secondary" onClick={onPrev}>
          <IoChevronBack /> Previous
        </button>
        {capturedImage && (
          <button className="wizard_btn primary" onClick={onNext}>
            Next <IoChevronForward />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Location Capture Step
const LocationCaptureStep = ({ 
  selectedCustomer,
  capturedLocation,
  distance,
  mapContainerRef,
  getLocation,
  onNext,
  onPrev
}) => {
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
            <div className="your_location">
              <MdOutlineNotListedLocation className="icon" /> Your Location
            </div>
            <div className="fetch_btn" onClick={getLocation}>
              <IoRefreshCircle />
            </div>
          </div>

          <div
            className="location_map"
            ref={mapContainerRef}
            style={{ height: "300px", width: "100%" }}
          />

          <div className="km_container">
            <div className="mdOutline">
              <MdOutlineSocialDistance className="icon" /> Distance from shop
            </div>
            <div className="km_span">{distance} Km</div>
          </div>
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

// Confirmation Step
const ConfirmationStep = ({ 
  selectedCustomer,
  capturedImage,
  capturedLocation,
  distance,
  onPunchIn,
  onPrev,
  isLoading
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="wizard_step confirmation_step"
    >
      <h2>Confirm Punch In</h2>
      
      <div className="confirmation_summary">
        <div className="summary_item">
          <h4>Customer:</h4>
          <p>{selectedCustomer?.firm_name || selectedCustomer?.customerName || selectedCustomer?.name}</p>
        </div>
        
        <div className="summary_item">
          <h4>Photo:</h4>
          <div className="photo_thumbnail">
            <img src={capturedImage?.url} alt="Captured" />
          </div>
        </div>
        
        <div className="summary_item">
          <h4>Distance from store:</h4>
          <p>{distance} Km</p>
        </div>
      </div>

      <div className="wizard_actions">
        <button className="wizard_btn secondary" onClick={onPrev}>
          <IoChevronBack /> Previous
        </button>
        <button 
          className="wizard_btn success" 
          onClick={onPunchIn}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : <><FaRegClock /> Punch In</>}
        </button>
      </div>
    </motion.div>
  );
};

const Punchin = () => {
  const [currentStep, setCurrentStep] = useState(WIZARD_STEPS.CUSTOMER_SELECTION);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  // Debounced customer selection to prevent immediate heavy operations
  const debouncedSelectedCustomer = useDebounce(selectedCustomer, 150);

  const {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    videoRef,
    capturePhoto,
  } = useCamera(facingMode);

  const {
    capturedLocation,
    distance,
    mapContainerRef,
    getLocation,
  } = useLocationMap(debouncedSelectedCustomer, capturedImage);

  // Memoized customer cache
  const { getCachedCustomers, setCachedCustomers } = useCustomerCache();

  // Fetch customers on component mount with caching
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError(null);
      
      try {
        // Check cache first
        const cached = getCachedCustomers();
        if (cached) {
          setCustomers(cached);
          setCustomersLoading(false);
          return;
        }

        const response = await PunchAPI.getFirms();
        const customerData = response.firms || [];
        setCustomers(customerData);
        setCachedCustomers(customerData);
        
        logger.info('Customers fetched successfully', { count: customerData.length });
      } catch (err) {
        const errorMessage = 'Failed to fetch customers. Please try again.';
        setCustomersError(errorMessage);
        logger.error('Failed to fetch customers:', err);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomers();
  }, [getCachedCustomers, setCachedCustomers]);

  const handleNext = useCallback(() => {
    if (currentStep < Object.keys(WIZARD_STEPS).length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handlePunchIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await PunchAPI.punchIn({
        customerId: debouncedSelectedCustomer?.id,
        image: capturedImage?.file,
        location: capturedLocation,
      });
      alert("Punched in successfully!");
      // Reset wizard to first step
      setCurrentStep(WIZARD_STEPS.CUSTOMER_SELECTION);
      setSelectedCustomer(null);
      setCapturedImage(null);
      logger.info('Punch-in completed successfully');
    } catch (err) {
      console.error(err);
      alert("Punch in failed!");
      logger.error('Punch-in failed:', err);
    } finally {
      setIsLoading(false);
      setOpenConfirmPunchIn(false);
    }
  }, [debouncedSelectedCustomer, capturedImage, capturedLocation, setCapturedImage]);

  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case WIZARD_STEPS.CUSTOMER_SELECTION:
        return (
          <CustomerSelectionStep
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            onNext={handleNext}
            isLoading={customersLoading}
            error={customersError}
          />
        );
      case WIZARD_STEPS.PHOTO_CAPTURE:
        return (
          <PhotoCaptureStep
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            showCamera={showCamera}
            setShowCamera={setShowCamera}
            facingMode={facingMode}
            setFacingMode={setFacingMode}
            videoRef={videoRef}
            capturePhoto={capturePhoto}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case WIZARD_STEPS.LOCATION_CAPTURE:
        return (
          <LocationCaptureStep
            selectedCustomer={selectedCustomer}
            capturedLocation={capturedLocation}
            distance={distance}
            mapContainerRef={mapContainerRef}
            getLocation={getLocation}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case WIZARD_STEPS.CONFIRMATION:
        return (
          <ConfirmationStep
            selectedCustomer={selectedCustomer}
            capturedImage={capturedImage}
            capturedLocation={capturedLocation}
            distance={distance}
            onPunchIn={handlePunchIn}
            onPrev={handlePrev}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    handleNext,
    customersLoading,
    customersError,
    capturedImage,
    setCapturedImage,
    showCamera,
    setShowCamera,
    facingMode,
    setFacingMode,
    videoRef,
    capturePhoto,
    handlePrev,
    capturedLocation,
    distance,
    mapContainerRef,
    getLocation,
    handlePunchIn,
    isLoading
  ]);

  return (
    <div className="punchin_wizard">
      <StepProgress 
        currentStep={currentStep} 
        totalSteps={Object.keys(WIZARD_STEPS).length} 
      />
      
      <div className="wizard_container">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>

      <CamModal
        showCamera={showCamera}
        setShowCamera={setShowCamera}
        facingMode={facingMode}
        setFacingMode={setFacingMode}
        videoRef={videoRef}
        capturePhoto={capturePhoto}
      />

      <ConfirmModal
        isOpen={openConfirmPunchIn}
        title="Confirm Punch In"
        message="Are you sure you want to punch in?"
        onConfirm={handlePunchIn}
        onCancel={() => setOpenConfirmPunchIn(false)}
        loading={isLoading}
      />
    </div>
  );
};

export default Punchin; 