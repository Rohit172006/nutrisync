const BASE_URL = 'http://localhost:5000/api';

// Cache AI Explanation globally for Modal
let currentAiExplanation = "Sync data first to generate explanation.";

// Text formatter for highlighting key terms
function formatHighlightedText(text) {
    if (!text) return "";
    const keywords = ["HIGH", "MODERATE", "LOW", "Normal", "stress", "recovery", "optimal", "diabetes",
        "hypertension", "weight loss", "muscle gain", "maintain", "calories",
        "kcal", "protein", "carbs", "carbohydrate", "sodium", "fat", "water"];
    let formattedText = text;
    // Iterate over the keywords and replace them with highlighted span (ignoring case)
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
        formattedText = formattedText.replace(regex, '<span class="highlight">$1</span>');
    });
    return formattedText;
}

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loader = document.getElementById('global-loader');
const loaderMsg = document.getElementById('loader-msg');
const toast = document.getElementById('toast');
const navbar = document.querySelector('.navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navbar.classList.toggle('mobile-open');
    });
}

// Modal Elements
const modal = document.getElementById('explanationModal');
const btnCloseModal = document.getElementById('closeModalBtn');
const modalReason = document.getElementById('modalReason');
const whyBtns = document.querySelectorAll('.btn-why');

// Profile Elements
const btnProfile = document.querySelector('.icon-btn[title="Profile"]');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const formProfile = document.getElementById('formProfile');

// Dark Mode Elements
const btnThemeToggle = document.getElementById('themeToggle');
let isDarkMode = localStorage.getItem('isDarkMode') === 'true';
if (isDarkMode) document.body.setAttribute('data-theme', 'dark');

if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('isDarkMode', isDarkMode);
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        btnThemeToggle.querySelector('i').className = isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
}

// Water Tracker Elements
const waterCard = document.getElementById('waterCard');
const valWater = document.getElementById('valWater');
const waterFill = document.getElementById('waterFill');
let currentWater = parseInt(localStorage.getItem('waterIntake')) || 0;

function updateWaterUI() {
    valWater.innerText = currentWater;
    const pct = Math.min((currentWater / 8) * 100, 100);
    waterFill.style.height = `${pct}%`;
    waterFill.style.background = isDarkMode ? 'rgba(64, 196, 255, 0.2)' : 'rgba(130, 190, 216, 0.4)';
}

if (waterCard) {
    updateWaterUI();
    waterCard.addEventListener('click', () => {
        if (currentWater < 8) {
            currentWater++;
            localStorage.setItem('waterIntake', currentWater);
            updateWaterUI();
            showToast("Awesome! Keep hydrating 💧", "success");
        } else {
            showToast("Daily water goal reached! 🎉", "success");
        }
    });
}

// Values
const vHeart = document.getElementById('valHeart');
const vOxy = document.getElementById('valOxy');
const vActive = document.getElementById('valActivity');
const vSleep = document.getElementById('valSleep');

// Realtime States
let liveSyncInterval = null;
let currentHR = 70;
let currentOxy = 98;

// Forms & Action Buttons
const formVitals = document.getElementById('formVitals');
const btnWearable = document.getElementById('btnWearableSync');
const stressAlerts = document.getElementById('stressAlerts');
const dietContainer = document.getElementById('dietContainer');
const btnExportPdf = document.getElementById('btnExportPdf');
const vitalsChartWrapper = document.getElementById('vitalsChartWrapper');

// Chart initialization
let trendChart = null;

// Tabs logic
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');

        // Output from mobile menu if clicked
        if (navbar.classList.contains('mobile-open')) {
            navbar.classList.remove('mobile-open');
        }
    });
});

// Loaders & Toasts
const showLoader = (msg) => {
    loaderMsg.innerText = msg;
    loader.classList.remove('hidden');
};
const hideLoader = () => loader.classList.add('hidden');

const showToast = (msg, type = "success") => {
    toast.innerText = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
};

// Modal Logic
whyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modalReason.innerHTML = formatHighlightedText(currentAiExplanation);
        modal.style.display = 'flex';
    });
});
btnCloseModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

