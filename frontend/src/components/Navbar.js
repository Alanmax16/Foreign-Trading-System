import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Foreign Trading System
      </Link>
      <div className="navbar-nav">
        {user ? (
          <>
            <span className="user-name">Welcome, {user.name}</span>
            <button onClick={logout} className="btn btn-primary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
