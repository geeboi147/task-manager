import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsSection = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (loading) return; // Wait for loading to complete
    if (!currentUser) navigate('/login'); // Redirect if not logged in
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    if (currentUser?.profilePicture?.data) {
      // Convert binary data to base64 string using FileReader instead of Buffer
      const base64String = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(currentUser.profilePicture.data)))}`;
      setProfilePicture(base64String);
    }
  }, [currentUser]);

  const handleToggle = (setter, value) => {
    try {
      setter((prev) => !prev);
      localStorage.setItem(value, !JSON.parse(localStorage.getItem(value) || 'false'));
    } catch (error) {
      console.error(`Failed to update ${value} in localStorage:`, error);
    }
  };

  const handleProfilePictureChange = async (e) => {
    setErrorMessage('');
    if (!currentUser?._id) {
      setErrorMessage('You are not authenticated. Please log in again.');
      navigate('/login');
      return;
    }

    const file = e.target.files[0];
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePicture(base64String); // Set the image as base64 string
    };

    reader.readAsDataURL(file); // Converts the file to base64

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const response = await fetch('http://localhost:5000/api/upload-profile-picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      // Set the new profile picture URL or base64 string returned from the server
      setProfilePicture(`http://localhost:5000${data.profilePicture}`);
      alert('Profile picture updated successfully!');
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent.')) {
      alert('Account deletion functionality to be implemented.');
    }
  };

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Loading...</h2>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Please log in to access settings</h2>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Settings</h2>

      {errorMessage && <div className="text-red-600 mb-4">{errorMessage}</div>}

      <section className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700">Profile Settings</h3>
        <p className="text-gray-600">Name: {currentUser.username}</p>
        <p className="text-gray-600">Email: {currentUser.email}</p>

        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-700">Profile Picture</h4>
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full mt-2 mb-4"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full mt-2 mb-4 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <label className="cursor-pointer inline-flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <span className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {isUploading ? 'Uploading...' : 'Upload Picture'}
            </span>
          </label>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700">Theme</h3>
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => handleToggle(setDarkMode, 'darkMode')}
            className="mr-2"
          />
          Dark Mode
        </label>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700">Email Notifications</h3>
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications((prev) => !prev)}
            className="mr-2"
          />
          Enable email notifications
        </label>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-700">Delete Account</h3>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default SettingsSection;
