import React, { useEffect, useState } from "react";
import './CashBook.scss';
import axios from "axios";

function CashBook() {
  const [cashData, setCashData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/get-cash-book-data/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setCashData(response.data.data);
        } else {
          setError(response.data.error || "Failed to load cash book data");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cash-book-container">
        <div className="loading">Loading cash book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cash-book-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="cash-book-container">
      <h1>Cash Book</h1>
      {cashData.length === 0 ? (
        <div className="no-data">No cash records found.</div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="cash-book-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Opening Balance</th>
                  <th>Opening Date</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {cashData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.opening_balance}</td>
                    <td>{item.opening_date}</td>
                    <td>{item.debit}</td>
                    <td>{item.credit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashBook;