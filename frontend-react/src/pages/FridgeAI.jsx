import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { processFridgeImage } from '../services/api';

function FridgeAI() {
  const { showToast } = useOutletContext();
  const [step, setStep] = useState('upload'); // 'upload' | 'scanning' | 'results'
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleImage = (file) => {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e) => {
      setStep('scanning');
      setImagePreview(e.target.result);

      // Timeout for visual effect matched with original
      setTimeout(async () => {
        try {
          const data = await processFridgeImage(e.target.result);
          if (data.ingredients) setIngredients(data.ingredients);
          if (data.meal) setRecipe(data.meal);
          setStep('results');
        } catch (err) {
          showToast(err.response?.data?.error || "Error parsing imagery. Please try again.", "error");
          setStep('upload');
        }
      }, 2500);
    };

    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="tab-content active panel" style={{ textAlign: 'center' }}>
      <h2 className="health-title"><i className="fa-solid fa-camera-viewfinder" style={{ color: 'var(--green-main)' }}></i> What's in my Fridge?</h2>
      <p className="health-subtitle">Upload a photo of your fridge or ingredients to instantly get a recipe.</p>

      {step === 'upload' && (
        <div 
            className={`fridge-upload-zone ${dragOver ? 'dragover' : ''}`} 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={onDrop}
        >
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <h3>Drag & Drop or Click to Upload Image</h3>
          <p style={{ color: '#777', fontSize: '14px', marginTop: '8px' }}>Supports JPG, PNG, WEBP (Mock Vision AI)</p>
          <div className="scan-laser"></div>
        </div>
      )}

      {step !== 'upload' && imagePreview && (
        <div style={{ position: 'relative', margin: '20px auto', maxWidth: '400px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
          <img src={imagePreview} style={{ width: '100%', display: 'block' }} alt="Uploaded Fridge" />
          
          {step === 'scanning' && (
            <div className="scanning-overlay" style={{ display: 'block' }}>
              <div className="scanning-laser-vertical"></div>
              <div className="scanning-text">Analyzing Ingredients...</div>
            </div>
          )}
        </div>
      )}

      {step === 'results' && (
        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '15px', fontSize: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Detected Ingredients
          </h3>
          <div id="ingredientChips" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {ingredients.map((ing, i) => (
              <div key={i} className="ingredient-chip" style={{ animationDelay: `${i * 0.1}s` }}>{ing}</div>
            ))}
          </div>

          <h3 style={{ color: '#1f4f1f', marginBottom: '15px', fontSize: '20px' }}>🍳 Recommended Recipe:</h3>
          {recipe && (
             <div className="diet-card" style={{ marginTop: 0 }}>
               <div className="diet-left">
                 <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80" alt="Recipe" className="food-img"/>
                 <div className="diet-info">
                   <div className="diet-name"><i className="fa-solid fa-star"></i> <span>{recipe.meal_name}</span></div>
                   <div className="diet-cal">
                     <span className="calorie-part" style={{ background: 'rgba(76,175,80,0.1)', color: '#2e7d32' }}>
                       <i className="fa-solid fa-fire-flame-curved" style={{ color: '#2e7d32', paddingRight: '10px' }}></i>
                       {recipe.calories || 450} kcal 
                       <span>P:{recipe.protein_g}g | C:{recipe.carbs_g}g | F:{recipe.fat_g}g</span>
                     </span>
                   </div>
                 </div>
               </div>
               <button className="diet-button" style={{ background: '#fff3e0', color: '#e65100', padding: '10px 15px' }} title="View Recipe">
                 <i className="fa-solid fa-fire-burner"></i> View Cooking Temp
               </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FridgeAI;
