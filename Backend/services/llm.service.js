const axios = require("axios");

async function generateLLMExplanation(user, stressLevel, plan) {
    try {
        const prompt = `
You are a clinical nutrition assistant.

User Profile:
Age: ${user.age}
Weight: ${user.weight} kg
Goal: ${user.goal}
Disease: ${user.disease || "None"}
Allergies: ${user.allergies || "None"}

Stress Level: ${stressLevel}
Calorie Target: ${plan.calorieTarget} kcal

Meals:
Breakfast: ${plan.meals.breakfast?.meal_name || "None"}
Lunch: ${plan.meals.lunch?.meal_name || "None"}
Dinner: ${plan.meals.dinner?.meal_name || "None"}

Explain clearly and professionally why this meal plan is suitable.
Keep explanation under 250 words.
`;

        const response = await axios.post(
            "http://127.0.0.1:11434/api/generate",
            {
                model: "llama3.2",
                prompt: prompt,
                stream: false
            },
            { timeout: 3000 }
        );

        return response.data.response;

    } catch (error) {
        console.warn("LLM Error, falling back:", error.message);

        let explanation = `Based on your AI analysis, we detected a ${stressLevel} stress pattern. `;
        if (stressLevel === 'HIGH') {
            explanation += "To help combat physical stress, this meal plan focuses on recovery and provides essential nutrients to stabilize your body. ";
        } else {
            explanation += "Your current vitals suggest you are in an optimal state for pursuing your fitness goals. ";
        }

        if (user.disease === 'diabetes') {
            explanation += "Since you mentioned managing diabetes, we have significantly restricted carbohydrate loads while ensuring steady energy. ";
        } else if (user.disease === 'hypertension') {
            explanation += "To support your blood pressure goals, we've filtered this custom diet for minimum sodium content. ";
        }

        explanation += `The total recommended daily intake is mapped to ${plan.calorieTarget} kcal to help you ${user.goal === 'weight_loss' ? 'lose weight' : (user.goal === 'muscle_gain' ? 'gain lean muscle' : 'maintain your physique')}. Enjoy your carefully balanced meals!`;

        return explanation;
    }
}

async function askChatbot(question, userContext) {
    try {
        const prompt = `You are a helpful and concise clinical nutrition coach and a guide for the NutriSync web application. 
Keep answers strictly under 2 sentences. Be friendly.
NutriSync Features:
- Dashboard: Combines heart rate, sleep, SpO2, and activity to predict stress and generate a personalized dietary plan.
- Food Analyzer: Lets you search any food to estimate macros and check it against your health conditions for a Safe/Warning verdict.
- Mood Meals: Suggests meals based on your current state (Stressed, Sore, Energetic) to boost recovery.
- Fridge AI (Vision): Upload an image of your ingredients to visually detect them and generate a smart recipe.
${userContext ? `User Context to consider: ${userContext}\n` : ""}
User asks: "${question}"
Your short response:`;

        const response = await axios.post(
            "http://127.0.0.1:11434/api/generate",
            {
                model: "llama3.2",
                prompt: prompt,
                stream: false
            },
            { timeout: 3500 }
        );

        return response.data.response;
    } catch (e) {
        console.warn("Chatbot Fallback:", e.message);

        // Smart Heuristic Fallback Engine
        const q = question.toLowerCase();

        if (q.includes("hello") || q.includes("hi ") || q.includes("hey")) {
            return "Hello! I'm your NutriSync Coach. What aspect of your health can I help you optimize today?";
        }
        if (q.includes("fridge") || q.includes("vision")) {
            return "The Fridge AI scanner lets you upload a picture of your ingredients. It visually detects what you have and generates a smart recipe from your database to ensure nothing goes to waste!";
        }
        if (q.includes("mood") || q.includes("feel")) {
            return "Mood Meals takes your current state, like Stressed, Sore, or Energetic, and cross-references it with dietary tags to suggest meals that actively boost your mental and physical recovery.";
        }
        if (q.includes("analyzer") || q.includes("food analyzer") || q.includes("check food")) {
            return "The Smart Food Analyzer lets you type any food. We estimate its macros and check it against your profile conditions, like hypertension or diabetes, to give you a Safe or Warning verdict.";
        }
        if (q.includes("dashboard") || q.includes("vitals")) {
            return "The dashboard combines your heart rate, sleep, SpO2, and activity. It predicts your overall stress levels and dynamically generates a personalized 3-meal dietary plan tailored to your metrics.";
        }
        if (q.includes("sleep") || q.includes("tired") || q.includes("exhausted") || q.includes("insomnia")) {
            return "If you're lacking sleep, focus on magnesium-rich foods like spinach and almonds tonight. Avoid caffeine at least 6 hours before bed!";
        }
        if (q.includes("diet") || q.includes("plan") || q.includes("meal")) {
            return "Based on your vitals, sticking to high-protein, nutrient-dense meals is your best path. Make sure to hit your target calories!";
        }
        if (q.includes("water") || q.includes("hydration") || q.includes("thirsty")) {
            return "You should aim for at least 2.5 to 3 liters of water daily, especially if your stress levels are fluctuating.";
        }
        if (q.includes("protein") || q.includes("muscle")) {
            return "Protein is crucial for muscle repair! Aim for around 1.6 to 2.2 grams of protein per kilogram of body weight depending on your training.";
        }
        if (q.includes("stress") || q.includes("anxious") || q.includes("heart rate") || q.includes("hr")) {
            return "Elevated heart rates can indicate physical stress. Rest up, practice some deep breathing, and prioritize sleep tonight.";
        }
        if (q.includes("weight loss") || q.includes("lose weight") || q.includes("fat")) {
            return "For sustainable weight loss, maintain a slight caloric deficit (300-500 kcals) and keep your protein intake high to preserve lean mass.";
        }
        if (q.includes("sugar") || q.includes("sweet") || q.includes("diabetes")) {
            return "To manage blood sugar spikes, pair your carbohydrates with a solid source of protein and some healthy fats!";
        }
        if (q.includes("thank")) {
            return "You're very welcome! Keep crushing your health goals, I'm right here if you need more advice.";
        }
        if (q.includes("who are you") || q.includes("name")) {
            return "I am the NutriSync AI Coach! An intelligent assistant designed to help you balance your vitals, diet, and lifestyle.";
        }

        // Catch-all
        return "That's a great question! While my active ML connection is buffering, I suggest staying consistent with your current generated diet plan. Is there a specific macro you need help tracking?";
    }
}

module.exports = { generateLLMExplanation, askChatbot };