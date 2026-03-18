import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"


export const getUserFieldById = async (userId, field="") => {
    if (!userId) {
        console.error("L'ID de l'utilisateur est requis.");
        return null;
    }

    try {
        const docRef = doc(collection(db,"users"), userId);
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const docUser = docSnap.data();
            return docUser[field] ?? docUser;
        } else {
            console.error("Document non trouvé !");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du champ :", error);
        return null;
    }
}

export const getUserPseudoByPlayerIdByGameId = async (gid, pid) => {
    if (!gid || !pid) {
        console.error("L'id de la game et du joueur sont requis.");
        return null;
    }
    try {
        const docRef = doc(db, "game", gid, "maps", "bindings")
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
            const doc = docSnap.data();
                //console.log(doc)
                //console.log(doc[pid])
            return await getUserFieldById(doc[pid], "pseudo");
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du champ :", error);
        return null;
    }
}


export const status = async (message, success, input="status") => {
  const div = document.getElementById(input);
  if (div) {
    div.textContent = message;
    div.classList.remove("green", "red");
    div.classList.add(success ? "green" : "red");

    setTimeout(() => {
        div.textContent = "";
        div.classList.remove("green", "red");
    }, 10000);
  }
}
