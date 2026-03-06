const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Import routes
const vitalsRoutes = require("./routes/vitals.routes");
const wearableRoutes = require("./routes/wearable.routes");
const { generateLLMExplanation } = require("./services/llm.service");
const foodRoutes = require("./routes/food.routes");
const moodRoutes = require("./routes/mood.routes");
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");

// Use routes
app.use("/api/vitals", vitalsRoutes);
app.use("/api/wearable", wearableRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;

