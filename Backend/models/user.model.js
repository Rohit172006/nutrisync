const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    age: DataTypes.INTEGER,
    height: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    goal: DataTypes.STRING,
    baseline_resting_hr: DataTypes.FLOAT,
    baseline_sleep: DataTypes.FLOAT,
    allergies: {
        type: DataTypes.STRING, // comma separated for now
        },

    disease: {
        type: DataTypes.STRING // diabetes, hypertension, obesity
        },
});

module.exports = User;