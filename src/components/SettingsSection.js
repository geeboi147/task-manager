// src/components/SettingsSection.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePicture from './ProfilePicture'; // Import the ProfilePicture component

const SettingsSection = () => {
  const { currentUser, setCurrentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [, setProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!currentUser) navigate('/login');
  }, [currentUser, loading, navigate]);

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

    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }

    if (file.size > maxSize) {
      setErrorMessage('File size exceeds the 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePicture(base64String); // Show the selected image before uploading
    };

    reader.readAsDataURL(file);

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
      setProfilePicture(data.profilePicture.data); // Assuming binary data is returned
      setCurrentUser(data.user); // Update the context with the new user data

      alert('Profile picture updated successfully!');
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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

          {/* Display Profile Picture */}
          <ProfilePicture className="relative w-24 h-24" />

          {/* Upload Button */}
          <label className="cursor-pointer inline-flex items-center space-x-2 mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <span className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {isUploading ? 'Uploading...' : 'Upload Picture'}
            </span>
          </label>
        </div>
      </section>

      {/* Other settings content */}
    </div>
  );
};

export default SettingsSection;
