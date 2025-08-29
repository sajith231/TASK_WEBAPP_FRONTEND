import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtualized list component for rendering only visible items
const VirtualizedCustomerList = ({ customers, onSelect, searchTerm }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const itemHeight = 50; // Approximate height of each customer item

  useEffect(() => {
    const calculateVisibleRange = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const clientHeight = containerRef.current.clientHeight;
      
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
      const end = Math.min(
        customers.length,
        start + Math.ceil(clientHeight / itemHeight) + 10
      );
      
      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', calculateVisibleRange);
      calculateVisibleRange(); // Initial calculation
      
      return () => container.removeEventListener('scroll', calculateVisibleRange);
    }
  }, [customers.length, itemHeight]);

  // Calculate padding to maintain scroll height
  const topPadding = visibleRange.start * itemHeight;
  const bottomPadding = Math.max(0, (customers.length - visibleRange.end) * itemHeight);

  return (
    <div 
      ref={containerRef} 
      className="customer-list virtualized"
      style={{ overflow: 'auto' }}
    >
      <div style={{ height: topPadding }} />
      {customers.slice(visibleRange.start, visibleRange.end).map((customer) => (
        <div
          key={customer.id}
          className="customer"
          onClick={() => onSelect(customer)}
          style={{ height: itemHeight }}
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
      ))}
      <div style={{ height: bottomPadding }} />
    </div>
  );
};

const StoreLocationCapture = () => {
  // ------------------ State ------------------
  const [customers, setCustomers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ------------------ Fetch Customers ------------------
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await PunchAPI.getFirms();
        setCustomers(response.firms || []);
      } catch (err) {
        console.error("Failed to fetch firms", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // ------------------ Filter Customers with Memoization ------------------
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchTerm) return customers;
    
    return customers.filter((c) => {
      const name = (c.name || c.customerName || c.firm_name || "").toLowerCase();
      return name.includes(debouncedSearchTerm.toLowerCase());
    });
  }, [customers, debouncedSearchTerm]);

  // ------------------ Event Handlers with useCallback ------------------
  const handleCustomerSelect = useCallback((customer) => {
    setSelectedCustomer(customer);
    setDropdownOpen(false);
    setSearchTerm("");
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // ------------------ Render ------------------
  return (
    <div className="container">
      {/* ------------------ Customer Selection ------------------ */}
      <div className="customer_section">
        <h2>Select Customer</h2>

        {/* Dropdown Button */}
        <div 
          className="drop_button" 
          onClick={handleDropdownToggle}
          aria-expanded={dropdownOpen}
        >
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
                onChange={handleSearchChange}
                autoFocus
              />
              {isLoading && <div className="loading-spinner">Loading...</div>}
            </div>

            {filteredCustomers.length > 0 ? (
              <VirtualizedCustomerList 
                customers={filteredCustomers}
                onSelect={handleCustomerSelect}
                searchTerm={debouncedSearchTerm}
              />
            ) : (
              <div className="no-customers">No matching customers</div>
            )}
          </div>
        )}

        {/* Location Handling */}
        {selectedCustomer && (
          <AddLocation customer={selectedCustomer} />
        )}
      </div>
    </div>
  );
};

export default StoreLocationCapture;