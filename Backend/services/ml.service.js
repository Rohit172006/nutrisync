const axios = require("axios");

async function predictStress(vitals, baselineHR) {
    try {
        const hrDeviation = vitals.resting_hr / baselineHR;

        const response = await axios.post("http://127.0.0.1:6000/predict", {
            hr_deviation: hrDeviation,
            sleep_hours: vitals.sleep_hours,
            activity_minutes: vitals.activity_minutes
        });

        return response.data; // { stress_level, confidence }

    } catch (error) {
        console.error("ML Service Error:", error.message);
        throw new Error("ML prediction failed");
    }
}

module.exports = { predictStress };