import React, { useEffect, useState } from 'react';
import './Debtors.scss';

const Debtors = () => {
    const [debtors, setDebtors] = useState([]);

    // Dummy data for demonstration
    useEffect(() => {
        const sampleDebtors = [
            { id: 1, name: 'ABC Traders', amount: 5000 },
            { id: 2, name: 'XYZ Pvt Ltd', amount: 12000 },
            { id: 3, name: 'Global Exports', amount: 8000 },
        ];
        setDebtors(sampleDebtors);
    }, []);

    return (
        <div className='all-body'>
        <div className="debtors-container">
            <h2>Debtors List</h2>
            
        </div></div>
    );
};

export default Debtors;
