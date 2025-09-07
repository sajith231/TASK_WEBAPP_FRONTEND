import React, { useState, useEffect, useRef } from 'react';
import { MdNotListedLocation } from "react-icons/md";
import { BiCurrentLocation } from 'react-icons/bi';
import '../styles/AddLocation.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PunchAPI } from '../services/punchService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import ConfirmModal from '../../../components/ui/Modal/ConfirmModal';
import { initHybridMap, setViewAndMarker, addAccuracyCircle } from "../../../utils/mapHelpers";
import { getCurrentPosition, toFixed6 } from "../../../hooks/useGeolocation";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AddLocation = ({ customer }) => {
  const [location, setLocation] = useState({ latitude: "00.000", longitude: "00.000" });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  const navigate = useNavigate()

  // Save location handler
  const handleSaveLocation = async () => {
    if (!locationFetched || location.latitude === "00.000" || location.longitude === "00.000") {
      toast.error("❌ Please fetch your current location first before saving.");
      return;
    }

    setIsSaving(true);
    setOpenConfirmPunchIn(false);

    try {
      await toast.promise(
        PunchAPI.AddShopLocation({
          firm_name: customer.firm_name || customer.customerName,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        }),
        {
          pending: {
            render: () => (
              <div className="toast-loading">
                <div className="spinner"></div>
                <span>Saving location...</span>
              </div>
            ),
            icon: false,
          },
          success: {
            render: () => (
              <div className="toast-success">
                <span> Shop location saved successfully!</span>
              </div>
            ),
            autoClose: 2000,
            onClose: () =>navigate('/punch-in'),
          },
          error: {
            render: ({ data }) => (
              <div className="toast-error">
                <span>❌ Failed to save location: {data?.message || 'Please try again'}</span>
              </div>
            ),
            autoClose: 3000,
          },
        }
      );
    } catch (err) {
      console.error("Save location error:", err);
      toast.error("❌ An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch location
  const getLocation = async () => {
    setLoading(true);
    setError("");
    try {
      const pos = await getCurrentPosition();
      const fixed = toFixed6(pos.coords);

      setLocation(fixed);
      setLocationFetched(true);

      if (mapRef.current) {
        setViewAndMarker(mapRef.current, markerRef, fixed.latitude, fixed.longitude, 19);
        addAccuracyCircle(mapRef.current, fixed.latitude, fixed.longitude, pos.coords.accuracy);
      }
    } catch (err) {
      console.error("Geolocation error:", err);
      let msg = "Failed to get location. ";
      if (err.code === err?.PERMISSION_DENIED) msg += "Location access denied. Please enable permissions.";
      else if (err.code === err?.POSITION_UNAVAILABLE) msg += "Location information unavailable. Try again.";
      else if (err.code === err?.TIMEOUT) msg += "Request timed out. Try again.";
      else msg += err.message || "Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = initHybridMap(mapContainerRef.current, {
        center: [11.618044, 76.081180],
        zoom: 16,
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className='add-location-container'>
      <h2 className='set-loc-text'>
       {!customer.latitude ?( "Set Location for:"):("Location Details for:")}
        <span className="set-cus-name">
          {customer.firm_name || customer.customerName || "Unnamed Customer"}
        </span>
      </h2>
      {!customer.latitude ? (
        <div className="add-location">
          <div className="location-warning">
            <MdNotListedLocation className="icon" />
            <div className="message">
              <h5 className="title">Store location unavailable</h5>
              <p className="description">
                This store does not have a location set yet.
                Please move closer to the store to set its location accurately.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="location-available-">
          <div className="location-success">
            <BiCurrentLocation className="icon" />
            <div className="messge">
              <h5 className='title'>Location Available</h5>
              <p className="description">
                This store already has a saved location. You can edit and save again if needed.
              </p>
            </div>
          </div>

        </div>

      )
      }

      <div className="fetch-current">
        <div className="geo-loc-label">
          <BiCurrentLocation className="icon-geo" />
          <span>Fetch via Geolocation</span>
        </div>

        <div ref={mapContainerRef} className='map' style={{ height: '300px', width: '100%' }}></div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          className="fetch-current-btn"
          onClick={getLocation}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <BiCurrentLocation className='icon' />
          {loading ? "Fetching..." : "Fetch Current Location"}
        </button>

        <div className="coordinates">
          <div className="coordinate">
            <label htmlFor="latitude">Latitude:</label>
            <input
              type="text"
              id="latitude"
              value={location.latitude}
              readOnly
              style={{ backgroundColor: locationFetched ? '#e8f5e8' : '#f5f5f5' }}
            />
          </div>
          <div className="coordinate">
            <label htmlFor="longitude">Longitude:</label>
            <input
              type="text"
              id="longitude"
              value={location.longitude}
              readOnly
              style={{ backgroundColor: locationFetched ? '#e8f5e8' : '#f5f5f5' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn cancel" onClick={() => navigate("/punch-in")}>
            Back
          </button>
          <button
            type="submit"
            className="btn save"
            onClick={() => setOpenConfirmPunchIn(true)}
            disabled={!locationFetched}
            style={{ opacity: locationFetched ? 1 : 0.6 }}
          >
            Save
          </button>
        </div>
      </div>

      <ConfirmModal
        open={openConfirmPunchIn}
        title="Location Confirmation"
        message={`Are you sure you want to set (${location.latitude}, ${location.longitude}) as this store's location? Make sure you are standing at or very near the store entrance before confirming.`}
        confirmText={isSaving ? "Processing..." : "Yes, Confirm"}
        cancelText="Cancel"
        loading={isSaving}
        onCancel={() => setOpenConfirmPunchIn(false)}
        onConfirm={handleSaveLocation}
      />
    </div>
  );
};

export default AddLocation;
