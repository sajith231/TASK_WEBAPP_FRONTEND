import React, { useState, useEffect, useRef } from 'react';
import { MdNotListedLocation } from "react-icons/md";
import { BiCurrentLocation } from 'react-icons/bi';
import './AddLocation.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AnimatePresence, motion } from 'framer-motion';
import { PunchAPI } from '../../api/punchService';
import { toast } from 'react-toastify';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

    // Save location handler;

    const handleSaveLocation = async () => {
        // Validate location before saving
        if (!locationFetched || location.latitude === "00.000" || location.longitude === "00.000") {
            toast.error("❌ Please fetch your current location first before saving.");
            return;
        }

        setIsSaving(true);
        setOpenConfirmPunchIn(false); // Close confirmation modal immediately

        try {
            await toast.promise(
                PunchAPI.AddShopLocation({
                    firm_name: customer.firm_name || customer.customerName,
                    latitude: parseFloat(location.latitude),
                    longitude: parseFloat(location.longitude)
                }),
                {
                    pending: {
                        render: () => (
                            <div className="toast-loading">
                                <div className="spinner"></div>
                                <span>Saving location...</span>
                            </div>
                        ),
                        icon: false
                    },
                    success: {
                        render: () => (
                            <div className="toast-success">
                                <span>✅ Shop location saved successfully!</span>
                            </div>
                        ),
                        autoClose: 2000,
                        onClose: () => window.location.reload()
                    },
                    error: {
                        render: ({ data }) => (
                            <div className="toast-error">
                                <span>❌ Failed to save location: {data?.message || 'Please try again'}</span>
                            </div>
                        ),
                        autoClose: 3000
                    }
                }
            );
        } catch (err) {
            console.error("Save location error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Fetch geolocation with better error handling and options
    const getLocation = () => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        // Enhanced geolocation options for better accuracy
        const options = {
            enableHighAccuracy: true,     // Use GPS if available
            timeout: 15000,               // 15 second timeout
            maximumAge: 0                 // Don't use cached location
        };

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                console.log("Location fetched:", pos.coords);

                // Round to 6 decimal places for better precision
                const newLoc = {
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6)
                };

                setLocation(newLoc);
                setLocationFetched(true);
                setError('');

                // Update map and marker
                if (mapRef.current) {
                    const latLng = [parseFloat(newLoc.latitude), parseFloat(newLoc.longitude)];

                    // Set map view with high zoom for accuracy
                    mapRef.current.setView(latLng, 19);

                    // Update or create marker
                    if (markerRef.current) {
                        markerRef.current.setLatLng(latLng);
                    } else {
                        markerRef.current = L.marker(latLng).addTo(mapRef.current);
                    }

                    // Add accuracy circle if available
                    if (pos.coords.accuracy) {
                        L.circle(latLng, {
                            radius: pos.coords.accuracy,
                            color: '#007bff',
                            fillColor: 'transparent',
                            fillOpacity: 0,
                            weight: 2,
                            dashArray: '5, 5'
                        }).addTo(mapRef.current);
                    }
                }

                setTimeout(() => setLoading(false), 500);
            },
            (err) => {
                console.error("Geolocation error:", err);
                let errorMessage = "Failed to get location. ";

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage += "Location access denied. Please enable location permissions.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage += "Location information unavailable. Try again.";
                        break;
                    case err.TIMEOUT:
                        errorMessage += "Location request timed out. Try again.";
                        break;
                    default:
                        errorMessage += err.message;
                        break;
                }

                setError(errorMessage);
                setLoading(false);
            },
            options
        );
    };

    // Initialize map with Google Maps first, fallback to OpenStreetMap
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                attributionControl: false,
                zoomControl: true,
            }).setView([11.618044, 76.081180], 16);

            // Try Google Maps first
            const googleSatelliteUrl = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
            const openStreetMapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

            // Test Google Maps availability
            const testGoogleTile = new Image();
            testGoogleTile.crossOrigin = 'anonymous';

            testGoogleTile.onload = () => {
                console.log('Google Maps tiles available, using satellite view');
                L.tileLayer(googleSatelliteUrl, {
                    maxZoom: 23,
                    attribution: '© Google'
                }).addTo(mapRef.current);
            };

            testGoogleTile.onerror = () => {
                console.log('Google Maps tiles unavailable, falling back to OpenStreetMap');
                L.tileLayer(openStreetMapUrl, {
                    maxZoom: 20,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(mapRef.current);
            };

            // Test with a sample tile
            const testTileUrl = googleSatelliteUrl
                .replace('{x}', '1')
                .replace('{y}', '1')
                .replace('{z}', '2');

            testGoogleTile.src = testTileUrl;

            // Fallback timeout in case the test takes too long
            setTimeout(() => {
                if (!mapRef.current._layers || Object.keys(mapRef.current._layers).length === 0) {
                    console.log('Timeout reached, using OpenStreetMap as fallback');
                    L.tileLayer(openStreetMapUrl, {
                        maxZoom: 20,
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(mapRef.current);
                }
            }, 3000);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    return (
        <div className='add-location-container'>
            <h2 className='set-loc-text'>
                Set Location for:
                <span className="set-cus-name">
                    {customer.firm_name || customer.customerName || "Unnamed Customer"}
                </span>
            </h2>

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

            <div className="fetch-current">
                <div className="geo-loc-label">
                    <BiCurrentLocation className="icon-geo" />
                    <span>Fetch via Geolocation</span>
                </div>

                <div ref={mapContainerRef} className='map' style={{ height: '300px', width: '100%' }}></div>

                {error && (
                    <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
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
                    <button type="button" className="btn cancel">Cancel</button>
                    <button
                        type="submit"
                        className="btn save"
                        onClick={() => setOpenConfirmPunchIn(!openConfirmPunchIn)}
                        disabled={!locationFetched}
                        style={{ opacity: locationFetched ? 1 : 0.6 }}
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Confirm Punchin */}
            <AnimatePresence>
                {openConfirmPunchIn && (
                    <motion.div
                        className="confirm_modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="confirm_container"
                            initial={{ scale: 0.85, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <h3 className="confirm_title">Location Confirmation</h3>
                            <p className="confirm_text">
                                {`Are you sure you want to set (${location.latitude}, ${location.longitude}) as this store's location? Make sure you are standing at or very near the store entrance before confirming.`}
                            </p>

                            <div className="confirm_buttons">
                                <button
                                    className="btn secondary"
                                    onClick={() => setOpenConfirmPunchIn(!openConfirmPunchIn)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn primary"
                                    onClick={handleSaveLocation}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Processing..." : "Yes, Confirm"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddLocation;