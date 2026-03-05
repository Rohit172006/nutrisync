const API = "http://localhost:5000";

function signup() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("All fields are required");
        return;
    }

    fetch(API + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "profile.html"; // Redirect to profile form
            } else if (data.message === "Signup successful") {
                // Fallback if token not returned (should not happen)
                window.location.href = "login.html";
            }
        })
        .catch(err => {
            console.error(err);
            alert("Something went wrong. Check console.");
        });
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Email and password required");
        return;
    }

    fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "pages/dashboard.html"; // Direct to dashboard
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Something went wrong. Check console.");
        });
}

// Profile form submission
function saveProfile() {
    const age = document.getElementById("age").value;
    const weight = document.getElementById("weight").value;
    const gender = document.getElementById("gender").value;
    const height = document.getElementById("height").value;
    const diseases = document.getElementById("diseases").value;
    const allergies = document.getElementById("allergies").value;
    const fitness_goal = document.getElementById("fitness_goal").value;

    if (!age || !weight || !gender || !height || !fitness_goal) {
        alert("Please fill all required fields");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in. Redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    fetch(API + "/profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ age, weight, gender, height, diseases, allergies, fitness_goal })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            if (data.message === "Profile updated successfully") {
                window.location.href = "pages/dashboard.html";
            }
        })
        .catch(err => {
            console.error(err);
            alert("Something went wrong. Check console.");
        });
}

// Optional: Check if user is logged in on profile page
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
    }
}