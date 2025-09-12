    import React from 'react';
    import PropTypes from 'prop-types';
    import { motion } from 'framer-motion';
    import { IoChevronBack } from 'react-icons/io5';
    import { FaRegClock } from 'react-icons/fa';

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

    ConfirmationStep.propTypes = {
    selectedCustomer: PropTypes.object,
    capturedImage: PropTypes.object,
    capturedLocation: PropTypes.object,
    distance: PropTypes.string,
    onPunchIn: PropTypes.func.isRequired,
    onPrev: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
    };

    export default ConfirmationStep;
