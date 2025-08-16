// PunchIn.jsx
// --------------------------------------
// A React component for Punch In flow:
// - Customer selection dropdown
// - Camera capture with preview & retake
// - Location fetch + Leaflet map
// - Punch In confirmation modal
// --------------------------------------

import React, { useEffect, useRef, useState } from "react";
import "./punchin.scss";

// Components
import AddLocation from "../../components/Punchin/AddLocation";

// Icons
import {
  IoMdArrowDropdown,
  IoMdArrowDropup,
  IoMdClose,
} from "react-icons/io";
import {
  IoCameraReverse,
  IoClose,
  IoCloseCircle,
  IoRefreshCircle,
  IoSearchSharp,
  IoLocation,
} from "react-icons/io5";
import {
  MdNotListedLocation,
  MdOutlineCameraAlt,
  MdOutlineNotListedLocation,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { LuCamera, LuSquarePen } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegClock } from "react-icons/fa";

// Assets
import test from "../../assets/test.jpeg";

// Customers Data
const customers = [
  { id: 1, name: "ShopMart", area: "" },
  { id: 2, name: "QuickBuy", area: "24.8615,67.0099" },
  { id: 3, customerName: "SuperStore", area: "" },
  { id: 4, name: "MegaMart", area: "24.8630,67.0105" },
  { id: 5, customerName: "GroceryHub", area: "24.8641,67.0033" },
  // ... (keep rest of customers as in your code)
];

