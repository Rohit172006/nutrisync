const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Vitals = sequelize.define("Vitals", {
    resting_hr: DataTypes.FLOAT,
    avg_hr: DataTypes.FLOAT,
    spo2: DataTypes.FLOAT,
    sleep_hours: DataTypes.FLOAT,
    activity_minutes: DataTypes.FLOAT,
    source: DataTypes.STRING
});

module.exports = Vitals;