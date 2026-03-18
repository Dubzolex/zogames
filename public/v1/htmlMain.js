import { db, auth, detectUserSession, getUserFieldById, status } from "./index.js";
import { doc, addDoc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { gameContent } from "./package.js";
import { createGame, joinGameWithCode, joinGameWithList } from "./play.js"


// ===================== BUTTON =====================
document.getElementById("create1").addEventListener("click", async () => {
    await createGame({
        stage: "1",
        elementStatus: "status-c1",
        elementDuration: "time1",
        elementAccess: "public1",
        elementRound: "round1"
    })
})

document.getElementById("create2").addEventListener("click", async () => {
    await createGame({
        stage: "2",
        elementStatus: "status-c2",
        elementDuration: "time2",
        elementAccess: "public2",
        elementRound: "round2"
    })
})

document.getElementById("create3").addEventListener("click", async () => {
    await createGame({
        stage: "3",
        elementStatus: "status-c3",
        elementDuration: "time3",
        elementAccess: "public3",
        elementRound: "round3"
    })
})

document.getElementById("join").addEventListener("click", async () => {
    await joinGameWithCode("code", "status-j");
})

document.getElementById("connect").onclick = () => {
    if (localStorage.getItem("uid")) 
        window.location.href = "account.html";
    else 
        window.location.href = "auth.html";
}



// ===================== SNAPSHOT GAME LIST =====================
onSnapshot(collection(db, "game"), async (snapshot) => {
    try {
        const docs = snapshot.docs.map(doc => doc.data());
        let games = docs.filter(a => a.access == "public");
        games  = games.filter(a => !a.started);
        games  = games.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        games  = games.filter(a => Date.now() - new Date(a.createdAt).getTime() < 3600000);//< 1 hour

        const list = document.getElementById("list-game");

        if(games.length > 0){
            list.innerHTML = games.map((a, i) => {
                if(i>=6)
                    return null

                return  `<li class="fx-row jc-between ai-center px-10 w-300">
                        <div>${gameContent[a.stage].name}</div>
                        <div>${a.id}</div>
                        <i id="${a.id}" class="fa-solid fa-arrow-right"></i>
                    </li>`}).join("");
        }
        for (let a of games) {
            try{
                document.getElementById(a.id).onclick = () => joinGameWithList(a.id)
            } catch(e){

            }
        }
    } catch (e) {
        console.error(e)
    }
}, (e) => {
    console.error(e)
})