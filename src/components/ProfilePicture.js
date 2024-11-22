import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePicture = ({ className, profilePictureUrl }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) navigate('/login');

    // Use passed down URL for the profile picture if provided
    if (profilePictureUrl) {
      setProfilePicture(profilePictureUrl);
    } else if (currentUser?.profilePicture?.data) {
      const base64String = `data:image/jpeg;base64,${arrayBufferToBase64(currentUser.profilePicture.data.data)}`;
      setProfilePicture(base64String); // Set base64 image if no URL is passed
    }
  }, [currentUser, loading, navigate, profilePictureUrl]);

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary); // base64 encoding
  };

  return (
    <div className={`relative ${className}`}>
      {profilePicture ? (
        <img
          src={profilePicture}
          alt="Profile"
          className="w-12 h-12 rounded-full bg-gray-200"
        />
      ) : (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 110-8 4 4 0 010 8z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
