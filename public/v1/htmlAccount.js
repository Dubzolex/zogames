import { db, getUserFieldById, detectUserSession, status } from "./index.js";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { logout, updateUserPseudo } from "./auth.js"

document.getElementById("logout").addEventListener("click", logout)


const uid = localStorage.getItem("uid");
if(!uid){
    window.location.href = "index.html"
}

onSnapshot(doc(db, "users", uid), async (snapshot) => {
    const field = snapshot.data()
    const pseudo = document.getElementById("user-pseudo")
    if(pseudo && field.pseudo){
        pseudo.innerHTML = `
        <div class="fx-col gap-20">
            <div>Bienvenue <strong>${field.pseudo}</strong></div>
            <div class="fx-col" gap-20">
                <div class="fx-row gap-20 ai-center">
                    <div>
                        <input id="pseudo" placeholder="Nouveau Pseudo !" required autocomplete="off">
                    </div>
                    <div>
                        <button id="change">Changer</button>
                    </div>
                </div>
            </div>
        </div>`
    }

    const email = document.getElementById("email")
    if(email && field.email){
        email.innerHTML = `<div>Email :</div><em>${field.email}</em>`
    }

    const options = {hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'};

    let div = document.getElementById("createdAt")
    if(div && field.createdAt){
        let date = new Date(field.createdAt)
        date = date.toLocaleString('fr-FR', options)
        div.innerHTML = `<div>Créer :</div><em>${date}</em>`
    }

    div = document.getElementById("updatedAt")
    if(div && field.updatedAt){
        let date = new Date(field.updatedAt)
        date = date.toLocaleString('fr-FR', options)
        div.innerHTML = `<div>Modifier :</div><em>${date}</em>`
    }

    document.getElementById("change")?.addEventListener("click", updateUserPseudo)

}, (e) => {
    console.error(e);
})