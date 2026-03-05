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

const response = await axios.post(
"http://127.0.0.1:11434/api/generate",
{
model: "llama3.2",
prompt: prompt,
stream: false
}
);

const text = response.data.response;

const jsonMatch = text.match(/\{[\s\S]*\}/);

if (!jsonMatch) throw new Error("Invalid nutrition response");

return JSON.parse(jsonMatch[0]);
}

module.exports = { estimateFoodMacros };