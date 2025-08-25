import React, { useEffect, useRef, useState } from "react";
import "./StoreLocationCapture.scss";

// Icons
import { IoRefreshCircle, IoLocation } from "react-icons/io5";
import { MdOutlineNotListedLocation, MdOutlineSocialDistance } from "react-icons/md";

// Utils
import { initHybridMap, setViewAndMarker } from "../../utils/mapHelpers";
import { getCurrentPosition } from "../../utils/geolocation";
import { distanceKm } from "../../utils/geoDis";

const CaptureLocation = ({ selectedCustomer }) => {
    const [capturedLocation, setCapturedLocation] = useState(null);
    const [distance, setDistance] = useState("");

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);

    // Initialize map once
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = initHybridMap(mapContainerRef.current, {
            center: [11.618044, 76.081180],
            zoom: 18,
        });

        getLocation(); // auto fetch location on load
    }, []);

    // Fetch current geolocation
    const StoreLocationCapture = async () => {
        try {
            const pos = await getCurrentPosition();
            const newLoc = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            };
            setCapturedLocation(newLoc);

            if (mapRef.current) {
                setViewAndMarker(
                    mapRef.current,
                    markerRef,
                    newLoc.latitude,
                    newLoc.longitude,
                    19
                );
            }
        } catch (err) {
            console.error("Error fetching location:", err.message || err);
        }
    };

    // Compute distance whenever location updates
    useEffect(() => {
        if (selectedCustomer?.latitude && capturedLocation?.latitude) {
            setDistance(
                distanceKm(
                    selectedCustomer.latitude,
                    selectedCustomer.longitude,
                    capturedLocation.latitude,
                    capturedLocation.longitude
                )
            );
        }
    }, [selectedCustomer, capturedLocation]);

    return (
        <div className="capture_location">
            <div className="location_container">
                <div className="location_header">
                    <div className="your_location">
                        <MdOutlineNotListedLocation className="icon" /> Your Location
                    </div>
                    <div className="fetch_btn" onClick={getLocation}>
                        <IoRefreshCircle />
                    </div>
                </div>

                <div
                    className="location_map"
                    ref={mapContainerRef}
                    style={{ height: "300px", width: "100%" }}
                />

                {selectedCustomer?.latitude && (
                    <div className="km_container">
                        <div className="mdOutline">
                            <MdOutlineSocialDistance className="icon" /> Distance from shop
                        </div>
                        <div className="km_span">{distance || "--"} Km</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreLocationCapture;


