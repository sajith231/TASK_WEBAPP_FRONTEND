

import React, { useEffect, useRef, useState } from "react";
import "./punchin.scss";
import AddLocation from "../../components/Punchin/AddLocation";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdClose } from "react-icons/io";
import { IoCameraReverse, IoClose, IoCloseCircle, IoSearchSharp } from "react-icons/io5";
import { MdNotListedLocation, MdOutlineCameraAlt } from "react-icons/md";
import { IoLocation } from "react-icons/io5";
import { motion } from "framer-motion";
import { LuCamera, LuSquarePen } from "react-icons/lu";
import test from '../../assets/test.jpeg';
import { RiDeleteBinLine } from "react-icons/ri";


const customers = [
  { id: 1, name: "ShopMart", area: "" },
  { id: 2, name: "QuickBuy", area: "24.8615,67.0099" },
  { id: 3, customerName: "SuperStore", area: "" },
  { id: 4, name: "MegaMart", area: "24.8630,67.0105" },
  { id: 5, customerName: "GroceryHub", area: "24.8641,67.0033" },
  { id: 6, name: "FreshMarket", area: "24.8652,67.0111" },
  { id: 7, customerName: "DailyNeeds", area: "24.8663,67.0044" },
  { id: 8, name: "ShopEase", area: "24.8674,67.0122" },
  { id: 9, customerName: "UrbanShop", area: "24.8685,67.0055" },
  { id: 10, name: "ValueStore", area: "24.8696,67.0133" },
  { id: 11, customerName: "BudgetMart", area: "24.8707,67.0066" },
  { id: 12, name: "CornerShop", area: "24.8718,67.0144" },
  { id: 13, customerName: "ShopExpress", area: "24.8729,67.0077" },
  { id: 14, name: "MarketPlace", area: "24.8740,67.0155" },
  { id: 15, customerName: "ShopCentral", area: "24.8751,67.0088" },
  { id: 16, name: "ShopStop", area: "24.8762,67.0166" },
  { id: 17, customerName: "ShopSmart", area: "24.8773,67.0099" },
  { id: 18, name: "ShopWorld", area: "24.8784,67.0177" },
  { id: 19, customerName: "ShopCity", area: "24.8795,67.0110" },
  { id: 20, name: "ShopZone", area: "24.8806,67.0188" },
  { id: 21, customerName: "ShopPoint", area: "24.8817,67.0121" },
  { id: 22, name: "ShopOutlet", area: "24.8828,67.0199" },
  { id: 23, customerName: "ShopBazaar", area: "24.8839,67.0132" },
  { id: 24, name: "ShopDepot", area: "24.8850,67.0210" },
  { id: 25, customerName: "ShopPlaza", area: "24.8861,67.0143" },
  { id: 26, name: "ShopSquare", area: "24.8872,67.0221" },
  { id: 27, customerName: "ShopMall", area: "24.8883,67.0154" },
  { id: 28, name: "ShopCorner", area: "24.8894,67.0232" },
  { id: 29, customerName: "ShopLane", area: "24.8905,67.0165" },
  { id: 30, name: "ShopAvenue", area: "24.8916,67.0243" },
  { id: 31, customerName: "ShopDrive", area: "24.8927,67.0176" },
  { id: 32, name: "ShopWay", area: "24.8938,67.0254" },
  { id: 33, customerName: "ShopRoad", area: "24.8949,67.0187" },
  { id: 34, name: "ShopStreet", area: "24.8960,67.0265" },
  { id: 35, customerName: "ShopAlley", area: "24.8971,67.0198" },
  { id: 36, name: "ShopTerrace", area: "24.8982,67.0276" },
  { id: 37, customerName: "ShopVista", area: "24.8993,67.0209" },
  { id: 38, name: "ShopHeights", area: "24.9004,67.0287" },
  { id: 39, customerName: "ShopFields", area: "24.9015,67.0220" },
  { id: 40, name: "ShopGardens", area: "24.9026,67.0298" },
  { id: 41, customerName: "ShopPark", area: "24.9037,67.0231" },
  { id: 42, name: "ShopMeadow", area: "24.9048,67.0309" },
  { id: 43, customerName: "ShopValley", area: "24.9059,67.0242" },
  { id: 44, name: "ShopHill", area: "24.9070,67.0320" },
  { id: 45, customerName: "ShopBrook", area: "24.9081,67.0253" },
  { id: 46, name: "ShopCreek", area: "24.9092,67.0331" },
  { id: 47, customerName: "ShopBay", area: "24.9103,67.0264" },
  { id: 48, name: "ShopHarbor", area: "24.9114,67.0342" },
  { id: 49, customerName: "ShopDock", area: "24.9125,67.0275" },
  { id: 50, name: "ShopPier", area: "24.9136,67.0353" },
];

