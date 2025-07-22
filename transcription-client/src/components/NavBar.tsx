import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../supabase/supabaseClient';
import './NavBar.css';

const NavBar: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Voice Transcriber</Link>
      </div>
      <div className="navbar-links">
        {!user ? (
          <>
            <Link to="/register">הרשמה</Link>
            <Link to="/login">התחברות</Link>
          </>
        ) : (
          <button onClick={handleLogout}>יציאה</button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
