const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Recommendation = sequelize.define("Recommendation", {
    stress_level: {
        type: DataTypes.STRING,
        allowNull: false
    },
    calorie_target: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    breakfast: DataTypes.STRING,
    lunch: DataTypes.STRING,
    dinner: DataTypes.STRING,
    source: DataTypes.STRING
});

module.exports = Recommendation;