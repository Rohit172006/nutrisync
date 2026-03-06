const { predictStress } = require("../services/ml.service");
const User = require("../models/user.model");
const Vitals = require("../models/vitals.model");
const axios = require("axios");
const { generateNutritionPlan } = require("../services/nutrition.service");
const { generateLLMExplanation } = require("../services/llm.service");
const { Recommendation } = require("../models");



exports.syncWearableVitals = async (req, res) => {

    try {
        console.log("Wearable sync endpoint hit");

        const userId = 1;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 1️⃣ Call internal wearable API
        const response = await axios.get(
            "http://127.0.0.1:5000/api/wearable/device-data"
        );

        const wearableData = response.data;

        // 2️⃣ Save vitals
        await Vitals.create({
            resting_hr: wearableData.resting_hr,
            sleep_hours: wearableData.sleep_hours,
            activity_minutes: wearableData.activity_minutes,
            spo2: wearableData.spo2,
            source: "wearable",
            UserId: userId
        });

        // 3️⃣ Call ML
        const mlResult = await predictStress(
            wearableData,
            user.baseline_resting_hr
        );

        // 4️⃣ Generate nutrition plan
        const plan = await generateNutritionPlan(user, mlResult.stress_level, wearableData.activity_minutes);

        const explanation = await generateLLMExplanation(
            user,
            mlResult.stress_level,
            plan
        );

        await Recommendation.create({
            stress_level: mlResult.stress_level,
            calorie_target: plan.calorieTarget,
            breakfast: plan.meals.breakfast?.meal_name || null,
            lunch: plan.meals.lunch?.meal_name || null,
            dinner: plan.meals.dinner?.meal_name || null,
            source: "manual",
            UserId: userId
        });

        res.json({
            source: "manual",
            stress_prediction: mlResult,
            nutrition_plan: plan,
            explanation: explanation || "Explanation service unavailable."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


exports.submitManualVitals = async (req, res) => {
    try {
        const userId = 1; //req.user.id;

        const { resting_hr, sleep_hours, activity_minutes, spo2 } = req.body;

        // 1️⃣ Get user's baseline HR
        const user = await User.findByPk(userId);

        // 2️⃣ Save vitals in DB
        const vitals = await Vitals.create({
            resting_hr,
            sleep_hours,
            activity_minutes,
            spo2,
            source: "manual",
            UserId: userId
        });

        // 3️⃣ Call ML microservice
        const mlResult = await predictStress(
            { resting_hr, sleep_hours, activity_minutes },
            user.baseline_resting_hr
        );

        const plan = await generateNutritionPlan(user, mlResult.stress_level, activity_minutes);
        const explanation = await generateLLMExplanation(
            user,
            mlResult.stress_level,
            plan
        );

        await Recommendation.create({
            stress_level: mlResult.stress_level,
            calorie_target: plan.calorieTarget,
            breakfast: plan.meals.breakfast?.meal_name || null,
            lunch: plan.meals.lunch?.meal_name || null,
            dinner: plan.meals.dinner?.meal_name || null,
            source: "manual",
            UserId: userId
        });


        res.json({
            source: "manual",
            stress_prediction: mlResult,
            nutrition_plan: plan,
            explanation: explanation || "Explanation service unavailable."
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVitalsHistory = async (req, res) => {
    try {
        const userId = 1;
        const vitals = await Vitals.findAll({
            where: { UserId: userId },
            order: [["createdAt", "ASC"]],
            limit: 7
        });
        res.json({ history: vitals });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
