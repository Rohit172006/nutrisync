import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { recommendMoodMeals } from '../services/api';

function MoodMeals() {
  const { showToast } = useOutletContext();
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState([]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    if (!mood) return;

    setLoading(true);
    setMeals([]);
    try {
      const data = await recommendMoodMeals(mood);
      if (data.recommended_meals) {
          setMeals(data.recommended_meals);
      }
    } catch(err) {
      showToast(err.response?.data?.error || "Failed finding meals", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content active panel">
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p>Finding meals for a {mood} mood...</p>
        </div>
      )}

      <h2 className="health-title"><i className="fa-solid fa-face-smile"></i> Mood-based Meals</h2>
      <p className="health-subtitle">Get meals designed to boost or match your current vibe.</p>

      <form className="simple-form-group" onSubmit={handleRecommend}>
        <select required style={{ flex: 1 }} value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="" disabled>Select your current mood...</option>
          <option value="energy">Energetic ⚡</option>
          <option value="recovery">Stressed/Tired 😫</option>
          <option value="high_protein">Happy & Active 😊</option>
          <option value="anti_inflammatory">Sore/Achey 🤕</option>
          <option value="muscle_gain">Pumped 💪</option>
        </select>
        <button type="submit">Get Recommendations</button>
      </form>

      <div className="results-area" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {meals.length === 0 && !loading && <div className="empty-msg">Select a mood to see meals...</div>}
        
        {meals.map((m, idx) => (
          <div className="diet-card" style={{ marginTop: 0 }} key={idx}>
            <div className="diet-left">
              <div className="diet-name"><i className="fa-solid fa-bowl-rice"></i> {m.meal_name}</div>
              <div className="diet-cal" style={{ marginTop: '5px' }}>
                <span className="calorie-part" style={{ background: 'rgba(76,175,80,0.1)', color: '#2e7d32' }}>
                  <i className="fa-solid fa-fire-flame-curved" style={{ color: '#2e7d32', paddingRight: '10px' }}></i>
                  {m.calories} kcal
                  {m.protein_g && <span>P:{m.protein_g}g | C:{m.carbs_g}g | F:{m.fat_g}g</span>}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MoodMeals;
