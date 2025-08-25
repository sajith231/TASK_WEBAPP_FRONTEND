import React, { useEffect, useState } from "react";
import "./StoreLocationCapture.scss";

// Components
import AddLocation from "../../components/Punchin/AddLocation";

// Icons
import {
    IoMdArrowDropdown,
    IoMdArrowDropup,
} from "react-icons/io";
import {
    IoSearchSharp,
    IoLocation,
} from "react-icons/io5";
import {
    MdNotListedLocation,
} from "react-icons/md";

// Utils
import { PunchAPI } from "../../api/punchService";

const StoreLocationCapture = () => {
    // ------------------ State ------------------
    const [customers, setCustomers] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // ------------------ Fetch Customers ------------------
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await PunchAPI.getFirms();
                setCustomers(response.firms || []);
            } catch (err) {
                console.error("Failed to fetch firms", err);
            }
        };
        fetchCustomers();
    }, []);

    // ------------------ Filter Customers ------------------
    const filteredCustomers = customers.filter((c) =>
        (c.name || c.customerName || c.firm_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // ------------------ Render ------------------
    return (
        <div className="container">
            {/* ------------------ Customer Selection ------------------ */}
            <div className="customer_section">
                <h2>Select Customer</h2>

                {/* Dropdown Button */}
                <div className="drop_button" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    {selectedCustomer?.name || selectedCustomer?.customerName || "Select a customer"}
                    <span style={{ marginLeft: 8, display: "inline-flex" }}>
                        {dropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                    </span>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <div className="dropdownOpen">
                        <div className="input_section">
                            <span className="search_icon"><IoSearchSharp /></span>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="customer-list">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className="customer"
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setDropdownOpen(false);
                                            setSearchTerm("");
                                        }}
                                    >
                                        {customer.firm_name || customer.customerName || "Unnamed Customer"}
                                        <div className="list_icons">
                                            {customer.latitude ? (
                                                <IoLocation style={{ color: "#0bb838" }} />
                                            ) : (
                                                <MdNotListedLocation style={{ color: "red" }} />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-customers">No matching customers</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Location Handling */}
                {selectedCustomer && !selectedCustomer.latitude && (
                    <AddLocation customer={selectedCustomer} />
                )}
            </div>
        </div>
    );
};

export default StoreLocationCapture;