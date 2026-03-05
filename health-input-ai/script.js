
function showManual(){
document.getElementById("manualForm").style.display="block";
document.getElementById("wearable").style.display="none";
}

function showWearable(){
document.getElementById("manualForm").style.display="none";
document.getElementById("wearable").style.display="block";
}

function updateValue(id,value){
document.getElementById(id).innerText=value;
}

function submitVitals(){

let hr=document.getElementById("hr").value
let sleep=document.getElementById("sleep").value
let activity=document.getElementById("activity").value
let spo2=document.getElementById("spo2").value

// Basic validation

if(hr<40 || hr>120){
alert("Heart Rate out of range")
return
}

if(spo2<90){
alert("SpO2 too low. Please check health condition.")
return
}

let vitalsData={
heart_rate:hr,
sleep_hours:sleep,
activity_minutes:activity,
spo2:spo2
}

console.log("Vitals Data:",vitalsData)

// API call example

fetch("/api/vitals/",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(vitalsData)

})

.then(res=>res.json())
.then(data=>{

console.log("Server Response:",data)
alert("Vitals Submitted Successfully")

})

.catch(error=>{
console.log(error)
})

}
