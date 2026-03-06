const { estimateFoodMacros } = require("../services/food.service");
const { Recommendation, User } = require("../models");

exports.analyzeFood = async (req, res) => {

    try {

        const userId = 1;
        const { foodName } = req.body;

        if (!foodName) {
            return res.status(400).json({ error: "Food name required" });
        }

        const user = await User.findByPk(userId);

        const latestPlan = await Recommendation.findOne({
            where: { UserId: userId },
            order: [["createdAt", "DESC"]]
        });

        const macros = await estimateFoodMacros(foodName);

        const calories = macros.calories;
        const carbs = macros.carbs;
        const sodium = macros.sodium;

        let verdict = "SAFE";
        let reason = "Food fits today's nutrition targets.";

        if (latestPlan && calories > latestPlan.calorie_target * 0.4) {
            verdict = "LIMITED";
            reason = "High calorie portion relative to daily allowance.";
        }

        if (user && user.disease === "hypertension" && sodium > 500) {
            verdict = "NOT RECOMMENDED";
            reason = "High sodium not suitable for hypertension.";
        }

        if (user && user.disease === "diabetes" && carbs > 50) {
            verdict = "NOT RECOMMENDED";
            reason = "High carbohydrate load may spike glucose.";
        }

        res.json({
            food: foodName,
            macros,
            verdict,
            reason
        });

    } catch (error) {
        console.error("REAL ERROR:", error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data || error.message
        });
    }
};

exports.shuffleMeal = async (req, res) => {
    try {
        const { Op } = require("sequelize");
        const { Meal } = require("../models");
        const userId = 1; // Assuming demo user
        const user = await User.findByPk(userId);
        const { type, calories } = req.query;

        let allergyFilter = {};
        if (user && user.allergies) {
            const allergyList = user.allergies.split(",").map(a => a.trim().toLowerCase());
            allergyFilter.allergen = {
                [Op.or]: [
                    { [Op.notIn]: allergyList },
                    { [Op.is]: null }
                ]
            };
        }

        const meals = await Meal.findAll({
            where: { meal_type: type, ...allergyFilter }
        });

        let target = parseInt(calories) || 500;
        let sorted = [...meals].sort((a, b) => Math.abs(a.calories - target) - Math.abs(b.calories - target));
        let poolSize = Math.min(15, sorted.length); // top 15 matches for randomized variation
        let selected = sorted[Math.floor(Math.random() * poolSize)];

        res.json({ meal: selected });
    } catch (err) {
        console.error("SHUFFLE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.analyzeFridgeImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Image payload required." });
        }

        // Mock Vision AI processing time (Wait 2000ms internally just for realness in endpoint call if needed, but we do it frontend anyway)

        // Mock Detection sets
        const mockSets = [
            { ingredients: ['Eggs 🥚', 'Spinach 🥬', 'Cheese 🧀', 'Tomato 🍅'], searchKw: 'Egg' },
            { ingredients: ['Avocado 🥑', 'Wheat Bread 🍞', 'Lemon 🍋'], searchKw: 'Avocado' },
            { ingredients: ['Chicken Breast 🍗', 'Rice 🍚', 'Broccoli 🥦'], searchKw: 'Chicken' },
            { ingredients: ['Salmon 🐟', 'Quinoa 🍚', 'Lemon 🍋'], searchKw: 'Salmon' },
            { ingredients: ['Oats 🥣', 'Berries 🍓', 'Milk 🥛'], searchKw: 'Oat' },
        ];

        // Pick one random detection
        const rngIdx = Math.floor(Math.random() * mockSets.length);
        const detection = mockSets[rngIdx];

        // Let's find a meal matching this from the DB realistically
        const { Op } = require("sequelize");
        const { Meal } = require("../models");

        const matchingMeals = await Meal.findAll({
            where: {
                meal_name: {
                    [Op.like]: `%${detection.searchKw}%`
                }
            }
        });

        let selectedMeal = null;
        if (matchingMeals.length > 0) {
            // Pick a random match
            selectedMeal = matchingMeals[Math.floor(Math.random() * matchingMeals.length)];
        } else {
            // Fallback
            selectedMeal = await Meal.findOne();
        }

        res.json({
            ingredients: detection.ingredients,
            meal: selectedMeal,
            confidence: 0.94
        });

    } catch (err) {
        console.error("VISION ERROR:", err);
        res.status(500).json({ error: err.message });
    }
};