import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const updateWishlistCount = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.token) {
            try {
                const res = await axios.get(`${API_URL}/wishlist`, { headers: { Authorization: `Bearer ${storedUser.token}` }});
                setWishlistCount(res.data.length);
            } catch (err) {
                console.error(err);
            }
        } else {
            setWishlistCount(0);
        }
    };

    const updateCartCount = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.token) {
            try {
                const res = await axios.get(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${storedUser.token}` }});
                setCartCount(res.data.length);
            } catch (err) {
                console.error(err);
            }
        } else {
            setCartCount(0);
        }
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to parse user from local storage:', e);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const loginSuccess = (data) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    useEffect(() => {
        if (user) {
            updateCartCount();
            updateWishlistCount();
        } else {
            setCartCount(0);
            setWishlistCount(0);
        }
    }, [user]);

    const updateUserProfile = (updatedData) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            const newUser = { ...storedUser, ...updatedData };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        } catch (e) {
            console.error('Failed to update user profile in context:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginSuccess, logout, loading, cartCount, updateCartCount, wishlistCount, updateWishlistCount, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
