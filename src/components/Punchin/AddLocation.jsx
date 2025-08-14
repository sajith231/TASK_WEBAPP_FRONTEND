import React, { useState } from 'react';
import { MdNotListedLocation } from "react-icons/md";
import './AddLocation.scss'
import { BiCurrentLocation } from 'react-icons/bi';
const AddLocation = ({ customer }) => {
    const [locationName, setLocationName] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [error, setError] = useState('');

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     if (!locationName || !address || !latitude || !longitude) {
    //         setError('Please fill in all fields.');
    //         return;
    //     }
    //     setError('');
    //     const newLocation = {
    //         name: locationName,
    //         address,
    //         latitude: parseFloat(latitude),
    //         longitude: parseFloat(longitude),
    //     };
    //     setLocationName('');
    //     setAddress('');
    //     setLatitude('');
    //     setLongitude('');
    // };

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
                            This store does not have a location set yet. To punch in, please set the store's location first.
                        </p>
                    </div>
                </div>
            </div>

            <div className="fetch-current">
                <div className="geo-loc-label">
                    <div className="icon-geo">
                        <BiCurrentLocation />
                    </div>
                    <span>Fetch via Geolocation</span>
                </div>

                <div className="map">

                </div>
                <div className="fetch-current-btn">
                    <BiCurrentLocation />
                    Fetch Current Location
                </div>

                <div className="coordinates">
                    <input type="text" value={"1,2,3,4"} />
                    <input type="text" value={"1,2,3,4"} />

                </div>
            </div>



        </div>
    );
};

export default AddLocation;