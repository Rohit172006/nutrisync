const { Meal } = require("../models");
const { calculateBMR } = require("../utils/bmrCalculator");
const { Op } = require("sequelize");

async function generateNutritionPlan(user, stressLevel) {

    /* ==============================
       1️⃣ CALCULATE BASE CALORIES
    ============================== */

    let bmr = calculateBMR(user.weight, user.height, user.age, "male");
    let calorieTarget = bmr;

    // Goal adjustment
    if (user.goal === "fat_loss") calorieTarget -= 300;
    if (user.goal === "muscle_gain") calorieTarget += 300;

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
        calorieTarget -= 200;
    }

    /* ==============================
       3️⃣ ALLERGY FILTER
    ============================== */

    let allergyFilter = {};

    if (user.allergies) {
        const allergyList = user.allergies.split(",");
        allergyFilter.allergen = { [Op.notIn]: allergyList };
    }

    /* ==============================
       4️⃣ STRESS TAG DECISION
    ============================== */

    let requiredTag = null;

    if (stressLevel === "HIGH") requiredTag = "recovery";
    if (stressLevel === "MODERATE") requiredTag = "high_protein";

    /* ==============================
       5️⃣ CALORIE DISTRIBUTION
    ============================== */

    let breakfastTarget = calorieTarget * 0.3;
    let lunchTarget = calorieTarget * 0.35;
    let dinnerTarget = calorieTarget * 0.35;

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
        where: {
            meal_type: "breakfast",
            ...baseFilter
        }
    });

    const lunchMeals = await Meal.findAll({
        where: {
            meal_type: "lunch",
            ...baseFilter
        }
    });

    const dinnerMeals = await Meal.findAll({
        where: {
            meal_type: "dinner",
            ...baseFilter
        }
    });

    /* ==============================
       8️⃣ SELECT CLOSEST CALORIE MATCH
    ============================== */

    function selectClosest(meals, target) {
        if (!meals.length) return null;

        return meals.reduce((prev, curr) =>
            Math.abs(curr.calories - target) <
            Math.abs(prev.calories - target) ? curr : prev
        );
    }

            let selectedBreakfast = selectClosest(breakfastMeals, breakfastTarget);
            let selectedLunch = selectClosest(lunchMeals, lunchTarget);
            let selectedDinner = selectClosest(dinnerMeals, dinnerTarget);

            // Fallback if strict filtering returns null
            if (!selectedBreakfast) {
                const fallbackBreakfast = await Meal.findOne({ where: { meal_type: "breakfast" } });
                selectedBreakfast = fallbackBreakfast;
            }

            if (!selectedLunch) {
                const fallbackLunch = await Meal.findOne({ where: { meal_type: "lunch" } });
                selectedLunch = fallbackLunch;
            }

            if (!selectedDinner) {
                const fallbackDinner = await Meal.findOne({ where: { meal_type: "dinner" } });
                selectedDinner = fallbackDinner;
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