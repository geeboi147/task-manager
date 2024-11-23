import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';  // Use named import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For handling errors

  // On page load, check if token exists and validate it
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to check expiry
        const decoded = jwtDecode(token);  // Decode token using named import
        const currentTime = Date.now() / 1000; // in seconds
        if (decoded.exp < currentTime) {
          throw new Error('Token expired');
        }

        // If token is valid, proceed to validate the user
        axios
          .get('https://task-manager-backend-2-5ejn.onrender.com/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setCurrentUser(response.data);
          })
          .catch((err) => {
            console.error('Authentication check failed:', err);
            localStorage.removeItem('token'); // Clear the invalid token
            setError('Session expired or invalid token');
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        localStorage.removeItem('token'); // Clear the invalid token
        setError('Session expired or invalid token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (token) => {
    try {
      localStorage.setItem('token', token);
      const response = await axios.get('https://task-manager-backend-2-5ejn.onrender.com/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // If loading, show a spinner or loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If error occurred, show an error message
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
