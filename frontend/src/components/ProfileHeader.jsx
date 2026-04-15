import React from 'react';

const ProfileHeader = ({ user }) => {
  // Generate random avatar from UI Avatars
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff&bold=true&size=64`;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pt-8 pb-12 px-4">
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={user?.name}
          className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
        />
        <div>
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <p className="text-blue-100 text-sm">Level: {user?.level}</p>
          <p className="text-blue-100 text-xs mt-1">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;