// Profile Logic
btnProfile.addEventListener('click', async () => {
    try {
        const res = await fetch(`${BASE_URL}/users/profile`);
        const user = await res.json();

        document.getElementById('profName').value = user.name || '';
        document.getElementById('profAge').value = user.age || '';
        document.getElementById('profHeight').value = user.height || '';
        document.getElementById('profWeight').value = user.weight || '';
        document.getElementById('profHR').value = user.baseline_resting_hr || '';
        document.getElementById('profSleep').value = user.baseline_sleep || '';
        document.getElementById('profDisease').value = user.disease || '';
        document.getElementById('profGoal').value = user.goal || 'maintain';

        profileModal.style.display = 'flex';
    } catch (e) {
        showToast("Failed to load profile", "error");
    }
});
closeProfileBtn.addEventListener('click', () => profileModal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === profileModal) profileModal.style.display = 'none'; });

formProfile.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('profName').value,
        age: parseInt(document.getElementById('profAge').value) || null,
        height: parseFloat(document.getElementById('profHeight').value) || null,
        weight: parseFloat(document.getElementById('profWeight').value) || null,
        baseline_resting_hr: parseFloat(document.getElementById('profHR').value) || null,
        baseline_sleep: parseFloat(document.getElementById('profSleep').value) || null,
        disease: document.getElementById('profDisease').value,
        goal: document.getElementById('profGoal').value,
    };

    showLoader("Saving Profile...");
    try {
        const res = await fetch(`${BASE_URL}/users/profile`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error("Failed to save profile");

        profileModal.style.display = 'none';
        showToast("Profile updated successfully!");
    } catch (e) {
        showToast(e.message, "error");
    } finally { hideLoader(); }
});

// UI Updater function
function updateDashboardUI(data) {
    // Update Cards based on inputs / returned vitals
    if (data.stress_prediction) {
        // Mock update to UI if we don't return the exact numbers
        const hr = document.getElementById('inputHeart').value;
        const act = document.getElementById('inputActivity').value;
        const oxy = document.getElementById('inputOxy').value;
        const slp = document.getElementById('inputSleep').value;

        vHeart.innerText = hr;
        vOxy.innerText = oxy;
        vActive.innerText = act;
        vSleep.innerText = slp;
    }

    // Handle Stress Prediction & Alerts
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

    stressAlerts.innerHTML = `
    <div class="alert-card ${alertClass}">
      <div class="alert-icon"><i class="fa-solid ${iconClass}"></i></div>
      <div class="alert-title-desc">
        <div class="alert-title" style="margin:2px 0px">AI Prediction: ${formatHighlightedText(alertTitle)}</div>
        <div class="alert-desc">${formatHighlightedText(alertDesc)}</div>
      </div>
    </div>
  `;

    // Update Diet Plan
    const plan = data.nutrition_plan || {};
    const meals = plan.meals || {};

    if (meals.breakfast) {
        dietContainer.style.display = 'flex';
        document.getElementById('targetCals').innerText = plan.calorieTarget || 2000;

        const formatMeal = (meal, defaultCalPct) => {
            const cal = meal.calories || Math.round((plan.calorieTarget || 2000) * defaultCalPct);
            if (meal.protein_g !== undefined) {
                return `${cal} kcal <span>P:${meal.protein_g}g | C:${meal.carbs_g}g | F:${meal.fat_g}g | Fib:${meal.fiber_g}g</span>`;
            }
            return `${cal} kcal`;
        };

        document.getElementById('mealBreak').innerText = meals.breakfast.meal_name || 'Healthy Start';
        document.getElementById('calBreak').innerHTML = formatMeal(meals.breakfast, 0.25);

        document.getElementById('mealLunch').innerText = meals.lunch.meal_name || 'Balanced Bowl';
        document.getElementById('calLunch').innerHTML = formatMeal(meals.lunch, 0.40);

        document.getElementById('mealDinner').innerText = meals.dinner.meal_name || 'Light Evening';
        document.getElementById('calDinner').innerHTML = formatMeal(meals.dinner, 0.35);
    }

    if (data.explanation) {
        currentAiExplanation = data.explanation;
    }

    // Initialize or Update the 7-day progress Chart
    renderProgressChart(sp);
}

