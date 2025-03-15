import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => 
          `sidebar-item ${isActive ? 'active' : ''}`} end>
          Dashboard
        </NavLink>
        <NavLink to="/portfolio" className={({ isActive }) => 
          `sidebar-item ${isActive ? 'active' : ''}`}>
          Portfolio
        </NavLink>
        <NavLink to="/trade" className={({ isActive }) => 
          `sidebar-item ${isActive ? 'active' : ''}`}>
          Trade
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => 
          `sidebar-item ${isActive ? 'active' : ''}`}>
          Trade History
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
