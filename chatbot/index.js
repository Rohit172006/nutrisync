const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const { calculateBMI, calculateBMR, calorieTarget } = require("./healthEngine");
const { recommendMeals } = require("./mealEngine");
const { healthScore, generateReport } = require("./reportEngine");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const OLLAMA_URL = "http://localhost:11434/api/generate";

async function queryLlama(prompt) {
    const response = await axios.post(OLLAMA_URL, {
        model: "llama3.2",
        prompt: prompt,
        stream: false
    });
    return response.data.response;
}


app.get("/", (req, res) => {
    res.send("NutriSync API working");
});

app.post("/chat", async (req, res) => {
    try {
        const { profile, question } = req.body;

        const bmi = parseFloat(calculateBMI(profile.weight, profile.height));
        const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
        const targetCalories = calorieTarget(bmr, profile.activity);

        const mealPlan = recommendMeals(targetCalories, profile.goal);

        const score = healthScore(bmi, mealPlan.total, targetCalories);

        const prompt = `
You are NutriSync AI.
Provide safe nutrition advice.
User BMI: ${bmi}
Goal: ${profile.goal}
User Question: ${question}
`;

        const aiResponse = await queryLlama(prompt);

        const report = generateReport(
            profile,
            bmi,
            targetCalories,
            mealPlan.total,
            mealPlan.selected,
            score
        );

        res.json({
            answer: aiResponse,
            meals: mealPlan.selected,
            report: report
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/download-report", (req, res) => {

    const { profile, bmi, targetCalories, totalCalories, meals, score } = req.body;

    const doc = new PDFDocument();

    const fileName = `NutriSync_Report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ===== PDF CONTENT =====
    doc.fontSize(20).text("NutriSync AI Health Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${profile.name}`);
    doc.text(`Age: ${profile.age}`);
    doc.text(`Goal: ${profile.goal}`);
    doc.moveDown();

    doc.text(`BMI: ${bmi}`);
    doc.text(`Daily Calorie Requirement: ${targetCalories}`);
    doc.text(`Meal Plan Calories: ${totalCalories}`);
    doc.moveDown();

    doc.text(`Health Score: ${score}/100`);
    doc.moveDown();

    doc.text("Recommended Meals:");
    meals.forEach(m => {
        doc.text(`- ${m.name} (${m.calories} kcal)`);
    });

    doc.end();

    stream.on("finish", () => {
        res.download(filePath, fileName, () => {
            fs.unlinkSync(filePath); // delete after download
        });
    });

});

app.listen(5000, () => {
    console.log("NutriSync AI running on http://localhost:7000");
});