import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import DashboardAdmin from './pages/Dashboard_admin';
import DashboardUser from './pages/Dashboard_user';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; // Adjust the path if needed
import Debtors from './pages/Debtors';
import PunchIn from './pages/Punchin/PunchIn';

// Separate AppLayout to access location
const AppLayout = () => {
    const location = useLocation();

    // Hide Na  vbar only on login page (you can add more paths here if needed)
    const hideNavbarRoutes = ['/', '/login'];


    return (
        <>
            {/* Show Navbar only when current path is not in hideNavbarRoutes */}
            {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/dashboard/admin"
                    element={
                        <ProtectedRoute>
                            <DashboardAdmin />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/user"
                    element={
                        <ProtectedRoute>
                            <DashboardUser />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/debtors"
                    element={
                        <ProtectedRoute>
                            <Debtors></Debtors>
                        </ProtectedRoute>
                    }
                />

                {/* Punch IN  */}

                <Route
                    path="/punchin"
                    element={
                        <PunchIn />
                    }
                />
            </Routes>
        </>
    );
};

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;
