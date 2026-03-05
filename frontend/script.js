const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {

const type = password.getAttribute("type") === "password" ? "text" : "password";
password.setAttribute("type", type);

this.classList.toggle("fa-eye-slash");

});


document.getElementById("loginForm").addEventListener("submit", function(e){

e.preventDefault();

const email = document.getElementById("email").value;
const pass = document.getElementById("password").value;

if(email === "" || pass === "")
{
alert("Please fill all fields");
return;
}

alert("Login Successful!");

});