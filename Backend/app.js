const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const vitalsRoutes = require("./routes/vitals.routes");
const wearableRoutes = require("./routes/wearable.routes");
const stressTrendRoutes = require("./routes/stress-trend.route");

const { generateLLMExplanation } = require("./services/llm.service");

app.get("/test-llm", async (req, res) => {
    const fakeUser = {
        age: 21,
        weight: 70,
        goal: "fat_loss",
        disease: "hypertension",
        allergies: "milk"
    };
    const fakePlan = {
        calorieTarget: 1500,
        meals: {
            breakfast: { meal_name: "Oats Bowl" },
            lunch: { meal_name: "Quinoa Salad" },
            dinner: { meal_name: "Grilled Chicken" }
        }
    };
    const explanation = await generateLLMExplanation(
        fakeUser,
        "HIGH",
        fakePlan
    );
    res.json({ explanation });
});



// Use routes
app.use("/api/vitals", vitalsRoutes);
app.use("/api/wearable", wearableRoutes);
app.use("/api/stress", stressTrendRoutes);

module.exports = app;