import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-grid">
        <div className="footer-info">
          <h2 className="footer-logo"><i className="fa-solid fa-leaf"></i> NutriSync AI</h2>
          <p className="footer-desc">Your intelligent clinical nutrition orchestrator. Bringing ML-driven insights to daily dietary habits for a healthier, balanced life.</p>
        </div>

        <div className="footer-links">
          <h3>Features</h3>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/food-analyzer">Food Analyzer</Link></li>
            <li><Link to="/mood-meals">Mood Meals</Link></li>
            <li><Link to="/fridge-ai">Fridge AI Scanner</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>Support</h3>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-social">
          <h3>Connect</h3>
          <div className="social-icons">
            <a href="#" title="Twitter"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="#" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="#" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" title="GitHub"><i className="fa-brands fa-github"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 NutriSync Labs AI. All rights reserved.</p>
        <p className="disclaimer">NutriSync AI is meant for informational purposes and does not replace professional medical advice.</p>
      </div>
    </footer>
  );
}

export default Footer;
