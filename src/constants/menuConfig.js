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
export const MENU_CONFIG = [
    {
        id: 'item-details',
        type: MENU_TYPES.SIMPLE,
        label: 'Item Details',
        icon: FaBox,
        route: '/item-details',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER], // Available to all roles
        order: 1
    },
    {
        id: 'bank-cash',
        type: MENU_TYPES.DROPDOWN,
        label: 'Bank & Cash',
        icon: FaUniversity,
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
        order: 2,
        children: [
            {
                id: 'cash-book',
                label: 'Cash Book',
                icon: FaMoneyBillWave,
                route: '/cash-book',
                roles: [USER_ROLES.ADMIN, USER_ROLES.USER]
            },
            {
                id: 'bank-book',
                label: 'Bank Book',
                icon: FaUniversity,
                route: '/bank-book',
                roles: [USER_ROLES.ADMIN, USER_ROLES.USER]
            }
        ]
    },
    {
        id: 'debtors',
        type: MENU_TYPES.SIMPLE,
        label: 'Debtors',
        icon: FaMoneyBillWave,
        route: '/debtors',
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
        order: 3
    },
    {
        id: 'company',
        type: MENU_TYPES.SIMPLE,
        label: 'Company Info',
        icon: FaBuilding,
        route: 'company', // Special handling in component
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
        order: 4
    },
    {
        id: 'punch-in',
        type: MENU_TYPES.DROPDOWN,
        label: 'Punch In',
        icon: FaFingerprint,
        roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
        order: 5,
        children: [
            {
                id: 'location-capture',
                label: 'Location Capture',
                icon: FaMapMarkerAlt,
                route: '/punch-in/location',
                roles: [USER_ROLES.ADMIN, USER_ROLES.USER]
            },
            {
                id: 'punch-in-action',
                label: 'Punch In',
                icon: FaFingerprint,
                route: '/punch-in',
                roles: [USER_ROLES.ADMIN, USER_ROLES.USER]
            }
        ]
    },
    {
        id: 'master',
        type: MENU_TYPES.DROPDOWN,
        label: 'Master',
        icon: FaCog,
        roles: [USER_ROLES.ADMIN], // Admin only
        order: 6,
        children: [
            {
                id: 'user-menu',
                label: 'User Management',
                icon: FaTable,
                route: '/master/users',
                roles: [USER_ROLES.ADMIN]
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: FaCog,
                route: '/settings',
                roles: [USER_ROLES.ADMIN]
            }
        ]
    }
];

// Helper function to get menu items by role
export const getMenuItemsByRole = (userRole) => {
    // If no userRole provided, default to 'user'
    const role = userRole || 'user';

    const filteredItems = MENU_CONFIG
        .filter(item => item.roles.includes(role))
        .map(item => ({
            ...item,
            children: item.children?.filter(child => child.roles.includes(role))
        }))
        .sort((a, b) => a.order - b.order);

    // If no items match, return basic menu items for 'user' role
    if (filteredItems.length === 0 && role !== 'user') {
        return getMenuItemsByRole('user');
    }

    return filteredItems;
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

export const getMenuItemsByAllowedRoutes = (allowedRoutes = []) => {
    // if(!allowedRoutes || allowedRoutes.length==0)return []

    const filterByRoutes = (item) => {
        if (item.route && allowedRoutes.includes(item.route)) {
            return true;
        }

        if (item.children) {
            item.children = item.children.filter(child =>
                child.route && allowedRoutes.includes(child.route)
            );
            return item.children.length > 0;
        }
        return false ;
    }
    return MENU_CONFIG.filter(filterByRoutes).sort((a,b)=>a.order -b.order)

}

// Icons for chevron states
export const CHEVRON_ICONS = {
    OPEN: FaChevronDown,
    CLOSED: FaChevronRight
};