import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaBox, FaBuilding, FaCog } from 'react-icons/fa';
import { FaMoneyBillWave } from 'react-icons/fa';
import './Navbar.scss';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleNavigation = (route) => {
        if (route === 'company') {
            if (user?.role === 'Admin') {
                navigate('/dashboard/admin');
            } else {
                navigate('/dashboard/user');
            }
        } else {
            navigate(route);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    // Get user initials for avatar
    const getUserInitials = (username) => {
        if (!username) return 'U';
        return username.charAt(0).toUpperCase();
    };

    return (
        <>
            {/* Top Navbar with Profile Dropdown */}
            <div className="top-navbar">
                <div className="profile-dropdown" ref={dropdownRef}>
                    <button 
                        className="profile-button" 
                        onClick={toggleDropdown}
                        aria-label="User menu"
                    >
                        <div className="profile-avatar">
                            {getUserInitials(user?.username)}
                        </div>
                        <svg 
                            className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                            width="12" 
                            height="12" 
                            viewBox="0 0 12 12"
                        >
                            <path d="M6 8L2 4h8l-4 4z" fill="currentColor" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <div className="user-avatar">
                                    {getUserInitials(user?.username)}
                                </div>
                                <div className="user-info">
                                    <p className="username">{user?.username}</p>
                                    <p className="user-role">{user?.role}</p>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button 
                                className="logout-button" 
                                onClick={handleLogout}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path 
                                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                    <polyline 
                                        points="16,17 21,12 16,7"
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                    <line 
                                        x1="21" 
                                        y1="12" 
                                        x2="9" 
                                        y2="12"
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Navbar */}
            <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                </div>

                <ul className="nav-menu">
                    <li onClick={() => handleNavigation('/item-details')}>
                        <FaBox className="icon" />
                        {isOpen && <span>Item Details</span>}
                    </li>
                    <li onClick={() => handleNavigation('/debtors')}>
                        <FaMoneyBillWave className="icon" />
                        {isOpen && <span>Debtors</span>}
                    </li>

                    <li onClick={() => handleNavigation('company')}>
                        <FaBuilding className="icon" />
                        {isOpen && <span>Company Info</span>}
                    </li>
                    <li onClick={() => handleNavigation('/settings')}>
                        <FaCog className="icon" />
                        {isOpen && <span>Settings</span>}
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Navbar;