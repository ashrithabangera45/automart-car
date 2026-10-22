import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Dynamically route all API calls to the configured VITE_API_URL or VITE_BACKEND_URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('http://localhost:5000/api')) {
      config.url = config.url.replace('http://localhost:5000/api', API_URL);
    } else if (config.url.startsWith('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', BACKEND_URL);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