// 0. Chart & Animation Helper
async function renderProgressChart() {
    vitalsChartWrapper.style.display = 'block';

    if (trendChart) { trendChart.destroy(); }

    const ctx = document.getElementById('vitalsChart').getContext('2d');

    // Fetch REAL historical vitals from the backend MySQL DB instead of Mocking
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    let pastData = [75, 78, 76, 73, 76, 78, 75]; // safe defaults

    try {
        const hRes = await fetch(`${BASE_URL}/vitals/history`);
        const hData = await hRes.json();

        if (hData.history && hData.history.length > 0) {
            labels = hData.history.map(v => new Date(v.createdAt).toLocaleDateString(undefined, { weekday: 'short' }));
            pastData = hData.history.map(v => v.resting_hr);
        }
    } catch (err) {
        console.warn("Failed retrieving history using defaults.");
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Heart Rate (BPM)',
                data: pastData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2e7d32',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 40, max: 130 }
            }
        }
    });
}

function startLiveMetricFluctuation(hr, oxy) {
    if (liveSyncInterval) clearInterval(liveSyncInterval);

    currentHR = hr;
    currentOxy = oxy;

    document.getElementById('trendHeart').innerText = 'Live 🟢';
    document.getElementById('trendOxy').innerText = 'Live 🟢';
    vHeart.classList.add('value-pulse');
    vOxy.classList.add('value-pulse');

    liveSyncInterval = setInterval(() => {
        // Minor natural fluctuations
        const hrDiff = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const oxyDiff = Math.random() > 0.8 ? (Math.floor(Math.random() * 2) - 1) : 0;

        const newHr = currentHR + hrDiff;
        const newOxy = Math.max(93, Math.min(100, currentOxy + oxyDiff));

        vHeart.innerText = newHr;
        vOxy.innerText = newOxy;
    }, 2000);
}

