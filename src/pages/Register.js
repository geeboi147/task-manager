import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    // Client-side validation
    if (!username.trim()) {
      setError('Username is required.');
      setLoading(false);
      return;
    }
  
    if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
  
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://task-manager-backend-2-5ejn.onrender.com'}/api/auth/register`,
        { username, email, password }
      );
  
      console.log('Registration response:', response.data);
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      console.error('Error registering:', err);
  
      // Log detailed error information for debugging
      console.log('Axios Error Details:', {
        message: err.message,
        code: err.code,
        config: err.config,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
  
      // Display a user-friendly error message
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition duration-150"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
