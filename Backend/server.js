require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const { sequelize } = require("./models");
sequelize.sync().then(() => {
    console.log("Database synced");
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});