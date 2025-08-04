import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Debtors.scss';

const Debtors = () => {
    const [debtorsData, setDebtorsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        page_size: 20,
        has_next: false,
        has_previous: false
    });

    useEffect(() => {
        fetchDebtorsData(1);
    }, []);

    const fetchDebtorsData = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://127.0.0.1:8000/api/get-debtors-data/?page=${page}&page_size=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setDebtorsData(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.data.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch debtors data');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            fetchDebtorsData(newPage);
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

    const renderPagination = () => {
        const { current_page, total_pages, has_previous, has_next } = pagination;
        const maxVisiblePages = 5;
        const startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(total_pages, startPage + maxVisiblePages - 1);
        
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="pagination-container">
                <div className="pagination-info">
                    Showing page {current_page} of {total_pages} ({pagination.total_records} total records)
                </div>
                <div className="pagination-controls">
                    <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(1)}
                        disabled={!has_previous}
                    >
                        First
                    </button>
                    <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(current_page - 1)}
                        disabled={!has_previous}
                    >
                        Previous
                    </button>
                    
                    {pages.map(page => (
                        <button
                            key={page}
                            className={`pagination-btn ${page === current_page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(current_page + 1)}
                        disabled={!has_next}
                    >
                        Next
                    </button>
                    <button 
                        className="pagination-btn"
                        onClick={() => handlePageChange(total_pages)}
                        disabled={!has_next}
                    >
                        Last
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading">Loading debtors data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className='all-body'>
            <div className="debtors-container">
                <h2>Debtors Management</h2>
                
                {debtorsData.length === 0 ? (
                    <p className="no-data">No debtor records found.</p>
                ) : (
                    <>
                        <div className="table-container">
    <div className="table-wrapper">
        <table className="debtors-table">
            <thead>
                <tr>
                    <th rowSpan="2">Account Code</th>
                    <th rowSpan="2">Name</th>
                    <th rowSpan="2">Place</th>
                    <th rowSpan="2">Phone</th>
                    <th colSpan="4">Account Master</th>
                    <th colSpan="7">Latest Ledger Entry</th>
                    <th colSpan="4">Latest Invoice</th>
                    {/* <th rowSpan="2">Total Outstanding</th> */}
                </tr>
                <tr>
                    <th>Opening Balance</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Opening Dept</th>
                    <th>Particulars</th>
                    <th>Entry Date</th>
                    <th>Entry Mode</th>
                    <th>Voucher No</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Narration</th>
                    <th>Invoice Date</th>
                    <th>Net Total</th>
                    <th>Paid</th>
                    <th>Bill Ref</th>
                </tr>
            </thead>
            <tbody>
                {debtorsData.map((item, index) => (
                    <tr key={item.code || index}>
                        <td className="account-code">{item.code || 'N/A'}</td>
                        <td className="account-name">{item.name || 'N/A'}</td>
                        <td>{item.place || 'N/A'}</td>
                        <td>{item.phone2 || 'N/A'}</td>
                        
                        {/* Account Master columns */}
                        <td className="currency">₹{formatCurrency(item.opening_balance)}</td>
                        <td className="currency">₹{formatCurrency(item.master_debit)}</td>
                        <td className="currency">₹{formatCurrency(item.master_credit)}</td>
                        <td className="opening-dept">{item.openingdepartment || 'N/A'}</td>
                        
                        {/* Latest Ledger columns */}
                        <td className="particulars">{item.latest_particulars || 'N/A'}</td>
                        <td>{formatDate(item.latest_entry_date)}</td>
                        <td className="entry-mode">{item.latest_entry_mode || 'N/A'}</td>
                        <td className="voucher-no">{item.latest_voucher_no || 'N/A'}</td>
                        <td className="currency">₹{formatCurrency(item.latest_ledger_debit)}</td>
                        <td className="currency">₹{formatCurrency(item.latest_ledger_credit)}</td>
                        <td className="narration">{item.latest_narration || 'N/A'}</td>
                        
                        {/* Latest Invoice columns */}
                        <td>{formatDate(item.latest_invoice_date)}</td>
                        <td className="currency">₹{formatCurrency(item.latest_nettotal)}</td>
                        <td className="currency">₹{formatCurrency(item.latest_paid)}</td>
                        <td className="bill-ref">{item.latest_bill_ref || 'N/A'}</td>
                        
                        {/* Total Outstanding */}
                        {/* <td className={`currency total-outstanding ${parseFloat(item.total_outstanding_balance || 0) > 0 ? 'balance-due' : 'balance-paid'}`}>
                            ₹{formatCurrency(item.total_outstanding_balance)}
                        </td> */}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
                        
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default Debtors;