// 1. Wearable Sync
btnWearable.addEventListener('click', async () => {
    showLoader("Syncing wearable devices & predicting stress...");
    try {
        const res = await fetch(`${BASE_URL}/vitals/wearable-sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed sync");

        // Immediately update fields so fallback reads correct mock numbers
        document.getElementById('inputHeart').value = 75; // mocked sync values
        document.getElementById('inputOxy').value = 98;

        updateDashboardUI(data);
        startLiveMetricFluctuation(75, 98);

        showToast("Device synced & plan generated!");
    } catch (e) {
        showToast(e.message, "error");
    } finally { hideLoader(); }
});

// 2. Manual Vitals
formVitals.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader("Running ML model & generating LLM response...");

    const h = parseFloat(document.getElementById('inputHeart').value);
    const o = parseFloat(document.getElementById('inputOxy').value);

    const payload = {
        resting_hr: h,
        spo2: o,
        sleep_hours: parseFloat(document.getElementById('inputSleep').value),
        activity_minutes: parseFloat(document.getElementById('inputActivity').value)
    };
    try {
        const res = await fetch(`${BASE_URL}/vitals/manual`, {
            method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed analysis");

        updateDashboardUI(data);
        startLiveMetricFluctuation(h, o);

        showToast("AI Analysis Complete!");
    } catch (e) {
        showToast(e.message, "error");
    } finally { hideLoader(); }
});

// PDF Export Logic
if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
        // Automatically hide tooltip reasons or other non-print elements via CSS
        // Call browser print (which behaves exactly like a PDF Export visually using our @media print rules)
        window.print();
    });
}

// 3. Food Analyzer
document.getElementById('formFood').addEventListener('submit', async (e) => {
    e.preventDefault();
    const foodName = document.getElementById('foodName').value.trim();
    if (!foodName) return;

    const resEl = document.getElementById('foodResults');
    showLoader(`Analyzing macros for ${foodName}...`);
    try {
        const res = await fetch(`${BASE_URL}/food/analyze`, {
            method: 'POST', body: JSON.stringify({ foodName }), headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        let verdictClass = data.verdict && data.verdict.includes("NOT") ? "NOT" : (data.verdict && data.verdict.includes("GOOD") ? "GOOD" : "NEUTRAL");

        resEl.innerHTML = `
          <div style="margin-bottom: 10px;">
             <h3>${data.food}</h3>
             <span class="verdict-badge ${verdictClass}">${data.verdict}</span>
          </div>
          <p style="color:#555; background:#fff; padding:15px; border-radius:12px; border:1px solid #eee;">
            <i class="fa-solid fa-circle-info" style="color:var(--green-main)"></i> ${data.reason}
          </p>
          <div class="macro-grid">
              <div class="macro-item"><span class="label">Calories</span><span class="value">${data.macros?.calories || 0}</span></div>
              <div class="macro-item"><span class="label">Protein</span><span class="value">${data.macros?.protein || 0}g</span></div>
              <div class="macro-item"><span class="label">Carbs</span><span class="value">${data.macros?.carbs || 0}g</span></div>
          </div>
      `;
    } catch (e) { showToast(e.message, "error"); }
    finally { hideLoader(); }
});

// 4. Mood Recommendation
document.getElementById('formMood').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mood = document.getElementById('moodSelect').value;
    if (!mood) return;

    const resEl = document.getElementById('moodResults');
    showLoader(`Finding meals for a ${mood} mood...`);
    try {
        const res = await fetch(`${BASE_URL}/mood/recommend`, {
            method: 'POST', body: JSON.stringify({ mood }), headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        resEl.innerHTML = "";
        if (data.recommended_meals) {
            data.recommended_meals.forEach(m => {
                const macrosList = m.protein_g ? `<span>P:${m.protein_g}g | C:${m.carbs_g}g | F:${m.fat_g}g</span>` : ``;
                resEl.innerHTML += `
              <div class="diet-card" style="margin-top:0;">
                <div class="diet-left">
                  <div class="diet-name"><i class="fa-solid fa-bowl-rice"></i> ${m.meal_name}</div>
                  <div class="diet-cal" style="margin-top:5px;">
                      <span class="calorie-part" style="background:rgba(76,175,80,0.1); color:#2e7d32"><i class="fa-solid fa-fire-flame-curved" style="color:#2e7d32; padding-right:10px"></i> ${m.calories} kcal ${macrosList}</span>
                  </div>
                </div>
              </div>
              `;
            });
        }

    } catch (e) { showToast(e.message, "error"); }
    finally { hideLoader(); }
});

// Dictionary for Basic Translation
const dictionary = {
    en: {
        dashboard: "Dashboard",
        food_analyzer: "Food Analyzer",
        mood_meals: "Mood Meals",
        health_overview: "Your Health Overview ✨",
        vitals_history: "Vitals History (7-Day Trend)",
        update_health: "Update Health Data",
        sync: "Auto-Sync Wearable",
        analyze_plan: "Analyze & Generate Plan",
        ai_diet: "Suggested AI Diet",
        export_plan: "Export Plan",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        why: "why this plan?"
    },
    es: {
        dashboard: "Tablero",
        food_analyzer: "Análisis Nutri",
        mood_meals: "Por Humor",
        health_overview: "Resumen de Salud ✨",
        vitals_history: "Historial Vital (7-Días)",
        update_health: "Actualizar Datos",
        sync: "Sincronizar Reloj",
        analyze_plan: "Generar Plan",
        ai_diet: "Dieta IA Sugerida",
        export_plan: "Exportar Plan",
        breakfast: "Desayuno",
        lunch: "Almuerzo",
        dinner: "Cena",
        why: "¿Por qué?"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        food_analyzer: "आहार विश्लेषक",
        mood_meals: "मूड आहार",
        health_overview: "स्वास्थ्य विवरण ✨",
        vitals_history: "7-दिन इतिहास",
        update_health: "डेटा अपडेट",
        sync: "सिंक करें",
        analyze_plan: "प्लान बनाएं",
        ai_diet: "AI आहार",
        export_plan: "डाउनलोड",
        breakfast: "नाश्ता",
        lunch: "दोपहर",
        dinner: "रात",
        why: "ऐसा क्यों?"
    }
};

const langSelect = document.getElementById('langSelect');
if (langSelect) {
    langSelect.addEventListener('change', (e) => {
        const tr = dictionary[e.target.value] || dictionary.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.getAttribute('data-i18n');
            if (tr[k]) el.innerText = tr[k];
        });
    });
}

// Chatbot functionality
const chatWidget = document.getElementById('chatWidget');
const openChatBtn = document.getElementById('openChat');
const closeChatBtn = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatBody = document.getElementById('chatBody');

if (openChatBtn) {
    openChatBtn.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        openChatBtn.style.display = 'none';
        chatInput.focus();
    });

    closeChatBtn.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        openChatBtn.style.display = 'flex';
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // User Message HTML Injection
        const uWrap = document.createElement('div');
        uWrap.className = 'chat-message-wrapper user-wrapper';
        uWrap.innerHTML = `<div class="msg user">${msg}</div>`;
        chatBody.appendChild(uWrap);

        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        // Fetch AI Response Setup
        const aiWrap = document.createElement('div');
        aiWrap.className = 'chat-message-wrapper ai-wrapper';
        aiWrap.innerHTML = `
            <div class="bot-avatar"><i class="fa-solid fa-robot fa-fade"></i></div>
            <div class="msg ai"><i class="fa-solid fa-ellipsis fa-beat"></i></div>
        `;
        chatBody.appendChild(aiWrap);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const res = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });

            if (!res.ok) throw new Error("API Offline");

            const data = await res.json();

            // Remove the beat ellipsis and set real text
            aiWrap.querySelector('.bot-avatar i').classList.remove('fa-fade');
            aiWrap.querySelector('.msg.ai').innerText = data.reply || "I couldn't process that.";
            chatBody.scrollTop = chatBody.scrollHeight;

            // Speak the reply
            speakText(data.reply || "I couldn't process that.");

        } catch (e) {
            console.error("Chat API error:", e);

            // Offline Fallback Mechanism
            let fallbackReply = "I'm having trouble connecting to the server. Could you try again later?";
            const msgLower = msg.toLowerCase();

            if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
                fallbackReply = "Hello there! I'm operating in offline mode right now, but I can still help explain the website features or basic health questions!";
            } else if (msgLower.includes("fridge") || msgLower.includes("vision")) {
                fallbackReply = "The Fridge AI scanner lets you upload a picture of your ingredients. It visually detects what you have and generates a smart recipe from your database to ensure nothing goes to waste!";
            } else if (msgLower.includes("mood") || msgLower.includes("feel")) {
                fallbackReply = "Mood Meals takes your current state, like Stressed, Sore, or Energetic, and cross-references it with dietary tags to suggest meals that actively boost your mental and physical recovery.";
            } else if (msgLower.includes("analyzer") || msgLower.includes("food analyzer") || msgLower.includes("check food")) {
                fallbackReply = "The Smart Food Analyzer lets you type any food. We estimate its macros and check it against your profile conditions, like hypertension or diabetes, to give you a Safe or Warning verdict.";
            } else if (msgLower.includes("dashboard") || msgLower.includes("vitals")) {
                fallbackReply = "The dashboard combines your heart rate, sleep, SpO2, and activity. It predicts your overall stress levels and dynamically generates a personalized 3-meal dietary plan tailored to your metrics.";
            } else if (msgLower.includes("water") || msgLower.includes("hydration")) {
                fallbackReply = "I notice you asked about water! You can track your hydration daily directly on the Dashboard. Just click the hydration card to log a glass!";
            } else if (msgLower.includes("calorie") || msgLower.includes("diet")) {
                fallbackReply = "Your daily diet plan automatically adjusts its calorie targets based on your wearable sync data. For example, higher activity limits bump up your daily caloric goal.";
            } else {
                fallbackReply = "I'm currently offline, but you can ask me how the Fridge AI, Mood Meals, Food Analyzer, or Dashboard works!";
            }

            // Small delay to simulate thinking time before falling back
            setTimeout(() => {
                aiWrap.querySelector('.bot-avatar i').classList.remove('fa-fade');
                aiWrap.querySelector('.bot-avatar').style.background = '#f39c12';
                aiWrap.querySelector('.bot-avatar i').className = 'fa-solid fa-wifi';
                aiWrap.querySelector('.msg.ai').innerHTML = `
                    <div style="font-size:0.75rem; color:#e67e22; margin-bottom:5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; opacity:0.9;">Offline Mode Active</div>
                    ${fallbackReply}
                `;
                chatBody.scrollTop = chatBody.scrollHeight;

                // Speak the fallback reply
                speakText(fallbackReply);
            }, 600);
        }
    });
}

// === VOICE / TTS LOGIC ===
let isVoiceEnabled = true;
const btnToggleVoice = document.getElementById('toggleVoice');

if (btnToggleVoice) {
    btnToggleVoice.addEventListener('click', () => {
        isVoiceEnabled = !isVoiceEnabled;
        const icon = btnToggleVoice.querySelector('i');
        if (isVoiceEnabled) {
            icon.className = 'fa-solid fa-volume-high';
            btnToggleVoice.title = 'Toggle Voice (Currently ON)';
            showToast("Voice Assistant Enabled");
        } else {
            icon.className = 'fa-solid fa-volume-xmark';
            btnToggleVoice.title = 'Toggle Voice (Currently OFF)';
            showToast("Voice Assistant Muted", "error");
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop current speech
            }
        }
    });
}

function speakText(text) {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    // Clean string by removing markdown, emojis, HTML tags before speaking
    let cleanText = text.replace(/<[^>]*>?/gm, '');
    cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    window.speechSynthesis.cancel(); // Interrupt previous speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// 5. PDF Export Polishing
const btnExport = document.getElementById('btnExportPdf');
if (btnExport) {
    btnExport.addEventListener('click', () => {
        window.print();
    });
}

// 6. Smart Diet Shuffle
window.shuffleMeal = async (type, nameElementId, calElementId, calPct) => {
    const btn = event.currentTarget.querySelector('i');
    btn.classList.add('fa-spin');
    try {
        const targetCals = parseInt(document.getElementById('targetCals').innerText) || 2000;
        const mealCals = Math.round(targetCals * calPct);
        const res = await fetch(`${BASE_URL}/food/shuffle?type=${type}&calories=${mealCals}`);
        const data = await res.json();

        if (data.meal) {
            const m = data.meal;
            document.getElementById(nameElementId).innerText = m.meal_name;
            const cal = m.calories || mealCals;

            let display = `${cal} kcal`;
            if (m.protein_g !== undefined) {
                display += ` <span>P:${m.protein_g}g | C:${m.carbs_g}g | F:${m.fat_g}g | Fib:${m.fiber_g}g</span>`;
            }
            document.getElementById(calElementId).innerHTML = display;

            // Micro-animation trigger
            const card = document.getElementById(nameElementId).closest('.diet-card');
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = 'slideInCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        }
    } catch (err) {
        console.error("Shuffle failed:", err);
        showToast("Error shuffling meal.", "error");
    } finally {
        setTimeout(() => btn.classList.remove('fa-spin'), 300);
    }
};

// 7. Grocery List & Recipe Modals (Phase 1 Gamification)
const btnGroceryList = document.getElementById('btnGroceryList');
if (btnGroceryList) {
    btnGroceryList.addEventListener('click', () => {
        const b = document.getElementById('mealBreak').innerText;
        const l = document.getElementById('mealLunch').innerText;
        const d = document.getElementById('mealDinner').innerText;

        modalReason.innerHTML = `
            <div style="text-align:left;">
                <p>Generating list based on your AI Meal Plan...</p>
                <ul style="margin-top:10px; padding-left:20px; color:#555;">
                    <li><b>Proteins:</b> Eggs, Chicken Breast, Tofu</li>
                    <li><b>Carbs:</b> Oats, Brown Rice, Sweet Potato</li>
                    <li><b>Fats:</b> Avocado, Olive Oil, Mixed Nuts</li>
                    <li><b>Produce:</b> Spinach, Tomatoes, Berries, Apple</li>
                    <li><b>Spices/Other:</b> Sea Salt, Black Pepper, Cinnamon</li>
                </ul>
            </div>
        `;
        document.querySelector('.modal-content h3').innerText = "🛒 Your Grocery List";
        document.querySelector('.modal-content i.big-icon').className = "fa-solid fa-cart-shopping big-icon";
        modal.style.display = 'flex';
    });
}

window.viewRecipe = (mealElementId) => {
    const mealName = document.getElementById(mealElementId).innerText;
    modalReason.innerHTML = `
        <div style="text-align:left;">
            <p><b>Estimated Time:</b> 15-20 mins</p>
            <p style="margin-top:10px;"><b>Instructions:</b></p>
            <ol style="margin-top:5px; padding-left:20px; color:#555;">
                <li>Prepare ingredients and wash all produce.</li>
                <li>Heat skillet/pan on medium and apply light cooking spray or oil.</li>
                <li>Cook base proteins first. Avoid overcooking.</li>
                <li>Add complex carbs and fibrous vegetables. Season to taste.</li>
                <li>Plate beautifully and enjoy your ${mealName}!</li>
            </ol>
        </div>
    `;
    document.querySelector('.modal-content h3').innerText = "👨‍🍳 Recipe & Prep";
    document.querySelector('.modal-content i.big-icon').className = "fa-solid fa-fire-burner big-icon";
    modal.style.display = 'flex';
};

// 8. Fridge Scanner Vision AI (Phase 2)
const fridgeUploadZone = document.getElementById('fridgeUploadZone');
const fridgeInput = document.getElementById('fridgeInput');
const fridgePreviewContainer = document.getElementById('fridgeImagePreviewContainer');
const fridgePreviewImg = document.getElementById('fridgeImagePreview');
const fridgeOverlay = document.querySelector('.scanning-overlay');
const fridgeResults = document.getElementById('fridgeResults');
const ingredientChips = document.getElementById('ingredientChips');

if (fridgeUploadZone && fridgeInput) {
    fridgeUploadZone.addEventListener('click', () => fridgeInput.click());

    fridgeUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fridgeUploadZone.classList.add('dragover');
    });

    fridgeUploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fridgeUploadZone.classList.remove('dragover');
    });

    fridgeUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fridgeUploadZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFridgeImage(e.dataTransfer.files[0]);
        }
    });

    fridgeInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFridgeImage(e.target.files[0]);
        }
    });
}

function handleFridgeImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        // Reset UI
        fridgeUploadZone.style.display = 'none';
        fridgeResults.style.display = 'none';

        // Show Image and Start Scan
        fridgePreviewImg.src = e.target.result;
        fridgePreviewContainer.style.display = 'block';
        fridgeOverlay.style.display = 'block';

        // Wait to show off scanner UI animation for immersiveness
        setTimeout(async () => {
            // Call the new Backend Vision endpoint
            await revealFridgeRecipe(e.target.result);
        }, 2500);
    };
    reader.readAsDataURL(file);
}

async function revealFridgeRecipe(base64Image) {
    try {
        const res = await fetch(`${BASE_URL}/food/vision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await res.json();

        // Hide overlay scanner
        fridgeOverlay.style.display = 'none';

        if (data.ingredients) {
            ingredientChips.innerHTML = '';
            data.ingredients.forEach((ing, i) => {
                const chip = document.createElement('div');
                chip.className = 'ingredient-chip';
                chip.style.animationDelay = `${i * 0.1}s`;
                chip.innerText = ing;
                ingredientChips.appendChild(chip);
            });
        }

        if (data.meal) {
            document.getElementById('fridgeRecipeName').innerText = data.meal.meal_name;
            const m = data.meal;
            let display = `P:${m.protein_g}g | C:${m.carbs_g}g | F:${m.fat_g}g`;
            document.getElementById('fridgeMacros').innerText = display;
        }

        fridgeResults.style.display = 'block';
    } catch (err) {
        console.error('Vision sync failed:', err);
        fridgeOverlay.style.display = 'none';
        showToast("Error parsing imagery. Please try again.", "error");
    }
}
