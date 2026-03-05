const BASE_URL = "http://localhost:5000";

// Toggle Tabs
function showManual() {
    document.getElementById("manualForm").style.display = "block";
    document.getElementById("wearable").style.display = "none";
}

function showWearable() {
    document.getElementById("manualForm").style.display = "none";
    document.getElementById("wearable").style.display = "block";
}

// Manual Submit
async function submitVitals() {

    const resting_hr = parseInt(document.getElementById("hr").value);
    const sleep_hours = parseFloat(document.getElementById("sleep").value);
    const activity_minutes = parseInt(document.getElementById("activity").value);
    const spo2 = parseInt(document.getElementById("spo2").value);

    try {
        const response = await fetch(`${BASE_URL}/api/vitals/manual`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                resting_hr,
                sleep_hours,
                activity_minutes,
                spo2
            })
        });

        const data = await response.json();

        console.log("Response:", data);

        alert(`
Stress Level: ${data.stress_prediction.stress_level}
Calories Target: ${data.nutrition_plan.calorieTarget}
Explanation: ${data.explanation}
        `);

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to server");
    }
}

// Wearable Sync
document.querySelector(".sync-btn").addEventListener("click", async () => {

    try {
        const response = await fetch(`${BASE_URL}/api/vitals/wearable-sync`, {
            method: "POST"
        });

        const data = await response.json();

        console.log("Wearable Data:", data);

        alert(`
Wearable Synced!
Stress Level: ${data.stress_prediction.stress_level}
Calories Target: ${data.nutrition_plan.calorieTarget}
        `);

    } catch (error) {
        console.error(error);
        alert("Wearable sync failed");
    }

});