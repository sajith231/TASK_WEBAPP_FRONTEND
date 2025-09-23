import React, { Suspense, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import "../styles/PunchinCapture.scss";

// Components
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { PunchAPI } from "../services/punchService";

// Lazy load components for better performance
const Punchin = React.lazy(() => import("../components/Punchin"));
const PunchOutScreen = React.lazy(() => import("../components/PunchOutScreen"));

/**
 * Smart PunchInCapture component that checks for active punch-ins
 * and shows appropriate screen (wizard or punch-out)
 * Enforces 100-meter radius restriction for punch-ins
 */
const PunchInCapture = () => {
  // State management
  const [activePunchIn, setActivePunchIn] = useState(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for active punch-in on component mount
  useEffect(() => {
    checkActivePunchIn();
  }, []);

  /**
   * Check if user has an active punch-in session
   * Uses hybrid approach: localStorage + API verification
   */
  const checkActivePunchIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check localStorage first for immediate feedback
      const stored = localStorage.getItem('activePunchIn');
      let localData = null;
      
      if (stored) {
        try {
          localData = JSON.parse(stored);
        } catch (e) {
          localStorage.removeItem('activePunchIn');
        }
      }

      // Verify with backend (source of truth)
      try {
        const response = await PunchAPI.getActivePunchIns();
        
        if (response.success && response.data && response.data.length > 0) {
          const activePunch = response.data.find(punch => 
            punch.status === 'pending' || punch.status === 'Punching' || !punch.punchout_time
          );
          
          if (activePunch) {
            // Update localStorage with fresh data
            localStorage.setItem('activePunchIn', JSON.stringify(activePunch));
            setActivePunchIn(activePunch);
            setIsPunchedIn(true);
            return;
          }
        }
        
        // No active punch-in found, clear localStorage
        if (localData) {
          localStorage.removeItem('activePunchIn');
        }
        setActivePunchIn(null);
        setIsPunchedIn(false);
        
      } catch (apiError) {
        console.warn('API verification failed, using localStorage:', apiError);
        
        // Fallback to localStorage if API fails
        if (localData) {
          setActivePunchIn(localData);
          setIsPunchedIn(true);
          toast.info('Working offline - showing last known status');
        } else {
          setActivePunchIn(null);
          setIsPunchedIn(false);
        }
      }
      
    } catch (error) {
      console.error('Failed to check punch-in status:', error);
      setError('Failed to load punch-in status. Please check your connection.');
      
      // Emergency fallback: check localStorage directly
      const stored = localStorage.getItem('activePunchIn');
      if (stored) {
        try {
          const punchData = JSON.parse(stored);
          setActivePunchIn(punchData);
          setIsPunchedIn(true);
          toast.warning('Working offline - showing cached data');
        } catch (parseError) {
          localStorage.removeItem('activePunchIn');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle punch-out action
   */
  const handlePunchOut = async () => {
    try {
      if (activePunchIn?.id) {
        await PunchAPI.punchOut(activePunchIn.id);
        toast.success('Successfully punched out!');
      }
      
      // Clear state and localStorage
      setActivePunchIn(null);
      setIsPunchedIn(false);
      localStorage.removeItem('activePunchIn');
      
    } catch (error) {
      console.error('Punch out failed:', error);
      toast.error('Failed to punch out. Please try again.');
      throw error; // Re-throw for PunchOutScreen to handle
    }
  };

  /**
   * Handle successful punch-in from wizard
   * This is called after punch-in validation passes (including 100m radius check)
   */
  const handlePunchIn = async (punchData) => {
    try {
      // The punch-in already happened in the wizard, just update our state
      await checkActivePunchIn(); // Refresh state from backend
      toast.success('Successfully punched in!');
    } catch (error) {
      console.error('Post punch-in state update failed:', error);
      // Don't show error toast as punch-in was successful
    }
  };

  // Loading state - checking punch-in status
  if (loading) {
    return (
      <div className="all-body">
        <div className="punchin-capture-page">
          <div className="loading-container">
            <LoadingSpinner size="large" />
            <p>Checking your punch-in status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry and continue options
  if (error && !isPunchedIn) {
    return (
      <div className="all-body">
        <div className="punchin-capture-page">
          <div className="error-fallback">
            <h2>Unable to verify punch-in status</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                onClick={checkActivePunchIn} 
                className="retry-btn"
              >
                Try Again
              </button>
              <button 
                onClick={() => {
                  setError(null);
                  setIsPunchedIn(false);
                  setLoading(false);
                }} 
                className="continue-btn"
              >
                Continue to Punch-In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback components for ErrorBoundary and Suspense
  const fallbackComponent = (
    <div className="error-fallback">
      <h2>Unable to load punch-in system</h2>
      <p>Please refresh the page and try again.</p>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );

  const loadingComponent = (
    <div className="loading-container">
      <LoadingSpinner size="large" />
      <p>Loading punch-in system...</p>
    </div>
  );

  return (
    <div className="all-body">
      <div className="punchin-capture-page">
        <ErrorBoundary fallback={fallbackComponent}>
          <Suspense fallback={loadingComponent}>
            {isPunchedIn ? (
              <PunchOutScreen 
                activePunchIn={activePunchIn}
                onPunchOut={handlePunchOut}
                onRefresh={checkActivePunchIn}
              />
            ) : (
              <Punchin onPunchIn={handlePunchIn} />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PunchInCapture;
