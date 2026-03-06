const sequelize = require("../config/db");

const User = require("./user.model");
const Vitals = require("./vitals.model");
const Meal = require("./meal.model");
const Recommendation = require("./recommendation.model");

// Associations
User.hasMany(Vitals);
Vitals.belongsTo(User);

User.hasMany(Recommendation);
Recommendation.belongsTo(User);

module.exports = {
    sequelize,
    User,
    Vitals,
    Meal,
    Recommendation
};