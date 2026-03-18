import { Authenticator } from "/v2/src/api/login.js";

const auth = new Authenticator()

auth.verifyAccount()

document.getElementById("signup").addEventListener("click", () => {
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()
    auth.signUp(email, password)
})

document.getElementById("signin").addEventListener("click", () => {
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()
    auth.signIn(email, password)
})