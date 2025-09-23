    import React from 'react';
    import PropTypes from 'prop-types';
    import { motion } from 'framer-motion';
    import { IoChevronBack, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
    import { FaRegClock } from 'react-icons/fa';
    import { MdOutlineSocialDistance } from 'react-icons/md';

    // Confirmation Step Component
    const ConfirmationStep = ({ 
    selectedCustomer,
    capturedImage,
    capturedLocation,
    distance,
    onPunchIn,
    onPrev,
    isLoading
    }) => {
    
    // Check if distance validation passes
    const isWithinRadius = distance?.isWithinRadius || false;
    const hasCustomerLocation = selectedCustomer?.latitude;
    const canPunchIn = !hasCustomerLocation || isWithinRadius; // Allow punch-in if no customer location set
    
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
            {hasCustomerLocation ? (
                <div className={`distance_summary ${isWithinRadius ? 'valid' : 'invalid'}`}>
                <div className="distance_info">
                    <MdOutlineSocialDistance className="distance_icon" />
                    <span className="distance_text">{distance?.formattedDistance || 'N/A'}</span>
                    {isWithinRadius ? (
                    <IoCheckmarkCircle className="status_icon valid" />
                    ) : (
                    <IoCloseCircle className="status_icon invalid" />
                    )}
                </div>
                <div className={`validation_message ${isWithinRadius ? 'valid' : 'invalid'}`}>
                    {isWithinRadius ? (
                    <span className="success_text">✓ Within 100m radius</span>
                    ) : (
                    <span className="error_text">⚠ Outside 100m radius - Cannot punch in</span>
                    )}
                </div>
                </div>
            ) : (
                <div className="distance_summary valid">
                <div className="distance_info">
                    <MdOutlineSocialDistance className="distance_icon" />
                    <span className="distance_text">No location configured</span>
                    <IoCheckmarkCircle className="status_icon valid" />
                </div>
                <div className="validation_message valid">
                    <span className="success_text">✓ Location validation not required</span>
                </div>
                </div>
            )}
            </div>
        </div>

        <div className="wizard_actions">
            <button className="wizard_btn secondary" onClick={onPrev}>
            <IoChevronBack /> Previous
            </button>
            <button 
            className={`wizard_btn ${canPunchIn ? 'success' : 'disabled'}`}
            onClick={onPunchIn}
            disabled={isLoading || !canPunchIn}
            title={!canPunchIn ? 'You must be within 100 meters to punch in' : ''}
            >
            {isLoading ? "Processing..." : <><FaRegClock /> Punch In</>}
            </button>
        </div>
        </motion.div>
    );
    };

    ConfirmationStep.propTypes = {
    selectedCustomer: PropTypes.object,
    capturedImage: PropTypes.object,
    capturedLocation: PropTypes.object,
    distance: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onPunchIn: PropTypes.func.isRequired,
    onPrev: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
    };

    export default ConfirmationStep;
