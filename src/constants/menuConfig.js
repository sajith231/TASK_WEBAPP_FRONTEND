import {
    FaBox,
    FaUniversity,
    FaMoneyBillWave,
    FaBuilding,
    FaFingerprint,
    FaCog,
    FaMapMarkerAlt,
    FaTable,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';

// Menu item types
export const MENU_TYPES = {
    SIMPLE: 'simple',
    DROPDOWN: 'dropdown'
};

// User roles for role-based menu filtering
export const USER_ROLES = {
    ADMIN: 'Admin',
    USER: 'user'
};

// Menu configuration with hierarchical structure
// Security Note: Routes are mapped internally, users only get menu IDs
export const MENU_CONFIG = [
    {
        id: 'item-details',
        type: MENU_TYPES.SIMPLE,
        label: 'Item Details',
        icon: FaBox,
        route: '/item-details',
        order: 1
    },
    {
        id: 'bank-cash',
        type: MENU_TYPES.DROPDOWN,
        label: 'Bank & Cash',
        icon: FaUniversity,
        order: 2,
        children: [
            {
                id: 'cash-book',
                label: 'Cash Book',
                icon: FaMoneyBillWave,
                route: '/cash-book'
            },
            {
                id: 'bank-book',
                label: 'Bank Book',
                icon: FaUniversity,
                route: '/bank-book'
            }
        ]
    },
    {
        id: 'debtors',
        type: MENU_TYPES.SIMPLE,
        label: 'Debtors',
        icon: FaMoneyBillWave,
        route: '/debtors',
        order: 3
    },
    {
        id: 'company',
        type: MENU_TYPES.SIMPLE,
        label: 'Company Info',
        icon: FaBuilding,
        route: 'company', // Special handling in component
        order: 4
    },
    {
        id: 'punch-in',
        type: MENU_TYPES.DROPDOWN,
        label: 'Punch In',
        icon: FaFingerprint,
        order: 5,
        children: [
            {
                id: 'location-capture',
                label: 'Location Capture',
                icon: FaMapMarkerAlt,
                route: '/punch-in/location'
            },
            {
                id: 'punch-in-action',
                label: 'Punch In',
                icon: FaFingerprint,
                route: '/punch-in'
            }
        ]
    },
    {
        id: 'master',
        type: MENU_TYPES.DROPDOWN,
        label: 'Master',
        icon: FaCog,
        order: 6,
        children: [
            {
                id: 'user-menu',
                label: 'User Management',
                icon: FaTable,
                route: '/master/users'
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: FaCog,
                route: '/settings'
            }
        ]
    }
];

// Helper function to get menu items by allowed menu IDs (Secure approach)
export const getMenuItemsByAllowedIds = (allowedMenuIds = []) => {
    if (!allowedMenuIds || allowedMenuIds.length === 0) {
        return [];
    }

    const filterByIds = (item) => {
        // Create a copy to avoid mutating the original
        const itemCopy = { ...item };
        
        // Check if item ID is allowed
        const isAllowed = allowedMenuIds.includes(item.id);
        
        // If item has children, filter them
        if (item.children) {
            const filteredChildren = item.children.filter(child =>
                allowedMenuIds.includes(child.id)
            );
            
            // Include parent if it has allowed children
            if (filteredChildren.length > 0) {
                itemCopy.children = filteredChildren;
                return itemCopy;
            }
        }
        
        // Return item if it's allowed
        if (isAllowed) {
            return itemCopy;
        }
        
        return null;
    };
    
    return MENU_CONFIG
        .map(filterByIds)
        .filter(item => item !== null)
        .sort((a, b) => a.order - b.order);
};

// Helper function to get route by menu ID (Security mapping)
export const getRouteById = (menuId) => {
    // Search top-level items
    for (const item of MENU_CONFIG) {
        if (item.id === menuId && item.route) {
            return item.route;
        }
        // Search children
        if (item.children) {
            for (const child of item.children) {
                if (child.id === menuId && child.route) {
                    return child.route;
                }
            }
        }
    }
    return null;
};

// Helper function to check if menu ID is valid and allowed
export const isMenuIdAllowed = (menuId, allowedMenuIds = []) => {
    return allowedMenuIds.includes(menuId);
};

// Helper function to get all menu IDs for validation
export const getAllMenuIds = () => {
    const menuIds = [];
    
    MENU_CONFIG.forEach(item => {
        menuIds.push(item.id);
        if (item.children) {
            item.children.forEach(child => {
                menuIds.push(child.id);
            });
        }
    });
    
    return menuIds;
};

// Helper function to get all routes for validation
export const getAllRoutes = () => {
    const routes = [];

    MENU_CONFIG.forEach(item => {
        if (item.route) {
            routes.push(item.route);
        }
        if (item.children) {
            item.children.forEach(child => {
                if (child.route) {
                    routes.push(child.route);
                }
            });
        }
    });

    return routes;
};

// Backward compatibility: Filter by routes (Less secure, kept for compatibility)
export const getMenuItemsByAllowedRoutes = (allowedRoutes = []) => {
    if (!allowedRoutes || allowedRoutes.length === 0) {
        return [];
    }

    const filterByRoutes = (item) => {
        // Create a copy of the item to avoid mutating the original
        const itemCopy = { ...item };
        
        // Check if item has a direct route that's allowed
        const hasAllowedRoute = item.route && allowedRoutes.includes(item.route);
        
        // Check if item has children
        if (item.children) {
            // Filter children that have allowed routes
            const filteredChildren = item.children.filter(child =>
                child.route && allowedRoutes.includes(child.route)
            );
            
            // If there are allowed children, include the parent with filtered children
            if (filteredChildren.length > 0) {
                itemCopy.children = filteredChildren;
                return itemCopy;
            }
        }
        
        // Return the item if it has an allowed route
        if (hasAllowedRoute) {
            return itemCopy;
        }
        
        return null;
    };
    
    return MENU_CONFIG
        .map(filterByRoutes)
        .filter(item => item !== null)
        .sort((a, b) => a.order - b.order);
};

// Icons for chevron states
export const CHEVRON_ICONS = {
    OPEN: FaChevronDown,
    CLOSED: FaChevronRight
};

// Helper function to check if a route is allowed
export const isRouteAllowed = (route, allowedRoutes = []) => {
    return allowedRoutes.includes(route);
};