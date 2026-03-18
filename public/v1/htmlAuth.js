import { db, auth, getUserFieldById, status } from "./index.js";

import { signUp, login, logout, } from "./auth.js"


document.getElementById("signup").addEventListener("click", signUp)
document.getElementById("login").addEventListener("click", login)

const uid = localStorage.getItem("uid");
if(uid){
    window.location.href = "account.html"
}