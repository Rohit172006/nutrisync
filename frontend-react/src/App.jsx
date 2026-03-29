import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FoodAnalyzer from './pages/FoodAnalyzer';
import MoodMeals from './pages/MoodMeals';
import FridgeAI from './pages/FridgeAI';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Global toast and modal state can be placed here if Context is favored,
  // but for simplicity, we pass props or rely on component locality where possible.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="food-analyzer" element={<FoodAnalyzer />} />
          <Route path="mood-meals" element={<MoodMeals />} />
          <Route path="fridge-ai" element={<FridgeAI />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
