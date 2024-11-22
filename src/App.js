import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register'; // Import Register page
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const { currentUser } = useAuth();  // Access the currentUser from context

  return (
    <Routes>
      {/* Default route: Redirect to dashboard if logged in, otherwise to login */}
      <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
      
      {/* Login route: If logged in, redirect to dashboard */}
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
      
      {/* Register route: If logged in, redirect to dashboard */}
      <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />
      
      {/* Dashboard route: Only accessible if logged in */}
      <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>  {/* Wrap the app with the AuthProvider to provide context */}
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