const PunchIn = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null);
  const [openConfirmPunchIn, setOpenConfirmPunchIn] = useState(false)
  const [facingMode, setFacingMode] = useState("user");
  const videoRef = useRef(null);
  const streamRef = useRef(null);


  const filtered = customers.filter((c) =>
    (c.name || c.customerName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },

        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;

    } catch (error) {
      console.error("Camera access failed:", error);
      alert("Unable to access camera. Please check your browser permissions and try again.");

    }
  }


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return

    const canvas = document.createElement('canvas')
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')

    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
        const imageUrl = URL.createObjectURL(blob);

        setCapturedImage({
          url: imageUrl,
          file: file,
        });



        setShowCamera(false);
      },
      "image/jpeg",
      0.8
    )

  }

  return (
    <div className="container">

      <div className="select_cus">
        <h2>Select Customer</h2>

        <div className="drop_button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          {selectedCustomer?.name || selectedCustomer?.customerName || "Select a customer"}
          <span style={{ marginLeft: 8, display: "inline-flex", verticalAlign: "middle" }}>
            {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </div>

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
                  </div>
                ))
              ) : (
                <div className="no-customers">No matching customers</div>
              )}
            </div>
          </div>
        )}

        {/* Location unavailable */}
        {selectedCustomer && !selectedCustomer.area && (
          <div className="addLocation">
            <div className="location-warning">
              <h3>
                <MdNotListedLocation style={{ color: 'red' }} />
                Store location unavailable
              </h3>
              <p className="message">
                This store does not have a location set yet. To punch in, please set the store's location first.
              </p>
              <AddLocation />
            </div>
          </div>
        )}

        {/* location available label */}
        {selectedCustomer && selectedCustomer.area && (
          <div className="section_punchin">
            <div className="location_available">
              <p>
                <IoLocation style={{ color: '#0bb838' }} />
                Store location available
              </p>
            </div>

            {/* photo capture */}
            {!capturedImage && (
              <div className="photo_section">
                <div className="photo_label">Image :</div>
                <div className="take_button" onClick={() => setShowCamera(true)} >
                  <MdOutlineCameraAlt className="icon" />
                  Take a Photo
                </div>
              </div>
            )}

            {/* Image Preview */}
            {capturedImage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: { duration: 1, delay: 0.2, ease: "backInOut" },
                }}
                className="preview_section" >

                <div className="photo_container">
                  <div className="photo">
                    <img src={capturedImage.url} />
                    {/* <img src={test} alt="" /> */}
                  </div>
                </div>

                <div className="photo_actions">
                  <button className="discard"
                    onClick={() => {
                      if (capturedImage.url)
                        URL.revokeObjectURL(capturedImage.url);
                      setCapturedImage(null);
                    }} >
                    <RiDeleteBinLine />
                    <span>Discard</span>
                  </button>

                  <button className="discard" onClick={() => {

                  }} >
                    <LuSquarePen />
                    <span>Retake  </span></button>
                </div>

                <div className="punchin_button">Punch In</div>

              </motion.div>
            )}

            {/* {selectedCustomer && selectedCustomer.area && capturedImage && (
              <button className="punchin_button">Punch In</button>
            )} */}
          </div>
        )}

      </div>

      {/*Camera modal */}

      {showCamera && (
        <div className="camera_modal">
          <div className="camera_container">

            {/* Camera Controls */}
            <div className="camera_header">

              <button
                onClick={() => setShowCamera(false)}
                className="camera_btn close_btn"
                title="Close"
              >
                <IoCloseCircle />
              </button>

              <button
                onClick={() =>
                  setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
                }
                className="camera_btn"
                title="Switch Camera"
              >
                <IoCameraReverse />
              </button>
            </div>

            {/* Camera Preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera_video"
              style={{
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />

            {/* Capture Button */}
            <div className="camera_footer">
              <button className="capture_btn" onClick={() => capturePhoto()}>
                <LuCamera /> Capture
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};

export default PunchIn;
