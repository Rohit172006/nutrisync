const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "nutrisyncai",      // database name
    "root",           // username
    "sql123",   // password
    {
        host: "localhost",
        dialect: "mysql",
        logging: false
    }
);

module.exports = sequelize;