import { doc, addDoc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"
import { TEMPLATE } from "/v2/src/frontend/package.js"
import { Player } from "/v2/src/api/game.js";
import { Authenticator } from "/v2/src/api/login.js";


const params = new URLSearchParams(window.location.search)
const gameId = params.get("g")

document.getElementById("join")?.addEventListener("click", async () => {
    try{
        const auth = new Authenticator()

        if(await auth.signInAnonymous()) {
            const pseudo = document.getElementById("pseudo")

            if(await auth.updateUserPseudo(pseudo.value)) {
                const p = new Player()
                await p.join(gameId)
            }
        }
        
    } catch(e) {
        console.error(e)
    }
})

onSnapshot(doc(collection(db, "game"), gameId), async (snapshot) => {
    const doc = snapshot.data()
    document.getElementById("name").textContent = TEMPLATE[doc.stage].name
    document.getElementById("code").textContent = gameId
})
