const { askChatbot } = require("../services/llm.service");
const User = require("../models/user.model");

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        // Try getting a user context (defaulting to the only available dummy user for context logic)
        const user = await User.findOne();

        let userContextStr = "";
        if (user) {
            userContextStr = `User Profile: Age: ${user.age}, Weight: ${user.weight}kg, Goal: ${user.goal}, Health Conditions: ${user.disease || 'None'}.`;
        }

        const reply = await askChatbot(message, userContextStr);

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        return res.status(500).json({ error: "Failed to process chat message." });
    }
};
