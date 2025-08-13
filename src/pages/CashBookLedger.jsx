import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Debtors.scss'; // Reusing existing modal and table styles

const CashBookLedger = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [ledgerData, setLedgerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const { accountCode, accountName } = location.state || {};

    useEffect(() => {
        if (!accountCode) {
            setError('No account code provided');
            setLoading(false);
            return;
        }

        fetchLedgerData();
    }, [accountCode]);

    const fetchLedgerData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/get-ledger-details/?account_code=${accountCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setLedgerData(response.data.data);
            } else {
                setError(response.data.error || 'Failed to fetch ledger details');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch ledger details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toFixed(2);
    };

    const handleBackClick = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div className="all-body">
            <div className="debtors-container">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button 
                        onClick={handleBackClick}
                        style={{
                            background: '#1976d2',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        ← Back to Cash Book
                    </button>
                    <h2>Cash Ledger Details - {accountName} ({accountCode})</h2>
                </div>

                {error && <div className="error">{error}</div>}
                {loading && <div className="loading">Loading ledger details...</div>}

                {!loading && ledgerData.length === 0 && !error && (
                    <p className="no-data">No ledger entries found for this cash account.</p>
                )}

                {!loading && ledgerData.length > 0 && (
                    <div className="table-container">
                        <div className="table-wrapper">
                            <table className="debtors-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Particulars</th>
                                        <th>Voucher No</th>
                                        <th>Mode</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                        <th>Narration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerData.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(entry.entry_date)}</td>
                                            <td className="particulars-cell">{entry.particulars || 'N/A'}</td>
                                            <td className="voucher-cell">{entry.voucher_no || 'N/A'}</td>
                                            <td className="mode-cell">{entry.entry_mode || 'N/A'}</td>
                                            <td className="currency">₹{formatCurrency(entry.debit)}</td>
                                            <td className="currency">₹{formatCurrency(entry.credit)}</td>
                                            <td className="narration-cell">{entry.narration || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashBookLedger;