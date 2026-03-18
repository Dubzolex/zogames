import { db, getUserFieldById, detectUserSession, status } from "./index.js";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { gameContent } from "./package.js";
import { joinGameWithoutAccount } from "./play.js"


const params = new URLSearchParams(window.location.search)
const gameId = params.get("g")


document.getElementById("party")?.addEventListener("click", async () => {
    await joinGameWithoutAccount({gameId})
})


onSnapshot(doc(collection(db, "game"), gameId), async (snapshot) => {
    const doc = snapshot.data()

    document.getElementById("name").textContent = gameContent[doc.stage].name
    document.getElementById("code").textContent = gameId
})
