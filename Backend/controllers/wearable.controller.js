const { Vitals, User } = require("../models");

exports.getDeviceData = async (req, res) => {
    try {

        const userId = 1; // temporary

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get last vitals record
        const lastVitals = await Vitals.findOne({
            where: { UserId: userId },
            order: [["createdAt", "DESC"]]
        });

        let resting_hr;
        let sleep_hours;
        let activity_minutes;

        if (!lastVitals) {
            // First sync → baseline values
            resting_hr = user.baseline_resting_hr;
            sleep_hours = user.baseline_sleep;
            activity_minutes = 30;
        } else {
            // Trend-based change
            resting_hr = Math.round(
                lastVitals.resting_hr + (Math.random() * 6 - 3)
            );

            sleep_hours = parseFloat(
                (lastVitals.sleep_hours + (Math.random() * 1.5 - 0.7)).toFixed(1)
            );

            activity_minutes = Math.round(
                lastVitals.activity_minutes + (Math.random() * 20 - 10)
            );
        }

        const spo2 = 95 + Math.floor(Math.random() * 4);

        res.json({
            device_id: "FITBIT-SIM-01",
            timestamp: new Date(),
            resting_hr,
            sleep_hours,
            activity_minutes,
            spo2
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};