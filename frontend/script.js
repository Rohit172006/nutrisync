const API = "http://localhost:5000";

function signup(){

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

fetch(API+"/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
email,
password
})
})
.then(res=>res.json())
.then(data=>{
alert(data.message);
window.location="index.html";
})

}



function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

fetch(API+"/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
})
.then(res=>res.json())
.then(data=>{

if(data.token){

localStorage.setItem("token",data.token);

window.location="pages/dashboard.html";

}else{
alert(data.message)
}

})

}