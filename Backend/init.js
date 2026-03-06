const { sequelize, User } = require("./models");

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");

        await sequelize.sync();
        console.log("DB synced.");

        // Create dummy user
        const [user, created] = await User.findOrCreate({
            where: { id: 1 },
            defaults: {
                name: "Test User",
                baseline_resting_hr: 70,
                baseline_sleep: 7.5
            }
        });

        if (created) {
            console.log("Created dummy user (id: 1).");
        } else {
            console.log("Dummy user already exists.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error creating user:", error);
        process.exit(1);
    }
})();
