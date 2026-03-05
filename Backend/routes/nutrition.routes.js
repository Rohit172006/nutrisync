const express = require("express");
const router = express.Router();
const { generateNutritionPlan } = require("../services/nutrition.service");

// Mock Op for testing (remove this when you have real database)
const Op = {
    lte: Symbol('lte'),
    notIn: Symbol('notIn')
};

// Mock Meal model for testing (remove this when you have real database)
const Meal = {
    findAll: async ({ where }) => {
        const meals = {
            breakfast: [
                { 
                    meal_name: "Berry Oatmeal", 
                    meal_type: "breakfast",
                    calories: 385, 
                    carbs_g: 58, 
                    protein_g: 12, 
                    fats_g: 13,
                    tag: "recovery",
                    sodium_mg: 150
                },
                { 
                    meal_name: "Egg White Omelette", 
                    meal_type: "breakfast",
                    calories: 320, 
                    carbs_g: 8, 
                    protein_g: 28, 
                    fats_g: 18,
                    tag: "high_protein",
                    sodium_mg: 380
                }
            ],
            lunch: [
                { 
                    meal_name: "Quinoa Bowl", 
                    meal_type: "lunch",
                    calories: 520, 
                    carbs_g: 67, 
                    protein_g: 18, 
                    fats_g: 21,
                    tag: "recovery",
                    sodium_mg: 320
                },
                { 
                    meal_name: "Grilled Chicken Salad", 
                    meal_type: "lunch",
                    calories: 450, 
                    carbs_g: 22, 
                    protein_g: 42, 
                    fats_g: 24,
                    tag: "high_protein",
                    sodium_mg: 410
                }
            ],
            dinner: [
                { 
                    meal_name: "Salmon & Greens", 
                    meal_type: "dinner",
                    calories: 495, 
                    carbs_g: 25, 
                    protein_g: 38, 
                    fats_g: 28,
                    tag: "recovery",
                    sodium_mg: 250
                },
                { 
                    meal_name: "Lean Beef with Vegetables", 
                    meal_type: "dinner",
                    calories: 530, 
                    carbs_g: 18, 
                    protein_g: 45, 
                    fats_g: 32,
                    tag: "recovery",
                    sodium_mg: 420
                }
            ]
        };
        
        let filteredMeals = meals[where.meal_type] || [];
        
        if (where.tag) {
            filteredMeals = filteredMeals.filter(meal => meal.tag === where.tag);
        }
        
        if (where.sodium_mg && where.sodium_mg[Op.lte]) {
            filteredMeals = filteredMeals.filter(meal => meal.sodium_mg <= where.sodium_mg[Op.lte]);
        }
        
        if (where.carbs_g && where.carbs_g[Op.lte]) {
            filteredMeals = filteredMeals.filter(meal => meal.carbs_g <= where.carbs_g[Op.lte]);
        }
        
        return filteredMeals;
    },
    
    findOne: async ({ where }) => {
        const meals = {
            breakfast: { 
                meal_name: "Berry Oatmeal", 
                meal_type: "breakfast",
                calories: 385, 
                carbs_g: 58, 
                protein_g: 12, 
                fats_g: 13 
            },
            lunch: { 
                meal_name: "Quinoa Bowl", 
                meal_type: "lunch",
                calories: 520, 
                carbs_g: 67, 
                protein_g: 18, 
                fats_g: 21 
            },
            dinner: { 
                meal_name: "Salmon & Greens", 
                meal_type: "dinner",
                calories: 495, 
                carbs_g: 25, 
                protein_g: 38, 
                fats_g: 28 
            }
        };
        return meals[where.meal_type] || null;
    }
};

router.post("/plan", async (req, res) => {
    try {
        const { age, weight, height, goal, disease, allergies, stressLevel } = req.body;
        
        const user = {
            age: age || 25,
            weight: weight || 70,
            height: height || 170,
            goal: goal || "fat_loss",
            disease: disease || "none",
            allergies: allergies || ""
        };

        console.log("Generating nutrition plan for:", user);
        
        // Override the Meal model in the service with our mock
        // This is temporary - remove when you have real database
        const nutritionService = require("../services/nutrition.service");
        
        const nutritionPlan = await generateNutritionPlan(user, stressLevel || "MODERATE");
        
        console.log("Nutrition plan generated:", nutritionPlan);
        res.json(nutritionPlan);
        
    } catch (error) {
        console.error("Error generating nutrition plan:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;