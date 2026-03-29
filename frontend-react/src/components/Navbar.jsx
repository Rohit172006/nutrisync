import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Navbar({ isDarkMode, toggleTheme, showToast }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={`navbar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="logo"><i className="fa-solid fa-leaf"></i> NutriSync AI</div>
      <div className="lang-selector" style={{ marginLeft: 'auto', marginRight: '20px' }}>
        <select 
            id="langSelect"
            defaultValue="en"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: 'var(--green-main)', cursor: 'pointer' }}
        >
          <option value="en">🇬🇧 EN</option>
          <option value="es">🇪🇸 ES</option>
          <option value="hi">🇮🇳 HI</option>
        </select>
      </div>
      <div className="nav-menu">
        <NavLink to="/dashboard" className={({isActive}) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/food-analyzer" className={({isActive}) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <span>Food Analyzer</span>
        </NavLink>
        <NavLink to="/mood-meals" className={({isActive}) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <span>Mood Meals</span>
        </NavLink>
        <NavLink to="/fridge-ai" className={({isActive}) => `nav-btn ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
          <span>Fridge AI ✨</span>
        </NavLink>
      </div>
      <div className="nav-right">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Dark Mode">
          <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"}></i>
        </button>
        <button className="icon-btn" title="Wearable Connect"><i className="fa-solid fa-clock"></i></button>
        <button className="icon-btn" title="Profile"><i className="fa-regular fa-user"></i></button>
      </div>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(prev => !prev)} title="Menu">
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>
    </nav>
  );
}

export default Navbar;
