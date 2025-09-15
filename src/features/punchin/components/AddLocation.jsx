import React, { useState, useEffect, useRef } from 'react';
import { MdNotListedLocation, BiCurrentLocation } from "react-icons/md";
import '../styles/AddLocation.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PunchAPI } from '../services/punchService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../components/ui/Modal/ConfirmModal';
import { initHybridMap, setViewAndMarker, addAccuracyCircle } from "../../../utils/mapHelpers";
import { getCurrentPosition, toFixed6 } from "../../../hooks/useGeolocation";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AddLocation = ({ customer }) => {
  const [location, setLocation] = useState({ latitude: "00.000", longitude: "00.000" });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [locationSet, setLocationSet] = useState(false);

  const mapRef = useRef(null);
  const navigate = useNavigate();

  const saveLocation = async () => {
    if (!locationSet) return toast.error("❌ Please fetch location first");
    
    setShowConfirm(false);
    try {
      await PunchAPI.AddShopLocation({
        firm_name: customer.firm_name || customer.customerName,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      });
      toast.success("✅ Location saved!");
      navigate('/punch-in');
    } catch (err) {
      toast.error(`❌ Save failed: ${err.message}`);
    }
  };

  const getLocation = async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      const coords = toFixed6(pos.coords);
      
      setLocation(coords);
      setLocationSet(true);
      
      if (mapRef.current?._map) {
        setViewAndMarker(mapRef.current._map, null, coords.latitude, coords.longitude, 19);
        addAccuracyCircle(mapRef.current._map, coords.latitude, coords.longitude, pos.coords.accuracy);
      }
    } catch (err) {
      toast.error(`❌ Location error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapRef.current && !mapRef.current._leaflet_id) {
      const map = initHybridMap(mapRef.current, {
        center: [11.618044, 76.081180],
        zoom: 16,
      });
      mapRef.current._map = map;
    }
    return () => mapRef.current?._map?.remove();
  }, []);

  return (
    <div className='add-location-container'>
      <h2 className='set-loc-text'>
        {!customer.latitude ? "Set Location for:" : "Location Details for:"}
        <span className="set-cus-name">
          {customer.firm_name || customer.customerName || "Unnamed Customer"}
        </span>
      </h2>

      <div className="location-status">
        {!customer.latitude ? (
          <div className="location-warning">
            <MdNotListedLocation className="icon" />
            <div>
              <h5>Store location unavailable</h5>
              <p>Move closer to the store to set its location accurately.</p>
            </div>
          </div>
        ) : (
          <div className="location-success">
            <BiCurrentLocation className="icon" />
            <div>
              <h5>Location Available</h5>
              <p>This store has a saved location. You can update if needed.</p>
            </div>
          </div>
        )}
      </div>

      <div className="fetch-current">
        <div className="geo-loc-label">
          <BiCurrentLocation className="icon-geo" />
          <span>Fetch via Geolocation</span>
        </div>

        <div ref={mapRef} className='map' style={{ height: '300px', width: '100%' }} />

        <button
          className="fetch-current-btn"
          onClick={getLocation}
          disabled={loading}
        >
          <BiCurrentLocation className='icon' />
          {loading ? "Fetching..." : "Fetch Current Location"}
        </button>

        <div className="coordinates">
          <div className="coordinate">
            <label>Latitude:</label>
            <input
              type="text"
              value={location.latitude}
              readOnly
              style={{ backgroundColor: locationSet ? '#e8f5e8' : '#f5f5f5' }}
            />
          </div>
          <div className="coordinate">
            <label>Longitude:</label>
            <input
              type="text"
              value={location.longitude}
              readOnly
              style={{ backgroundColor: locationSet ? '#e8f5e8' : '#f5f5f5' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn cancel" onClick={() => navigate("/punch-in")}>
            Back
          </button>
          <button
            className="btn save"
            onClick={() => setShowConfirm(true)}
            disabled={!locationSet}
          >
            Save
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Location Confirmation"
        message={`Set (${location.latitude}, ${location.longitude}) as store location? Ensure you're at the store entrance.`}
        confirmText="Yes, Confirm"
        cancelText="Cancel"
        onCancel={() => setShowConfirm(false)}
        onConfirm={saveLocation}
      />
    </div>
  );
};

export default AddLocation;