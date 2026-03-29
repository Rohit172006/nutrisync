function calculateBMI(weight, heightCm) {
    const heightM = heightCm / 100;
    return (weight / (heightM * heightM)).toFixed(2);
}

function calculateBMR(weight, heightCm, age, gender) {
    if (gender.toLowerCase() === "male") {
        return 10 * weight + 6.25 * heightCm - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * heightCm - 5 * age - 161;
    }
}

function calorieTarget(bmr, activity) {
    const activityMap = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725
    };

    return Math.round(bmr * (activityMap[activity] || 1.2));
}

module.exports = {
    calculateBMI,
    calculateBMR,
    calorieTarget
};