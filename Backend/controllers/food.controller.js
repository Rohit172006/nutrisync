const { estimateFoodMacros } = require("../services/food.service");
const { Recommendation, User } = require("../models");

exports.analyzeFood = async (req, res) => {

try {

const userId = 1;
const { foodName } = req.body;

if (!foodName) {
return res.status(400).json({ error: "Food name required" });
}

const user = await User.findByPk(userId);

const latestPlan = await Recommendation.findOne({
where: { UserId: userId },
order: [["createdAt", "DESC"]]
});

const macros = await estimateFoodMacros(foodName);

const calories = macros.calories;
const carbs = macros.carbs;
const sodium = macros.sodium;

let verdict = "SAFE";
let reason = "Food fits today's nutrition targets.";

if (calories > latestPlan.calorie_target * 0.4) {
verdict = "LIMITED";
reason = "High calorie portion relative to daily allowance.";
}

if (user.disease === "hypertension" && sodium > 500) {
verdict = "NOT RECOMMENDED";
reason = "High sodium not suitable for hypertension.";
}

if (user.disease === "diabetes" && carbs > 50) {
verdict = "NOT RECOMMENDED";
reason = "High carbohydrate load may spike glucose.";
}

res.json({
food: foodName,
macros,
verdict,
reason
});

}catch (error) {
    console.error("REAL ERROR:", error.response?.data || error.message);
    res.status(500).json({
        error: error.response?.data || error.message
    });
}
};