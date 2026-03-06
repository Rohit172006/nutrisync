const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Meal = sequelize.define("Meal", {
    meal_name: DataTypes.STRING,
    meal_type: DataTypes.STRING, // breakfast/lunch/dinner
    calories: DataTypes.FLOAT,
    protein_g: DataTypes.FLOAT,
    carbs_g: DataTypes.FLOAT,
    fat_g: DataTypes.FLOAT,
    fiber_g: DataTypes.FLOAT,
    sodium_mg: DataTypes.FLOAT,
    season: DataTypes.STRING,
    tag: DataTypes.STRING, // recovery, high_protein, etc
    allergen: DataTypes.STRING // milk, peanuts, etc
});

module.exports = Meal;