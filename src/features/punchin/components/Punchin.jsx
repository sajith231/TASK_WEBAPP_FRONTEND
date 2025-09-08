import React, { useEffect, useRef, useState } from "react";
import "../styles/punchin.scss";

// Components
import ConfirmModal from "../../../components/ui/Modal/ConfirmModal";

// Icons
import {
    IoCameraReverse,
    IoCloseCircle,
    IoRefreshCircle,
    IoLocation,
} from "react-icons/io5";
import {
    MdOutlineCameraAlt,
    MdOutlineNotListedLocation,
    MdOutlineSocialDistance,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { LuCamera, LuSquarePen } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegClock } from "react-icons/fa";

// Utils
import { initHybridMap, setViewAndMarker } from "../../../utils/mapHelpers";
import { getCurrentPosition } from "../../../hooks/useGeolocation";
import { distanceKm } from "../../../utils/geoDis";
import { PunchAPI } from "../services/punchService";

const Punchin = ({ selectedCustomer: customerProp }) => {
    const [selectedCustomer, setSelectedCustomer] = useState(customerProp || null);

    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedLocation, setCapturedLocation] = useState(null);
    const [distance, setDistance] = useState("");
    const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [facingMode, setFacingMode] = useState("user");

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapContainerRef = useRef(null);

    // Camera lifecycle
    useEffect(() => {
        if (showCamera) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [showCamera, facingMode]);

    const startCamera = async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: facingMode } },
                audio: false,
            });

            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream;
        } catch (error) {
            setShowCamera(false);
            console.error("Camera access failed:", error);
            alert("Unable to access camera. Please check your browser permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement("canvas");
        const { videoWidth: width, videoHeight: height } = video;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (facingMode === "user") {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob((blob) => {
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage({ url: imageUrl, file });
            setShowCamera(false);
        }, "image/jpeg", 0.8);
    };

    // Cleanup capturedImage URL on unmount/change
    useEffect(() => {
        return () => {
            if (capturedImage?.url) {
                URL.revokeObjectURL(capturedImage.url);
            }
        };
    }, [capturedImage]);

    // ------------------ Location & Map ------------------
    const getLocation = async () => {
        try {
            const pos = await getCurrentPosition();
            const newLoc = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            };
            setCapturedLocation(newLoc);

            if (mapRef.current) {
                setViewAndMarker(mapRef.current, markerRef, newLoc.latitude, newLoc.longitude, 19);
            }
        } catch (err) {
            console.error("Error fetching location:", err.message || err);
        }
    };

    // Init map when container is ready
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        mapRef.current = initHybridMap(mapContainerRef.current, {
            center: [11.618044, 76.081180],
            zoom: 18,
        });
        getLocation();
    }, [mapContainerRef]);

    // Calculate distance
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
        <div>
            Punchin

            {selectedCustomer && selectedCustomer.latitude && (
                <div className="section_punchin">
                    {/* Location Label */}
                    <div className="location_available">
                        <p><IoLocation style={{ color: "#0bb838" }} /> Store location available</p>
                    </div>

                    {/* Photo Capture */}
                    {!capturedImage && (
                        <div className="photo_section">
                            <div className="photo_label">Image :</div>
                            <div className="take_button" onClick={() => setShowCamera(true)}>
                                <MdOutlineCameraAlt className="icon" /> Take a Photo
                            </div>
                        </div>
                    )}

                    {/* Captured Image Preview */}
                    {capturedImage && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: "backInOut" }}
                            className="preview_section"
                        >
                            <div className="photo_container">
                                <img src={capturedImage.url} alt="Captured" />
                            </div>

                            <div className="photo_actions">
                                <button
                                    className="discard"
                                    onClick={() => {
                                        if (capturedImage.url) URL.revokeObjectURL(capturedImage.url);
                                        setCapturedImage(null);
                                    }}
                                >
                                    <RiDeleteBinLine className="icon" /> Discard
                                </button>

                                <button className="retake" onClick={() => setShowCamera(true)}>
                                    <LuSquarePen className="icon" /> Retake
                                </button>
                            </div>

                            {/* Location Capture */}
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

                                    <div className="km_container">
                                        <div className="mdOutline">
                                            <MdOutlineSocialDistance className="icon" /> Distance from shop
                                        </div>
                                        <div className="km_span">{distance} Km</div>
                                    </div>
                                </div>
                            </div>

                            {/* Punch In Button */}
                            {capturedLocation && (
                                <div className="punchin_button" onClick={() => setOpenConfirmPunchIn(true)}>
                                    <FaRegClock /> Punch In
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            )}

            {/* ------------------ Camera Modal ------------------ */}
            {showCamera && (
                <div className="camera_modal">
                    <div className="camera_container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="camera_video"
                            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                        />
                        <div className="camera_header">
                            <button onClick={() => setShowCamera(false)} className="camera_btn close_btn">
                                <IoCloseCircle />
                            </button>
                            <button
                                onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
                                className="camera_btn"
                            >
                                <IoCameraReverse />
                            </button>
                        </div>
                        <div className="capture_overlay">
                            <button className="capture_btn" onClick={capturePhoto}>
                                <LuCamera />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------ Confirm Modal ------------------ */}
            {openConfirmPunchIn && (
                <ConfirmModal
                    title="Confirm Punch In"
                    message="Are you sure you want to punch in?"
                    onConfirm={async () => {
                        setIsLoading(true);
                        try {
                            await PunchAPI.punchIn({
                                customerId: selectedCustomer?.id,
                                image: capturedImage?.file,
                                location: capturedLocation,
                            });
                            alert("Punched in successfully!");
                        } catch (err) {
                            console.error(err);
                            alert("Punch in failed!");
                        } finally {
                            setIsLoading(false);
                            setOpenConfirmPunchIn(false);
                        }
                    }}
                    onCancel={() => setOpenConfirmPunchIn(false)}
                    loading={isLoading}
                />
            )}
        </div>
    );
};

export default Punchin;
