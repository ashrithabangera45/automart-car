import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCars from './pages/admin/ManageCars';
import CarForm from './pages/admin/CarForm';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Home from './pages/Home';
import AdminRegister from './pages/admin/AdminRegister';
import Profile from './pages/Profile';
import ServiceSupport from './pages/ServiceSupport';
import UserIssues from './pages/admin/UserIssues';
import ManageMessages from './pages/admin/ManageMessages';
import ManageFeedback from './pages/admin/ManageFeedback';
import About from './pages/About';
import Contact from './pages/Contact';
import BuyUsedCars from './pages/BuyUsedCars';
import Feedback from './pages/Feedback';
import SellUsedCars from './pages/SellUsedCars';

import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider>
          <ErrorBoundary>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user/login" element={<Login />} />
            <Route path="/user/register" element={<Login initialMode="signup" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/user/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/user/reset-password/:token" element={<ResetPassword />} />
            
            {/* Routes wrapped in UserLayout */}
            <Route element={<UserLayout />}>
                {/* Public routes */}
                <Route path="/cars" element={<Cars />} />
                <Route path="/buy-used-cars" element={<BuyUsedCars />} />
                <Route path="/sell-used-cars" element={<SellUsedCars />} />
                <Route path="/cars/:id" element={<CarDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/feedback" element={<Feedback />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/user/dashboard" element={<Dashboard />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/myorders" element={<MyOrders />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/service" element={<ServiceSupport />} />
                </Route>
            </Route>
            
            {/* Admin Protected Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="cars" element={<ManageCars />} />
                <Route path="cars/add" element={<CarForm />} />
                <Route path="cars/edit/:id" element={<CarForm />} />
                <Route path="orders" element={<ManageOrders />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="issues" element={<UserIssues />} />
                <Route path="messages" element={<ManageMessages />} />
                <Route path="contact-messages" element={<ManageMessages />} />
                <Route path="feedback" element={<ManageFeedback />} />
            </Route>
            
          </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;

