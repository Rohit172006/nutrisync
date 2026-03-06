const axios = require("axios");

async function estimateFoodMacros(foodName) {
    const prompt = `
You are a professional nutritionist.

Estimate the nutrition values for the food below.

Food: ${foodName}

Return ONLY valid JSON.

{
"calories": number,
"protein": number,
"carbs": number,
"fat": number,
"sodium": number
}
`;

    try {
        const response = await axios.post(
            "http://127.0.0.1:11434/api/generate",
            {
                model: "llama3.2",
                prompt: prompt,
                stream: false
            },
            { timeout: 3000 } // Add a quick timeout so it doesn't hang
        );

        const text = response.data.response;
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error("Invalid nutrition response");
        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.warn("Ollama unavailable, falling back to heuristic mock for:", foodName);

        // Deterministic mock generation based on string
        let seed = 0;
        for (let i = 0; i < foodName.length; i++) {
            seed += foodName.charCodeAt(i);
        }

        return {
            calories: 100 + (seed % 600),
            protein: 5 + (seed % 30),
            carbs: 10 + (seed % 50),
            fat: 2 + (seed % 20),
            sodium: 100 + (seed % 900)
        };
    }
}

module.exports = { estimateFoodMacros };