
function showManual(){
document.getElementById("manualForm").style.display="block";
document.getElementById("wearable").style.display="none";
}

function showWearable(){
document.getElementById("manualForm").style.display="none";
document.getElementById("wearable").style.display="block";
}

function submitVitals(){

let hr=document.getElementById("hr").value
let sleep=document.getElementById("sleep").value
let activity=document.getElementById("activity").value
let spo2=document.getElementById("spo2").value

let valid=true

// Clear old errors
document.getElementById("hrError").innerText=""
document.getElementById("sleepError").innerText=""
document.getElementById("activityError").innerText=""
document.getElementById("spo2Error").innerText=""

// Heart Rate Validation
if(hr<40 || hr>120){
document.getElementById("hrError").innerText="Heart rate must be between 40 - 120"
valid=false
}

// Sleep Validation
if(sleep<0 || sleep>12){
document.getElementById("sleepError").innerText="Sleep must be between 0 - 12 hours"
valid=false
}

// Activity Validation
if(activity<0 || activity>180){
document.getElementById("activityError").innerText="Activity must be between 0 - 180 minutes"
valid=false
}

// SpO2 Validation
if(spo2<90 || spo2>100){
document.getElementById("spo2Error").innerText="SpO2 must be between 90 - 100"
valid=false
}

if(!valid){
return
}

let vitalsData={
heart_rate:hr,
sleep_hours:sleep,
activity_minutes:activity,
spo2:spo2
}

console.log(vitalsData)

alert("Vitals Submitted Successfully")

}
