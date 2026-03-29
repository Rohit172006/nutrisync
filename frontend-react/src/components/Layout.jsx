import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

function Layout({ isDarkMode, toggleTheme }) {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  return (
    <div className="dashboard">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} showToast={showToast} />
      
      {/* Route Content goes here */}
      <Outlet context={{ showToast }} />
      
      <Footer />
      <ChatWidget />

      {/* Global Toast */}
      {toast.visible && (
        <div className={`toast show ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Layout;
