const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "abc",      // database name
    "root",           // username
    "sql123",   // password
    {
        host: "localhost",
        dialect: "mysql",
        logging: false
    }
);

module.exports = sequelize;