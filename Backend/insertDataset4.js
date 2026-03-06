const fs = require('fs');
const { sequelize } = require('./models');

(async () => {
    try {
        await sequelize.authenticate();
        const sql = fs.readFileSync('dataset4.sql', 'utf8');
        await sequelize.query(sql);
        console.log("Dataset 4 inserted successfully!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
