

import React, { useState } from "react";
import "./punchin.scss";
import AddLocation from "../../components/Punchin/AddLocation";

const customers = [
  { id: 1, name: "John Doe", area: "" },
  { id: 2, name: "Jane Smith", area: "Uptown" },
  { id: 3, customerName: "Acme Corp", area: "" }, 
];

const PunchIn = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filtered = customers.filter((c) =>
    (c.name || c.customerName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div className="select_cus">
        <h2>Customers:</h2>

        <div className="drop_button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          {selectedCustomer?.name || selectedCustomer?.customerName || "Select a customer"}
        </div>

        {dropdownOpen && (
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />

            <div className="customer-list">
              {filtered.length > 0 ? (
                filtered.map((customer) => (
                  <div
                    key={customer.id}
                    className="customer"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {customer.name || customer.customerName || "Unnamed Customer"}
                  </div>
                ))
              ) : (
                <div className="no-customers">No matching customers</div>
              )}
            </div>
          </div>
        )}

        {selectedCustomer && !selectedCustomer.area && (
          <div className="addLocation">Add Location
          <AddLocation/>
          </div>
        )}
      </div>
    </div>
  );
};

export default PunchIn;