// --------------------------------------
// Component
// --------------------------------------
const PunchIn = () => {
  // State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedLocation, setCapturedLocation] = useState(null);

  const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false);
  const [isLoading, SetIsLoading] = useState(false);

  const [facingMode, setFacingMode] = useState("user");

  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // --------------------------------------
  // Filter customers by search term
  // --------------------------------------
  const filtered = customers.filter((c) =>
    (c.name || c.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --------------------------------------
  // Camera handling
  // --------------------------------------
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

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      setShowCamera(false);
      console.error("Camera access failed:", error);
      alert("Unable to access camera. Please check your browser permissions and try again.");
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
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        const imageUrl = URL.createObjectURL(blob);

        setCapturedImage({ url: imageUrl, file: file });
        setShowCamera(false);
      },
      "image/jpeg",
      0.8
    );
  };

  // --------------------------------------
  // Location handling + Leaflet map
  // --------------------------------------
  const getLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

        setCapturedLocation(newLoc);

        if (mapRef.current) {
          mapRef.current.setView([newLoc.lat, newLoc.lon], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([newLoc.lat, newLoc.lon]);
          } else {
            markerRef.current = L.marker([newLoc.lat, newLoc.lon]).addTo(mapRef.current);
          }
        }
      },
      (err) => {
        console.error("Error fetching location:", err.message);
      }
    );
  };

  // FIX: Only initialize Leaflet map when mapContainerRef is mounted
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!capturedImage) return; // only after photo is taken

    mapRef.current = L.map(mapContainerRef.current).setView([11.618044, 76.081180], 23);

    L.tileLayer(
      (() => {
        const urls = [
          "http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ];
        const testImg = new Image();
        testImg.onerror = () => {
          if (mapRef.current && !mapRef.current.__fallbackAdded) {
            mapRef.current.__fallbackAdded = true;
            L.tileLayer(urls[1], {
              attribution: '© <a href="https://www.esri.com/">Zain</a>',
              maxZoom: 23,
            }).addTo(mapRef.current);
          }
        };
        testImg.src = urls[0].replace("{z}", "1").replace("{x}", "1").replace("{y}", "1");
        return urls[0];
      })(),
      {
        attribution: 'Zain © <a href="https://www.esri.com/">Esri</a>',
        maxZoom: 23,
      }
    ).addTo(mapRef.current);

    getLocation();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [capturedImage]);

  // --------------------------------------
  // Render
  // --------------------------------------
  return (
    <div className="container">
      {/* ------------------ Customer Selection ------------------ */}
      <div className="customer_section">
        <h2>Select Customer</h2>

        {/* Dropdown button */}
        <div className="drop_button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          {selectedCustomer?.name || selectedCustomer?.customerName || "Select a customer"}
          <span style={{ marginLeft: 8, display: "inline-flex", verticalAlign: "middle" }}>
            {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="dropdownOpen">
            <div className="input_section">
              <span className="search_icon">
                <IoSearchSharp />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="customer-list">
              {filtered.length > 0 ? (
                filtered.map((customer) => (
                  <div
                    key={customer.id}
                    className="customer"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {customer.name || customer.customerName || "Unnamed Customer"}
                    <div className="list_icons">
                      {customer.area ? (
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

        {/* If customer has no location */}
        {selectedCustomer && !selectedCustomer.area && <AddLocation customer={selectedCustomer} />}

        {/* If customer has location */}
        {selectedCustomer && selectedCustomer.area && (
          <div className="section_punchin">
            {/* Location available label */}
            <div className="location_available">
              <p>
                <IoLocation style={{ color: "#0bb838" }} />
                Store location available
              </p>
            </div>

            {/* Photo capture */}
            {!capturedImage && (
              <div className="photo_section">
                <div className="photo_label">Image :</div>
                <div className="take_button" onClick={() => setShowCamera(true)}>
                  <MdOutlineCameraAlt className="icon" />
                  Take a Photo
                </div>
              </div>
            )}

            {/* Image Preview */}
            {capturedImage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1, transition: { duration: 1, delay: 0.2, ease: "backInOut" } }}
                className="preview_section"
              >
                <div className="photo_container">
                  <div className="photo">
                    <img src={capturedImage.url} alt="Captured" />
                  </div>
                </div>

                <div className="photo_actions">
                  <button
                    className="discard"
                    onClick={() => {
                      if (capturedImage.url) URL.revokeObjectURL(capturedImage.url);
                      setCapturedImage(null);
                    }}
                  >
                    <RiDeleteBinLine className="icon" />
                    <span>Discard</span>
                  </button>

                  <button className="retake" onClick={() => setShowCamera(true)}>
                    <LuSquarePen className="icon" />
                    <span>Retake</span>
                  </button>
                </div>

                {/* Location capture */}
                {capturedImage && (
                  <div className="capture_location">
                    <div className="location_container">
                      <div className="location_header">
                        <div className="your_location">
                          <MdOutlineNotListedLocation className="icon" />
                          Your Location
                        </div>
                        <div className="fetch_btn" onClick={getLocation}>
                          <IoRefreshCircle />
                        </div>
                      </div>

                      <div className="location_map" ref={mapContainerRef}></div>
                    </div>
                  </div>
                )}

                {/* Punch In button */}
                {capturedLocation && (
                  <div className="punchin_button" onClick={() => setOpenConfirmPunchIn(true)}>
                    <FaRegClock />
                    Punch In
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
            {/* Camera Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera_video"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />

            {/* Camera Controls */}
            <div className="camera_header">
              <button onClick={() => setShowCamera(false)} className="camera_btn close_btn" title="Close">
                <IoCloseCircle />
              </button>

              <button
                onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))}
                className="camera_btn"
                title="Switch Camera"
              >
                <IoCameraReverse />
              </button>
            </div>

            {/* Capture Button */}
            <div className="capture_overlay">
              <button className="capture_btn" onClick={() => capturePhoto()}>
                <LuCamera />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Confirm Punch In ------------------ */}
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
              <h3 className="confirm_title">Punch In Confirmation</h3>
              <p className="confirm_text">
                You’re about to punch in for this store. Please confirm to continue.
              </p>

              <div className="confirm_buttons">
                <button
                  className="btn secondary"
                  onClick={() => setOpenConfirmPunchIn(false)}
                  disabled={isLoading}
                >
                  No, Cancel
                </button>

                <button
                  className="btn primary"
                  onClick={() => {
                    // handle punch in
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Yes, Punch In"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PunchIn;
