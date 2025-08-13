import React, { useState } from 'react';

const AddLocation = ({ onAdd }) => {
    const [locationName, setLocationName] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!locationName || !address || !latitude || !longitude) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        const newLocation = {
            name: locationName,
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        };
        if (onAdd) onAdd(newLocation);
        setLocationName('');
        setAddress('');
        setLatitude('');
        setLongitude('');
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
            <h2>Add Location</h2>
        
        </div>
    );
};

export default AddLocation;