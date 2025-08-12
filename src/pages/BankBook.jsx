import React, { useEffect, useState } from "react";
import './BankBook.scss';
import axios from "axios";

function BankBook() {
  const [bankData, setBankData] = useState([]);
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
      .get("http://127.0.0.1:8000/api/get-bank-book-data/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setBankData(response.data.data);
        } else {
          setError(response.data.error || "Failed to load bank book data");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bank-book-container">
        <div className="loading">Loading bank book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bank-book-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="bank-book-container">
      <h1>Bank Book</h1>
      {bankData.length === 0 ? (
        <div className="no-data">No bank records found.</div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="bank-book-table">
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
                {bankData.map((item, index) => (
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

export default BankBook;