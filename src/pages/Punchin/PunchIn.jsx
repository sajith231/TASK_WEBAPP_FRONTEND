import React, { useEffect, useRef, useState } from "react";
import "./punchin.scss";

// Components
import AddLocation from "../../components/Punchin/AddLocation";
import ConfirmModal from "../../components/Modal/ConfirmModal";

// Icons
import {
  IoMdArrowDropdown,
  IoMdArrowDropup,
} from "react-icons/io";
import {
  IoCameraReverse,
  IoCloseCircle,
  IoRefreshCircle,
  IoSearchSharp,
  IoLocation,
} from "react-icons/io5";
import {
  MdNotListedLocation,
  MdOutlineCameraAlt,
  MdOutlineNotListedLocation,
  MdOutlineSocialDistance,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { LuCamera, LuSquarePen } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegClock } from "react-icons/fa";

// Utils
import { initHybridMap, setViewAndMarker } from "../../utils/mapHelpers";
import { getCurrentPosition } from "../../utils/geolocation";
import { distanceKm } from "../../utils/geoDis";
import { PunchAPI } from "../../api/punchService";

const PunchIn = () => {
  // ------------------ State ------------------
  const [customers, setCustomers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [distance, setDistance] = useState("");
  const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [facingMode, setFacingMode] = useState("user");

  // ------------------ Refs ------------------
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // ------------------ Fetch Customers ------------------
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await PunchAPI.getFirms();
        setCustomers(response.firms || []);
      } catch (err) {
        console.error("Failed to fetch firms", err);
      }
    };

    fetchCustomers();
  }, []);

  // ------------------ Filter Customers ------------------
  const filteredCustomers = customers.filter((c) =>
    (c.name || c.customerName || c.firm_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ------------------ Camera Handling ------------------
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


  // ------------------ Render ------------------


  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    mapRef.current = initHybridMap(mapContainerRef.current, {
      center: [11.618044, 76.081180],
      zoom: 18,
    });
        getLocation();

  }, [capturedImage]);


  useEffect(() => {
    if (selectedCustomer?.latitude && capturedLocation?.latitude) {
      setDistance(
        distanceKm(
          selectedCustomer.latitude,
          selectedCustomer.longitude,
          capturedLocation.latitude,
          capturedLocation.longitude
        ))
    }
  }, [selectedCustomer, capturedLocation]);


  return (
    <div className="container">
      {/* ------------------ Customer Selection ------------------ */}
      <div className="customer_section">
        <h2>Select Customer</h2>

        {/* Dropdown Button */}
        <div className="drop_button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          {selectedCustomer?.name || selectedCustomer?.customerName || "Select a customer"}
          <span style={{ marginLeft: 8, display: "inline-flex" }}>
            {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="dropdownOpen">
            <div className="input_section">
              <span className="search_icon"><IoSearchSharp /></span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="customer-list">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="customer"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {customer.firm_name || customer.customerName || "Unnamed Customer"}
                    <div className="list_icons">
                      {customer.latitude ? (
                        <IoLocation style={{ color: "#0bb838" }} />
                      ) : (
                        <MdNotListedLocation style={{ color: "red" }} />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-customers">No matching customers</div>
              )}
            </div>
          </div>
        )}

        {/* Location Handling */}
        {selectedCustomer && !selectedCustomer.latitude && (
          <AddLocation customer={selectedCustomer} />
        )}

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

                    <div className="location_map" ref={mapContainerRef} style={{ height: "300px", width: "100%" }} />

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
      </div>

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

      {/* ------------------ Confirm Punch In ------------------ */}
      <AnimatePresence>
        {openConfirmPunchIn && (
          <ConfirmModal
            open={openConfirmPunchIn}
            title="Punch In Confirmation"
            message="You’re about to punch in for this store. Please confirm to continue."
            confirmText={isLoading ? "Processing..." : "Yes, Punch In"}
            cancelText="No, Cancel"
            loading={isLoading}
            onCancel={() => setOpenConfirmPunchIn(false)}
            onConfirm={() => {
              // TODO: handle punch in API
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PunchIn;
