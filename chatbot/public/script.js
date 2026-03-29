let latestReportData = null;

async function sendData() {

    const profile = {
        name: document.getElementById("name").value,
        age: parseInt(document.getElementById("age").value),
        height: parseFloat(document.getElementById("height").value),
        weight: parseFloat(document.getElementById("weight").value),
        gender: document.getElementById("gender").value,
        activity: document.getElementById("activity").value,
        goal: document.getElementById("goal").value
    };

    const question = document.getElementById("question").value;

    const response = await fetch("http://localhost:7000/chat", {
    method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, question })
    });

    const data = await response.json();

    document.getElementById("response").innerText = data.answer;
    document.getElementById("report").innerText = data.report;

    latestReportData = {
        profile,
        bmi: parseFloat(data.report.match(/BMI:\s([\d.]+)/)[1]),
        targetCalories: parseInt(data.report.match(/Requirement:\s(\d+)/)?.[1] || 0),
        totalCalories: data.meals.reduce((sum, m) => sum + m.calories, 0),
        meals: data.meals,
        score: parseInt(data.report.match(/Score:\s(\d+)/)?.[1] || 0)
    };
}

async function downloadPDF() {

    if (!latestReportData) {
        alert("Generate report first!");
        return;
    }

    const response = await fetch("http://localhost:7000/download-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latestReportData)
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "NutriSync_Report.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
}