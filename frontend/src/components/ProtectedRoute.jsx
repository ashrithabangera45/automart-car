import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading AutoMart...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/user/login" state={{ from: location.pathname + location.search }} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
