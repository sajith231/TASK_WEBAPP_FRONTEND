import React, { useState, useEffect, useRef } from 'react';
import { MdNetworkLocked, MdNotListedLocation } from "react-icons/md";
import { BiCurrentLocation } from 'react-icons/bi';
import './AddLocation.scss';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const AddLocation = ({ customer }) => {
    const [location, setLocation] = useState({ lat: "00.000", lon: "00.000" });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);


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


    // useEffect(() => {
    //     mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2);
    //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //         attribution: '&copy; OpenStreetMap contributors'
    //     }).addTo(mapRef.current);

    //     // getLocation()

    //     return () => {
    //         if (mapRef.current) {
    //             mapRef.current.remove();
    //             mapRef.current = null;
    //         }
    //     };
    // }, []);

    useEffect(() => {
        
        mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 10);
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution:
                    'Zain © <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 30
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
                    <button type="submit" className="btn save">Confirm &amp; Save</button>
                </div>


            </div>



        </div>
    );
};

export default AddLocation;