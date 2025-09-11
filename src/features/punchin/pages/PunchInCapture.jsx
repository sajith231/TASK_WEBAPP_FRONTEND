import React, { Suspense } from "react";
import "../styles/PunchinCapture.scss";

// Components
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

// Lazy load the Punchin component for better performance
const Punchin = React.lazy(() => import("../components/Punchin"));

/**
 * Production-ready PunchInCapture page component
 * Handles error boundaries and loading states
 */
const PunchInCapture = () => {
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

  return (
    <div className="all-body">
      <div className="punchin-capture-page">
        <ErrorBoundary fallback={fallbackComponent}>
          <Suspense fallback={loadingComponent}>
            <Punchin />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PunchInCapture;
