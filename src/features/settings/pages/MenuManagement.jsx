import React, { useState, useEffect } from 'react';
import { MENU_CONFIG, getAllMenuIds } from '../../../constants/menuConfig';
import './MenuManagement.scss';
import { SettingsApi } from '../services/settingService';

const MenuManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedMenuIds, setSelectedMenuIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch users from API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await SettingsApi.getUsers();
            console.log("usr data ,",response.users)
            setUsers(response.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to mock data if API fails
            const mockUsers = [
                { id: 1, username: 'john_doe', email: 'john@example.com', role: 'Admin' },
                { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'Sales Rep' },
                { id: 3, username: 'bob_jones', email: 'bob@example.com', role: 'Accountant' },
                { id: 4, username: 'alice_wilson', email: 'alice@example.com', role: 'user' }
            ];
            setUsers(mockUsers);
        } finally {
            setLoading(false);
        }
    };

    // Load user's current menu permissions
    const handleUserSelect = async (userId) => {
        if (!userId) {
            setSelectedUser(null);
            setSelectedMenuIds([]);
            return;
        }

        setLoading(true);
        // Find user by ID (handle both string and number IDs)
        const user = users.find(u => String(u.id) === String(userId));
        
        if (!user) {
            console.error('User not found:', userId);
            setLoading(false);
            return;
        }
        
        setSelectedUser(user);

        try {
            // Fetch user's allowed menu IDs from API
            const response = await SettingsApi.getUserMenus(userId);
            setSelectedMenuIds(response.allowedMenuIds || response.data?.allowedMenuIds || []);
        } catch (error) {
            console.error('Error loading user permissions:', error);
            
        } finally {
            setLoading(false);
        }
    };

    // Toggle menu item selection
    const handleMenuToggle = (menuId) => {
        setSelectedMenuIds(prev => {
            if (prev.includes(menuId)) {
                return prev.filter(id => id !== menuId);
            } else {
                return [...prev, menuId];
            }
        });
        setSaveStatus('');
    };

    // Toggle all children of a parent menu
    const handleParentToggle = (parentItem) => {
        if (!parentItem.children) return;
        
        const childIds = parentItem.children.map(child => child.id);
        const allChildrenSelected = childIds.every(id => selectedMenuIds.includes(id));
        
        setSelectedMenuIds(prev => {
            if (allChildrenSelected) {
                return prev.filter(id => !childIds.includes(id));
            } else {
                const newIds = [...prev];
                childIds.forEach(id => {
                    if (!newIds.includes(id)) {
                        newIds.push(id);
                    }
                });
                return newIds;
            }
        });
        setSaveStatus('');
    };

    // Check if a parent has any selected children
    const hasSelectedChildren = (parentItem) => {
        if (!parentItem.children) return false;
        return parentItem.children.some(child => selectedMenuIds.includes(child.id));
    };

    // Check if all children are selected
    const allChildrenSelected = (parentItem) => {
        if (!parentItem.children) return false;
        return parentItem.children.every(child => selectedMenuIds.includes(child.id));
    };

    // Save menu permissions
    const handleSavePermissions = async () => {
        if (!selectedUser) return;
        
        setLoading(true);
        setSaveStatus('');
        
        try {
            console.log("sle",selectedUser)
            await SettingsApi.updateUserMenus(selectedUser.id, selectedMenuIds);
            
            console.log(`Saved permissions for user ${selectedUser.id}:`, selectedMenuIds);
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            console.error('Error saving permissions:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Render a menu item
    const renderMenuItem = (item) => {
        const isParent = item.children && item.children.length > 0;
        const isSelected = selectedMenuIds.includes(item.id);
        const hasChildren = hasSelectedChildren(item);
        const allSelected = allChildrenSelected(item);

        return (
            <div key={item.id} className="menu-item-wrapper">
                <div className={`menu-item ${isParent ? 'parent-item' : ''}`}>
                    <label className="menu-checkbox">
                        <input
                            type="checkbox"
                            checked={isParent ? allSelected : isSelected}
                            onChange={() => isParent ? handleParentToggle(item) : handleMenuToggle(item.id)}
                            disabled={!selectedUser || loading}
                            className={isParent && hasChildren && !allSelected ? 'indeterminate' : ''}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="menu-label">
                            {item.icon && <item.icon className="menu-icon" />}
                            {item.label}
                            {isParent && (
                                <span className="menu-type-badge">Dropdown</span>
                            )}
                        </span>
                    </label>
                    
                    {isParent && (
                        <span className="children-count">
                            {selectedMenuIds.filter(id => item.children.some(child => child.id === id)).length} / {item.children.length}
                        </span>
                    )}
                </div>

                {isParent && item.children && (
                    <div className="menu-children">
                        {item.children.map(child => (
                            <div key={child.id} className="menu-child-item">
                                <label className="menu-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedMenuIds.includes(child.id)}
                                        onChange={() => handleMenuToggle(child.id)}
                                        disabled={!selectedUser || loading}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="menu-label child-label">
                                        {child.icon && <child.icon className="menu-icon" />}
                                        {child.label}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="all-body">
            <div className="menu-management-container">
                <div className="management-header">
                    <h1>Menu Management</h1>
                    <p className="subtitle">Assign menu access permissions to users</p>
                </div>

                <div className="user-selection-section">
                    <div className="form-group">
                        <label htmlFor="user-select">Select User</label>
                        <select
                            id="user-select"
                            className="user-select"
                            onChange={(e) => handleUserSelect(e.target.value)}
                            value={selectedUser?.id || ''}
                            disabled={loading}
                        >
                            <option value="">-- Select a User --</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.id} {user.role ? `(${user.role})` : ''} {user.accountcode ? `- ${user.accountcode}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedUser && (
                        <div className="user-info-card">
                            <div className="user-info-row">
                                <span className="info-label">User ID:</span>
                                <span className="info-value">{selectedUser.id}</span>
                            </div>
                            <div className="user-info-row">
                                <span className="info-label">Role:</span>
                                <span className={`info-value role-badge ${selectedUser.role ? selectedUser.role.toLowerCase().replace(' ', '-') : 'user'}`}>
                                    {selectedUser.role || 'User'}
                                </span>
                            </div>
                            {selectedUser.accountcode && (
                                <div className="user-info-row">
                                    <span className="info-label">Account Code:</span>
                                    <span className="info-value">{selectedUser.accountcode}</span>
                                </div>
                            )}
                            <div className="user-info-row">
                                <span className="info-label">Client ID:</span>
                                <span className="info-value">{selectedUser.client_id || 'N/A'}</span>
                            </div>
                            <div className="user-info-row">
                                <span className="info-label">Selected Menus:</span>
                                <span className="info-value highlight">{selectedMenuIds.length} menu items</span>
                            </div>
                        </div>
                    )}
                </div>

                {selectedUser && (
                    <div className="menu-items-section">
                        <div className="section-header">
                            <h2>Available Menu Items</h2>
                            <span className="selection-count">
                                {selectedMenuIds.length} of {getAllMenuIds().length} selected
                            </span>
                        </div>

                        {loading && (
                            <div className="loading-overlay">
                                <div className="spinner"></div>
                                <p>Loading permissions...</p>
                            </div>
                        )}

                        <div className="menu-items-list">
                            {MENU_CONFIG.map(item => renderMenuItem(item))}
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={handleSavePermissions}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Permissions'
                                )}
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedMenuIds(getAllMenuIds())}
                                disabled={loading}
                            >
                                Select All
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedMenuIds([])}
                                disabled={loading}
                            >
                                Clear All
                            </button>
                        </div>

                        {saveStatus && (
                            <div className={`save-status ${saveStatus}`}>
                                {saveStatus === 'success' ? (
                                    <>
                                        <span className="status-icon">✓</span>
                                        Permissions saved successfully!
                                    </>
                                ) : (
                                    <>
                                        <span className="status-icon">✗</span>
                                        Error saving permissions. Please try again.
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!selectedUser && (
                    <div className="empty-state">
                        <div className="empty-icon">👤</div>
                        <h3>No User Selected</h3>
                        <p>Please select a user from the dropdown above to manage their menu permissions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuManagement;