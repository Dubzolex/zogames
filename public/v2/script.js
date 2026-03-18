import { db } from "/v2/src/backend/index.js"
import { doc, addDoc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { TEMPLATE } from "/v2/src/frontend/package.js"
import { Player } from "/v2/src/api/game.js"

// ===================== SNAPSHOT GAME LIST =====================
onSnapshot(collection(db, "game"), async (snapshot) => {
    try {
        const docs = snapshot.docs.map(doc => doc.data());
        let games = docs.filter(a => a.access == "public")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .filter(a => Date.now() - new Date(a.createdAt).getTime() < 3600000);//< 1 hour

        const list = document.getElementById("list-game");

        if(games.length > 0){
            list.innerHTML = games.map((a, i) => {
                if(i>=6)
                    return null

                return  `<li class="fx-row jc-between ai-center px-10 w-300">
                        <div>${TEMPLATE[a.stage].name}</div>
                        <div>${a.id}</div>
                        <i id="${a.id}" class="fa-solid fa-arrow-right"></i>
                    </li>`}).join("");
        }
        for (let a of games) {
            try{
                document.getElementById(a.id).onclick = () => {
                    const p = new Player("status-j")
                    p.join(a.id)
                }
            } catch(e){

            }
        }
    } catch (e) {
        console.error(e)
    }
}, (e) => {
    console.error(e)
})