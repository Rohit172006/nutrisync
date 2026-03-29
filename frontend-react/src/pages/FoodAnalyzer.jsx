import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyzeFood } from '../services/api';

function FoodAnalyzer() {
  const { showToast } = useOutletContext();
  const [foodName, setFoodName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeFood(foodName.trim());
      setResult(data);
    } catch(err) {
      showToast(err.response?.data?.error || "Failed to analyze food", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content active panel">
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p>Analyzing macros for {foodName}...</p>
        </div>
      )}

      <h2 className="health-title"><i className="fa-solid fa-magnifying-glass-chart"></i> Smart Food Analyzer</h2>
      <p className="health-subtitle">Check if a specific food works well with your health profile.</p>

      <form className="simple-form-group" onSubmit={handleAnalyze}>
        <input 
            type="text" 
            placeholder="E.g., Grilled Chicken Salad" 
            required 
            value={foodName} 
            onChange={(e) => setFoodName(e.target.value)}
        />
        <button type="submit">Analyze Food</button>
      </form>

      <div className="results-area">
        {!result && !loading && <div className="empty-msg">Waiting for food input...</div>}
        
        {result && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <h3>{result.food}</h3>
              <span className={`verdict-badge ${result.verdict?.includes("NOT") ? "NOT" : result.verdict?.includes("GOOD") ? "GOOD" : "NEUTRAL"}`}>
                {result.verdict}
              </span>
            </div>
            <p style={{ color: '#555', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--green-main)', marginRight: '8px' }}></i>
              {result.reason}
            </p>
            <div className="macro-grid">
              <div className="macro-item"><span className="label">Calories</span><span className="value">{result.macros?.calories || 0}</span></div>
              <div className="macro-item"><span className="label">Protein</span><span className="value">{result.macros?.protein || 0}g</span></div>
              <div className="macro-item"><span className="label">Carbs</span><span className="value">{result.macros?.carbs || 0}g</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FoodAnalyzer;
