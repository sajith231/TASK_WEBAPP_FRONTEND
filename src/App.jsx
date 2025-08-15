import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import DashboardAdmin from './pages/Dashboard_admin';
import DashboardUser from './pages/Dashboard_user';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Debtors from './pages/Debtors';
import BankBook from "./pages/BankBook";
import CashBook from "./pages/CashBook";
import CashBookLedger from "./pages/CashBookLedger";
import BankBookLedger from "./pages/BankBookLedger";
import PunchIn from './pages/Punchin/PunchIn';
import NotFound from './components/NotFound';

const AppLayout = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/', '/login'];


    return (
        <>
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
                    element={<ProtectedRoute><Debtors /></ProtectedRoute>}
                />
                <Route
                    path="/cash-book"
                    element={<ProtectedRoute><CashBook /></ProtectedRoute>}
                />
                <Route
                    path="/cash-book-ledger"
                    element={<ProtectedRoute><CashBookLedger /></ProtectedRoute>}
                />
                <Route
                    path="/bank-book"
                    element={<ProtectedRoute><BankBook /></ProtectedRoute>}
                />
                <Route
                    path="/bank-book-ledger"
                    element={<ProtectedRoute><BankBookLedger /></ProtectedRoute>}
                />
                <Route
                    path="/punchin"
                    element={<PunchIn />}
                />
                <Route
                    path='/*'
                    element={<NotFound />}
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
