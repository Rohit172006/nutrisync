
function showManual(){
document.getElementById("manualForm").style.display="block";
document.getElementById("wearable").style.display="none";
}

function showWearable(){
document.getElementById("manualForm").style.display="none";
document.getElementById("wearable").style.display="block";
}

function submitVitals(){

let hr=document.getElementById("hr").value;
let sleep=document.getElementById("sleep").value;
let activity=document.getElementById("activity").value;
let spo2=document.getElementById("spo2").value;

let data={
resting_hr:hr,
sleep_hours:sleep,
activity_minutes:activity,
spo2:spo2
};

console.log("Sending Data:",data);

fetch("/api/vitals/",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
})
.then(res=>res.json())
.then(data=>console.log(data));

alert("Vitals Submitted Successfully");

}
