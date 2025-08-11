import React, { useState } from 'react'
import './punchin.scss'

// Sample customer data for demonstration
const filteredCustomers = [
    { id: 1, name: 'John Doe', area: 'Downtown' },
    { id: 2, name: 'Jane Smith', area: 'Uptown' },
    { id: 3, customerName: 'Acme Corp', area: 'Industrial Park' },
];

const PunchIn = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className='container'>

            {/* select Customer */}
            <div className='select_cus'>
                <h2 > Customers:</h2>

                <div className="drop_button">
                    <div
                        className=''
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        {"Select a customer"}
                    </div>
                </div>

                {dropdownOpen && (
                    <div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className=""
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus />
                       
                    <div className="customer-list">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <div
                                    key={customer.id || customer._id}
                                    onClick={() => {
                                        setSelectedCustomer(
                                            customer.name ||
                                            customer.customerName ||
                                            "Unnamed Customer"
                                        );
                                        setSelectedCustomerLocation(customer.area);
                                        setDropdownOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className="customer"
                                >
                                    {customer.name || customer.customerName || "Unnamed Customer"}
                                </div>
                            ))
                        ) : (
                            <div className="no-customers">
                                No matching customers
                            </div>
                        )}
                    </div>

                    </div>
                )}

            </div>
        </div>
    )
}

export default PunchIn