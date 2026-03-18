import { db } from "/v2/src/backend/index.js";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { Authenticator } from "/v2/src/api/login.js"
import { getUserFieldById } from "/v2/src/tools/script.js";



const show = async () => {
    const auth = new Authenticator()
    auth.verifyUserPseudo()

    const uid = localStorage.getItem("uid")
    const data = await getUserFieldById(uid)

    const pseudo = document.getElementById("pseudo")
    if(pseudo && data.pseudo){
        pseudo.innerHTML = `${data.pseudo}`
    }

    const email = document.getElementById("email")
    if(email && data.email){
        email.innerHTML = `<div>Email :</div><em>${data.email}</em>`
    }

    const options = {hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'};

    let div = document.getElementById("createdAt")
    if(div && data.createdAt){
        let date = new Date(data.createdAt)
        date = date.toLocaleString('fr-FR', options)
        div.innerHTML = `<div>Créer :</div><em>${date}</em>`
    }

    div = document.getElementById("updatedAt")
    if(div && data.updatedAt){
        let date = new Date(data.updatedAt)
        date = date.toLocaleString('fr-FR', options)
        div.innerHTML = `<div>Modifier :</div><em>${date}</em>`
    }

    document.getElementById("change")?.addEventListener("click", async () => {
        const pseudo = document.getElementById("input-pseudo")
        await auth.updateUserPseudo(pseudo.value)
        show()
        pseudo.value = ""
    })

    document.getElementById("logout")?.addEventListener("click", () => {
        auth.logout()
    })
}

show()