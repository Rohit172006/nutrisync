const { Meal } = require("../models");

exports.moodRecommendation = async (req, res) => {

    try {

        const { mood } = req.body;

        if (!mood) {
            return res.status(400).json({
                error: "Mood is required"
            });
        }

        const meals = await Meal.findAll({
            where: { tag: mood }
        });

        res.json({
            mood,
            recommended_meals: meals
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Mood recommendation failed"
        });

    }

};