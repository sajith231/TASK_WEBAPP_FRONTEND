import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    // Check if both user data and token exist
    if (!user || !user.client_id || !token) {
        // Clear any partial data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return <Navigate to="/" replace />;
    }
    
    return children;
};

export default ProtectedRoute;