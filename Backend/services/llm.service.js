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
            }
        );

        return response.data.response;

    } catch (error) {
        console.error("LLM Error:", error.message);
        return null;
    }
}

module.exports = { generateLLMExplanation };