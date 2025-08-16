import React, { useState, useEffect, useRef } from 'react';
import { MdNetworkLocked, MdNotListedLocation } from "react-icons/md";
import { BiCurrentLocation } from 'react-icons/bi';
import './AddLocation.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AnimatePresence, motion } from 'framer-motion';

const AddLocation = ({ customer }) => {
    const [location, setLocation] = useState({ lat: "00.000", lon: "00.000" });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false)


    const getLocation = () => {
        setLoading(true);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {

                const newLoc = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                };

                setLocation(newLoc);
                setError('');

                if (mapRef.current) {
                    mapRef.current.setView([newLoc.lat, newLoc.lon], 15);
                    if (markerRef.current) {
                        markerRef.current.setLatLng([newLoc.lat, newLoc.lon]);
                    } else {
                        markerRef.current = L.marker([newLoc.lat, newLoc.lon]).addTo(mapRef.current);
                    }
                }


                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    };


    useEffect(() => {

        mapRef.current = L.map(mapContainerRef.current).setView([11.618044,76.081180], 33);
        L.tileLayer(
    (() => {
        const urls = [
            "http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ];
        // Pre-test primary; if it fails, add fallback layer after map init
        const testImg = new Image();
        testImg.onerror = () => {
            if (mapRef.current && !mapRef.current.__fallbackAdded) {
                mapRef.current.__fallbackAdded = true;
                L.tileLayer(urls[1], {
                    attribution: 'Zain © <a href="https://www.esri.com/">Esri</a>',
                    maxZoom: 23
                }).addTo(mapRef.current);
            }
        };
        testImg.src = urls[0]
            .replace('{z}', '1')
            .replace('{x}', '1')
            .replace('{y}', '1');
        return urls[0];
    })(),
            {
                attribution:
                    'Zain © <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 23
            }
        ).addTo(mapRef.current);

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
                Set Location for:
                <span className="set-cus-name">
                    {customer.name || customer.customerName || "Unnamed Customer"}
                </span>

            </h2>



            <div className="add-location">
                <div className="location-warning">
                    <MdNotListedLocation className="icon" />
                    <div className="message">
                        <h5 className="title">Store location unavailable</h5>
                        <p className="description">
                            This store does not have a location set yet.
                            Please move closer to the store to set its location accurately                        </p>
                    </div>
                </div>
            </div>

            <div className="fetch-current">
                <div className="geo-loc-label">
                    <BiCurrentLocation className="icon-geo" />
                    <span>Fetch via Geolocation</span>
                </div>

                <div ref={mapContainerRef} className='map'>

                </div>

                <button className="fetch-current-btn" onClick={() => { getLocation() }}  >
                    <BiCurrentLocation className='icon' />

                    {loading ? "Fetching..." : "Fetch Current Location"}
                </button>

                <div className="coordinates">
                    <div className="coordinate">
                        <label htmlFor="latitude">latitude:</label>
                        <input type="text" id="latitude" value={location.lat} readOnly />
                    </div>
                    <div className="coordinate">
                        <label htmlFor="longitude">longitude:</label>
                        <input type="text" id="longitude" value={location.lon} readOnly />
                    </div>
                </div>


                <div className="form-actions">
                    <button type="button" className="btn cancel">Cancel</button>
                    <button type="submit" className="btn save"
                        onClick={() => setOpenConfirmPunchIn(!openConfirmPunchIn)}
                    > Save</button>
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
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                            }}
                        >
                            <h3 className="confirm_title">Location Confirmation</h3>
                            <p className="confirm_text">
                                {`Are you sure you want to set (${location.lat}, ${location.lon}) as this store's location? Make sure you are standing at or very near the store entrance before confirming.`}
                            </p>

                            <div className="confirm_buttons">
                                <button
                                    className="btn secondary"
                                    onClick={() => setOpenConfirmPunchIn(!openConfirmPunchIn)}
                                // disabled={isLoading}
                                >
                                    No, Cancel
                                </button>
                                <button
                                    className="btn primary"
                                    onClick={() => {
                                        // handle punch in
                                    }}

                                >
                                    {true ? "Processing..." : "Yes, Punch In"}
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