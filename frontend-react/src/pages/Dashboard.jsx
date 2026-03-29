import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { syncWearable, analyzeManualVitals, shuffleMeal } from '../services/api';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Dashboard() {
  const { showToast } = useOutletContext();
  
  const [loading, setLoading] = useState(false);
  const [loaderMsg, setLoaderMsg] = useState("");

  const [vitals, setVitals] = useState({
    hr: 70, oxy: 98, sleep: 7.5, activity: 45
  });
  
  const [valVitals, setValVitals] = useState({
    hr: '--', oxy: '--', sleep: '--', activity: '--', trendHr: 'Awaiting Sync', trendOxy: 'Awaiting Sync'
  });

  const [waterIntake, setWaterIntake] = useState(() => parseInt(localStorage.getItem('waterIntake')) || 0);
  
  const [stressAlert, setStressAlert] = useState({
    title: "System Ready",
    desc: "Sync wearable or input data to begin analysis.",
    className: "stress-ok",
    icon: "fa-check"
  });

  const [dietPlan, setDietPlan] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Fluctuations
  const liveSyncRef = useRef(null);

  const startLiveFluctuation = (baseHr, baseOxy) => {
    if (liveSyncRef.current) clearInterval(liveSyncRef.current);
    
    setValVitals(prev => ({
      ...prev, hr: baseHr, oxy: baseOxy, trendHr: 'Live 🟢', trendOxy: 'Live 🟢'
    }));

    liveSyncRef.current = setInterval(() => {
      const hrDiff = Math.floor(Math.random() * 5) - 2;
      const oxyDiff = Math.random() > 0.8 ? (Math.floor(Math.random() * 2) - 1) : 0;
      
      setValVitals(prev => ({
        ...prev, 
        hr: prev.hr !== '--' ? parseInt(prev.hr) + hrDiff : baseHr,
        oxy: prev.oxy !== '--' ? Math.max(93, Math.min(100, parseInt(prev.oxy) + oxyDiff)) : baseOxy
      }));
    }, 2000);
  };

  useEffect(() => {
    return () => { if (liveSyncRef.current) clearInterval(liveSyncRef.current); };
  }, []);

  const handleWaterClick = () => {
    if (waterIntake < 8) {
      const newWater = waterIntake + 1;
      setWaterIntake(newWater);
      localStorage.setItem('waterIntake', newWater);
      showToast("Awesome! Keep hydrating 💧", "success");
    } else {
      showToast("Daily water goal reached! 🎉", "success");
    }
  };

  const updateUI = (data, p_hr, p_oxy, p_sleep, p_act) => {
    setValVitals(prev => ({
      ...prev,
      sleep: p_sleep,
      activity: p_act
    }));

    const sp = data.stress_prediction || {};
    let iconClass = "fa-check";
    let alertClass = "stress-ok";
    let alertTitle = sp.stress_level || "Normal";
    let alertDesc = "Your physiological signs are stable.";

    if (alertTitle.includes("High")) {
      alertClass = "stress-alert";
      iconClass = "fa-triangle-exclamation";
      alertDesc = "Elevated stress detected from your vitals. AI has modified your diet to support recovery.";
    } else if (alertTitle.includes("Moderate")) {
      alertClass = "stress-warning";
      iconClass = "fa-bolt";
      alertDesc = "Moderate physical stress. Keep hydrated and follow the suggested meal plan.";
    }
    setStressAlert({ title: `AI Prediction: ${alertTitle}`, desc: alertDesc, className: alertClass, icon: iconClass });

    if (data.nutrition_plan && data.nutrition_plan.meals) {
      setDietPlan(data.nutrition_plan);
    }

    setChartData({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
      datasets: [{
        label: 'Avg Heart Rate (BPM)',
        data: [75, 78, 76, 73, 76, 78, p_hr],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2e7d32',
        pointRadius: 4
      }]
    });
  };

  const handleWearableSync = async () => {
    setLoaderMsg("Syncing wearable devices & predicting stress...");
    setLoading(true);
    try {
      const data = await syncWearable();
      setVitals({ hr: 75, oxy: 98, sleep: 7.5, activity: 45 }); // Mock sync
      updateUI(data, 75, 98, 7.5, 45);
      startLiveFluctuation(75, 98);
      showToast("Device synced & plan generated!");
    } catch (e) {
      showToast(e.response?.data?.error || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualVitals = async (e) => {
    e.preventDefault();
    setLoaderMsg("Running ML model & generating LLM response...");
    setLoading(true);
    try {
      const payload = {
        resting_hr: vitals.hr, spo2: vitals.oxy, sleep_hours: vitals.sleep, activity_minutes: vitals.activity
      };
      const data = await analyzeManualVitals(payload);
      updateUI(data, vitals.hr, vitals.oxy, vitals.sleep, vitals.activity);
      startLiveFluctuation(vitals.hr, vitals.oxy);
      showToast("AI Analysis Complete!");
    } catch(e) {
      showToast(e.response?.data?.error || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = async (type, mealCalPct) => {
    try {
      const targetCals = dietPlan?.calorieTarget || 2000;
      const mealCals = Math.round(targetCals * mealCalPct);
      const data = await shuffleMeal(type, mealCals);
      if (data.meal) {
        setDietPlan(prev => ({
          ...prev,
          meals: {
            ...prev.meals,
            [type]: data.meal
          }
        }));
      }
    } catch(err) {
      showToast("Error shuffling meal.", "error");
    }
  };

  return (
    <div className="tab-content active" id="tab-dashboard">
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p>{loaderMsg}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="cards-row">
        <div className="metric-card heart-rate">
          <div className="metric-header"><i className="fa-solid fa-heart-pulse"></i> Heart Rate</div>
          <div className="metric-value"><span className={`val-display ${valVitals.hr !== '--' ? 'value-pulse' : ''}`}>{valVitals.hr}</span> <span className="metric-unit">bpm</span></div>
          <div className="trend">{valVitals.trendHr}</div>
        </div>
        <div className="metric-card spotwo">
          <div className="metric-header"><i className="fa-solid fa-lungs"></i> SpO₂</div>
          <div className="metric-value"><span className={`val-display ${valVitals.oxy !== '--' ? 'value-pulse' : ''}`}>{valVitals.oxy}</span> <span className="metric-unit">%</span></div>
          <div className="trend">{valVitals.trendOxy}</div>
        </div>
        <div className="metric-card activity-metric">
          <div className="metric-header"><i className="fa-solid fa-person-running"></i> Activity</div>
          <div className="metric-value"><span>{valVitals.activity}</span> <span className="metric-unit">min</span></div>
          <div className="trend">Awaiting Sync</div>
        </div>
        <div className="metric-card sleep-intake">
          <div className="metric-header"><i className="fa-solid fa-moon"></i> Sleep</div>
          <div className="metric-value"><span>{valVitals.sleep}</span> <span className="metric-unit">h</span></div>
          <div className="trend">Awaiting Sync</div>
        </div>
        <div className="metric-card water-intake" style={{ cursor: 'pointer', position: 'relative' }} onClick={handleWaterClick} title="Click to drink water!">
          <div className="metric-header" style={{ position: 'relative', zIndex: 2 }}><i className="fa-solid fa-glass-water"></i> Hydration</div>
          <div className="metric-value" style={{ position: 'relative', zIndex: 2 }}><span>{waterIntake}</span> <span className="metric-unit">/ 8 glasses</span></div>
          <div className="trend" style={{ position: 'relative', zIndex: 2 }}>Click to add +1</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${Math.min((waterIntake/8)*100, 100)}%`, background: 'rgba(255,255,255,0.3)', borderRadius: '18px', transition: 'height 0.4s ease-out', zIndex: 1 }}></div>
        </div>
      </div>

      {/* Health Section */}
      <div className="user-data">
        <div className="health-section">
          <h2 className="health-title">Your Health Overview ✨</h2>
          <p className="health-subtitle">Powered by NutriSync AI Engine</p>

          <div className="alert-container">
            <div className={`alert-card ${stressAlert.className}`}>
              <div className="alert-icon"><i className={`fa-solid ${stressAlert.icon}`}></i></div>
              <div className="alert-title-desc">
                <div className="alert-title" style={{ margin: '2px 0px' }}>{stressAlert.title}</div>
                <div className="alert-desc">{stressAlert.desc}</div>
              </div>
            </div>
          </div>

          {chartData && (
            <div className="chart-container" style={{ marginTop: '20px', marginBottom: '25px', padding: '20px', background: '#fff', borderRadius: '18px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#444' }}>
                <i className="fa-solid fa-chart-line" style={{ color: 'var(--green-main)', marginRight: '8px' }}></i>
                Vitals History (7-Day Trend)
              </h3>
              <div style={{ height: '120px', width: '100%', position: 'relative' }}>
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 40, max: 130 } } }} />
              </div>
            </div>
          )}

          <div className="health-form">
            <h3>Update Health Data</h3>
            <form onSubmit={handleManualVitals}>
              <div className="form-grid">
                <div className="form-group"><label>Resting HR (bpm)</label><input type="number" required value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} /></div>
                <div className="form-group"><label>SpO2 (%)</label><input type="number" required value={vitals.oxy} onChange={e => setVitals({...vitals, oxy: e.target.value})} /></div>
                <div className="form-group"><label>Sleep (hours)</label><input type="number" step="0.1" required value={vitals.sleep} onChange={e => setVitals({...vitals, sleep: e.target.value})} /></div>
                <div className="form-group"><label>Activity (mins)</label><input type="number" required value={vitals.activity} onChange={e => setVitals({...vitals, activity: e.target.value})} /></div>
              </div>
              <div style={{ display: 'flex' }}>
                <button type="button" className="generate-btn sync-btn" onClick={handleWearableSync}>
                  <i className="fa-solid fa-rotate"></i> Auto-Sync Wearable
                </button>
                <button type="submit" className="generate-btn">
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Analyze & Generate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Diet Plan */}
      {dietPlan && (
        <div className="diet-column">
          <h3 style={{ color: '#2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><i className="fa-solid fa-utensils"></i> Suggested AI Diet</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="export-btn" style={{ background: '#1565C0', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 500 }}>
                <i className="fa-solid fa-cart-shopping"></i> <span>Grocery List</span>
              </button>
              <button className="export-btn" onClick={() => window.print()} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 500 }}>
                <i className="fa-solid fa-file-pdf"></i> Export Plan
              </button>
              <span style={{ fontSize: '14px', fontWeight: 'normal', background: '#e8f5e9', padding: '5px 15px', borderRadius: '20px' }}>
                Target: <b>{dietPlan.calorieTarget || 2000}</b> kcal
              </span>
            </div>
          </h3>

          {/* Meals */}
          {['breakfast', 'lunch', 'dinner'].map((type, idx) => {
            const m = dietPlan.meals[type];
            if (!m) return null;
            const pct = type === 'breakfast' ? 0.25 : type === 'lunch' ? 0.40 : 0.35;
            const fallbackCal = Math.round((dietPlan.calorieTarget || 2000) * pct);
            const cal = m.calories || fallbackCal;
            
            return (
              <div className="diet-card" key={type}>
                <div className="diet-left">
                  <img src={type === 'breakfast' ? './images/breakfast.png' : type === 'lunch' ? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80' : './images/vegetarian.png'} alt={type} className="food-img"/>
                  <div className="diet-info">
                    <div className="diet-name" style={{textTransform:'capitalize'}}>
                       <i className={`fa-solid ${type === 'breakfast' ? 'fa-cloud-sun' : type === 'lunch' ? 'fa-bowl-food' : 'fa-moon'}`}></i> {type}
                    </div>
                    <div className="diet-cal">
                      <span className="food-name">{m.meal_name || 'Healthy Selection'}</span>
                      <span className="calorie-part">
                        <i className="fa-solid fa-fire-flame-curved"></i> {cal} kcal
                        {m.protein_g && <span>P:{m.protein_g}g | C:{m.carbs_g}g | F:{m.fat_g}g</span>}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="diet-button" style={{ background: '#fff3e0', color: '#e65100', padding: '10px 15px' }} title="View Recipe"><i className="fa-solid fa-fire-burner"></i></button>
                  <button className="diet-button" onClick={() => handleShuffle(type, pct)} style={{ background: '#f1f8f1', color: '#2e7d32', padding: '10px 15px' }} title="Shuffle Meal"><i className="fa-solid fa-shuffle"></i></button>
                  <button className="diet-button btn-why"><i className="fa-regular fa-message"></i> why this plan?</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
