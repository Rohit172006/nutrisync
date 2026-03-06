const { Meal } = require("../models");
const { calculateBMR } = require("../utils/bmrCalculator");
const { Op } = require("sequelize");

async function generateNutritionPlan(user, stressLevel, activityMinutes = 0) {

    /* ==============================
       1️⃣ CALCULATE BASE CALORIES
    ============================== */

    let bmr = calculateBMR(user.weight, user.height, user.age, "male");

    // Add activity expenditure (approx 5-7 calories per minute of activity)
    let activityBurn = activityMinutes * 6;
    let calorieTarget = bmr + activityBurn;

    // Goal adjustment
    if (user.goal === "fat_loss" || user.goal === "weight_loss") calorieTarget -= 400;
    if (user.goal === "muscle_gain") calorieTarget += 400;

    /* ==============================
       2️⃣ DISEASE-BASED ADJUSTMENTS
    ============================== */

    let diseaseFilters = {};

    if (user.disease === "hypertension") {
        diseaseFilters.sodium_mg = { [Op.lte]: 500 };
    }

    if (user.disease === "diabetes") {
        diseaseFilters.carbs_g = { [Op.lte]: 50 };
    }

    if (user.disease === "obesity") {
        calorieTarget -= 300;
    }

    /* ==============================
       3️⃣ ALLERGY FILTER
    ============================== */

    let allergyFilter = {};

    if (user.allergies) {
        const allergyList = user.allergies.split(",").map(a => a.trim().toLowerCase());
        allergyFilter.allergen = {
            [Op.or]: [
                { [Op.notIn]: allergyList },
                { [Op.is]: null }
            ]
        };
    } else {
        allergyFilter.allergen = {
            [Op.or]: [
                { [Op.not]: null },
                { [Op.is]: null }
            ] // Basically no filter, but explicitly handles it. Or just empty.
        };
        allergyFilter = {}; // Reset since no allergies
    }

    /* ==============================
       4️⃣ STRESS TAG DECISION
    ============================== */

    let requiredTag = null;

    if (stressLevel === "HIGH") requiredTag = "recovery";
    else if (user.goal === "muscle_gain") requiredTag = "muscle_gain";
    else if (user.goal === "weight_loss") requiredTag = "high_protein";
    else if (stressLevel === "MODERATE") requiredTag = "anti_inflammatory";
    else requiredTag = "energy";

    /* ==============================
       5️⃣ CALORIE DISTRIBUTION
    ============================== */

    // Randomize the meal ratios slightly so they don't look overly robotic
    const r1 = 0.25 + (Math.random() * 0.1); // Breakfast: 25-35%
    const r2 = 0.35 + (Math.random() * 0.1); // Lunch: 35-45%
    const r3 = 1.0 - (r1 + r2);              // Dinner: Remaining

    let breakfastTarget = calorieTarget * r1;
    let lunchTarget = calorieTarget * r2;
    let dinnerTarget = calorieTarget * r3;

    /* ==============================
       6️⃣ COMMON WHERE FILTER
    ============================== */

    const baseFilter = {
        ...(requiredTag && { tag: requiredTag }),
        ...diseaseFilters,
        ...allergyFilter
    };

    /* ==============================
       7️⃣ FETCH MEALS
    ============================== */

    const breakfastMeals = await Meal.findAll({
        where: { meal_type: "breakfast", ...baseFilter }
    });

    const lunchMeals = await Meal.findAll({
        where: { meal_type: "lunch", ...baseFilter }
    });

    const dinnerMeals = await Meal.findAll({
        where: { meal_type: "dinner", ...baseFilter }
    });

    /* ==============================
       8️⃣ SELECT CLOSEST CALORIE MATCH
    ============================== */

    function selectClosest(mealsArray, target) {
        if (!mealsArray || mealsArray.length === 0) return null;

        // Find top 5 closest meals to massively increase randomization pool
        let sorted = [...mealsArray].sort((a, b) => Math.abs(a.calories - target) - Math.abs(b.calories - target));

        // Randomly pick one of the top 5 closest meals for heavy variety
        let poolSize = Math.min(5, sorted.length);
        let topOptions = sorted.slice(0, poolSize);
        return topOptions[Math.floor(Math.random() * poolSize)];
    }

    let selectedBreakfast = selectClosest(breakfastMeals, breakfastTarget);
    let selectedLunch = selectClosest(lunchMeals, lunchTarget);
    let selectedDinner = selectClosest(dinnerMeals, dinnerTarget);

    // Fallback if strict filtering returns null (e.g. no "recovery" breakfasts)
    if (!selectedBreakfast) {
        const fallbacks = await Meal.findAll({ where: { meal_type: "breakfast" } });
        selectedBreakfast = selectClosest(fallbacks, breakfastTarget);
    }

    if (!selectedLunch) {
        const fallbacks = await Meal.findAll({ where: { meal_type: "lunch" } });
        selectedLunch = selectClosest(fallbacks, lunchTarget);
    }

    if (!selectedDinner) {
        const fallbacks = await Meal.findAll({ where: { meal_type: "dinner" } });
        selectedDinner = selectClosest(fallbacks, dinnerTarget);
    }

    /* ==============================
       9️⃣ RETURN FINAL PLAN
    ============================== */

    return {
        stressLevel,
        calorieTarget: Math.round(calorieTarget),
        meals: {
            breakfast: selectedBreakfast,
            lunch: selectedLunch,
            dinner: selectedDinner
        }
    };
}

module.exports = { generateNutritionPlan };