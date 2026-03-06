const { User } = require("../models");

exports.getUserProfile = async (req, res) => {
    try {
        const userId = 1; // Mocking current logged in user
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = 1;
        const { name, age, height, weight, goal, baseline_resting_hr, baseline_sleep, allergies, disease } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        await user.update({
            name, age, height, weight, goal, baseline_resting_hr, baseline_sleep, allergies, disease
        });

        return res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
};
