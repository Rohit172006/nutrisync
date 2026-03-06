const { Meal, sequelize } = require("./models");

const mealsData = [
    // Standard / Normal (Low Stress, Happy, Energetic, Tired, Sad)
    { meal_name: "Avocado Toast with Egg", meal_type: "breakfast", calories: 350, protein_g: 15, tag: "happy" },
    { meal_name: "Banana & Peanut Butter Smoothie", meal_type: "breakfast", calories: 380, protein_g: 18, tag: "tired" },
    { meal_name: "Oatmeal with Blueberries", meal_type: "breakfast", calories: 300, protein_g: 12, tag: "energetic" },
    { meal_name: "Greek Yogurt Parfait", meal_type: "breakfast", calories: 280, protein_g: 22, tag: "happy" },
    { meal_name: "Spicy Black Bean Bowl", meal_type: "lunch", calories: 550, protein_g: 20, tag: "energetic" },
    { meal_name: "Lean Chicken & Quinoa", meal_type: "lunch", calories: 600, protein_g: 35, tag: "energetic" },
    { meal_name: "Warm Tomato Soup & Grilled Cheese", meal_type: "lunch", calories: 450, protein_g: 14, tag: "sad" },
    { meal_name: "Vegetable Stir-Fry with Tofu", meal_type: "lunch", calories: 400, protein_g: 18, tag: "happy" },
    { meal_name: "Roasted Salmon & Asparagus", meal_type: "dinner", calories: 480, protein_g: 30, tag: "tired" },
    { meal_name: "Comforting Mac & Cheese", meal_type: "dinner", calories: 500, protein_g: 12, tag: "sad" },
    { meal_name: "Turkey Meatballs with Zucchini Noodles", meal_type: "dinner", calories: 420, protein_g: 32, tag: "energetic" },
    { meal_name: "Baked Sweet Potato and Black Beans", meal_type: "dinner", calories: 460, protein_g: 15, tag: "happy" },

    // High Protein (Moderate Stress)
    { meal_name: "High Protein Lentil Dal", meal_type: "lunch", calories: 500, protein_g: 30, tag: "high_protein" },
    { meal_name: "Grilled Steak and Veggies", meal_type: "dinner", calories: 650, protein_g: 45, tag: "high_protein" },
    { meal_name: "Chicken Breast Core Bowl", meal_type: "lunch", calories: 550, protein_g: 48, tag: "high_protein" },
    { meal_name: "Protein Pancakes", meal_type: "breakfast", calories: 420, protein_g: 35, tag: "high_protein" },
    { meal_name: "Egg White Omelet with Spinach", meal_type: "breakfast", calories: 320, protein_g: 30, tag: "high_protein" },
    { meal_name: "Cottage Cheese & Tuna Salad", meal_type: "lunch", calories: 480, protein_g: 40, tag: "high_protein" },
    { meal_name: "Shrimp & Broccoli Stir-Fry", meal_type: "dinner", calories: 520, protein_g: 42, tag: "high_protein" },

    // Recovery (High Stress)
    { meal_name: "Dark Chocolate & Berries Oatmeal", meal_type: "breakfast", calories: 400, protein_g: 10, tag: "recovery" },
    { meal_name: "Chamomile Tea & Almonds", meal_type: "breakfast", calories: 250, protein_g: 8, tag: "recovery" },
    { meal_name: "Recovery Protein Shake", meal_type: "breakfast", calories: 400, protein_g: 25, tag: "recovery" },
    { meal_name: "Bone Broth Soup with Rice", meal_type: "lunch", calories: 350, protein_g: 22, tag: "recovery" },
    { meal_name: "Mashed Sweet Potato with Chicken", meal_type: "lunch", calories: 460, protein_g: 28, tag: "recovery" },
    { meal_name: "Steamed White Fish with Greens", meal_type: "dinner", calories: 380, protein_g: 35, tag: "recovery" },
    { meal_name: "Turmeric Rice & Lemon Chicken", meal_type: "dinner", calories: 500, protein_g: 32, tag: "recovery" },
];

const meals = mealsData.map(m => ({ ...m, carbs_g: 40, fat_g: 15, sodium_mg: 300 }));

(async () => {
    try {
        await sequelize.authenticate();
        await Meal.bulkCreate(meals);
        console.log("Meals seeded successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
