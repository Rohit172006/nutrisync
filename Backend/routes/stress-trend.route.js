const express = require("express");
const router = express.Router();

router.get("/stress-trend", async (req, res) => {

    const userId = 1;

    const history = await Recommendation.findAll({
        where: { UserId: userId },
        attributes: ["stress_level", "createdAt"],
        order: [["createdAt", "ASC"]]
    });

    const mapped = history.map(record => {

        let score = 1;

        if (record.stress_level === "MODERATE") score = 2;
        if (record.stress_level === "HIGH") score = 3;

        return {
            date: record.createdAt,
            stress_level: record.stress_level,
            stress_score: score
        };
    });

    res.json(mapped);
});