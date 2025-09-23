import React, { Suspense, useEffect, useState } from "react";
import "../styles/PunchinCapture.scss";

// Components
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { PunchAPI } from "../services/punchService";
import PunchOutScreen from "../components/PunchOutScreen";

// Lazy load the Punchin component for better performance
const Punchin = React.lazy(() => import("../components/Punchin"));

/**
 * Production-ready PunchInCapture page component
 * Handles error boundaries and loading states
 */
const PunchInCapture = () => {
  const [activePunchIn, setActivePunchIn] = useState('')
  const [isPunched, setIsPucnhed] = useState(false)


  const fallbackComponent = (
    <div className="error-fallback">
      <h2>Unable to load punch-in wizard</h2>
      <p>Please refresh the page and try again.</p>
      <button onClick={() => window.location.reload()}>
        Refresh Page
      </button>
    </div>
  );

  const loadingComponent = (
    <div className="loading-container">
      <LoadingSpinner size="large" />
      <p>Loading punch-in wizard...</p>
    </div>
  );


  const checkActivePunchins = async () => {
    try {
      const stored = localStorage.getItem('activePunchIn');
      // if (stored) {
      //   const punchData = JSON.parse(stored);
      //   setActivePunchIn(true);
      // }

      const currentPunchIn = await PunchAPI.getActivePunchIns()

      if (currentPunchIn.status == 'pending' || currentPunchIn.status == 'Punching') {
        setIsPucnhed(true);
        setActivePunchIn(currentPunchIn)
      }

    } catch (error) {

    }
  }

  const handlePunchOut = () => {
    setIsPucnhed(false)
  }

  useEffect(() => {
    // PunchApi.getActivePunchIns
    checkActivePunchins()
  }, [])




  return (
    <div className="all-body">
      <div className="punchin-capture-page">
        <ErrorBoundary fallback={fallbackComponent}>
          <Suspense fallback={loadingComponent}>
            {isPunched ? <PunchOutScreen activePunchIn={activePunchIn} onPunchOut={handlePunchOut} /> : <Punchin />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PunchInCapture;
