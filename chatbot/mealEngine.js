const meals = require("./data/meal.json");

function recommendMeals(targetCalories, goal) {

    let sortedMeals = [...meals];

    if (goal.toLowerCase().includes("muscle")) {
        sortedMeals.sort((a, b) => b.protein - a.protein);
    }

    if (goal.toLowerCase().includes("weight")) {
        sortedMeals.sort((a, b) => a.calories - b.calories);
    }

    let total = 0;
    let selected = [];

    for (let meal of sortedMeals) {
        if (total + meal.calories <= targetCalories) {
            selected.push(meal);
            total += meal.calories;
        }
    }

    return { selected, total };
}

module.exports = { recommendMeals };