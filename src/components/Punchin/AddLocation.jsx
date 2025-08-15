import React, { useState, useEffect } from 'react';
import { MdNotListedLocation } from "react-icons/md";
import './AddLocation.scss'
import { BiCurrentLocation } from 'react-icons/bi';
const AddLocation = ({ customer }) => {
    const [location, setLocation] = useState({ lat: "00.000", lon: "00.000" });
    const [error, setError] = useState('');


    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition((pos) => {
            setLocation({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
            });
            setError('')
        },
            (err) => {
                setError(err.message);
            })
    }


    useEffect(() => {

    }, [])

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
                    <BiCurrentLocation className="icon-geo" />
                    <span>Fetch via Geolocation</span>
                </div>

                <div className="map">

                </div>
                <div className="fetch-current-btn" onClick={() => { getLocation() }}>
                    <BiCurrentLocation className='icon' />
                    Fetch Current Location
                </div>

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