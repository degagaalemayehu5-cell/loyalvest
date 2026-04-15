import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUser, FiSettings } from 'react-icons/fi';

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/profit', icon: FiTrendingUp, label: 'Profit' },
    { path: '/account', icon: FiUser, label: 'Account' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;