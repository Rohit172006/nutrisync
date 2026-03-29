function healthScore(bmi, totalCalories, targetCalories) {
    let score = 0;

    if (bmi >= 18.5 && bmi <= 24.9) score += 30;
    else score += 15;

    const diff = Math.abs(totalCalories - targetCalories);

    if (diff < 150) score += 30;
    else if (diff < 300) score += 20;
    else score += 10;

    score += 20;

    return Math.min(score, 100);
}

function generateReport(profile, bmi, targetCalories, totalCalories, meals, score) {
    return `
======== NutriSync AI Health Report ========

Name: ${profile.name}
Age: ${profile.age}
Goal: ${profile.goal}

BMI: ${bmi}
Daily Calorie Requirement: ${targetCalories}
Meal Plan Calories: ${totalCalories}

Health Score: ${score}/100

Recommended Meals:
${meals.map(m => `- ${m.name} (${m.calories} kcal)`).join("\n")}

============================================
`;
}

module.exports = {
    healthScore,
    generateReport
};