import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";


const firebaseConfig = {
  apiKey: "AIzaSyAxzMqlfPiXqH65fN4A_ZQ8g4yAhNZK6NA",
  authDomain: "enzo-projet.firebaseapp.com",
  projectId: "enzo-projet",
  storageBucket: "enzo-projet.firebasestorage.app",
  messagingSenderId: "509431405679",
  appId: "1:509431405679:web:a3623be821a74149bb819a",
  measurementId: "G-WHNMXCK889"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
export const db = getFirestore(app);

// Initialiser Auth
export const auth = getAuth(app);

// Initialiser Firebase Functions
export const functions = getFunctions(app);


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

export const getPseudoByUserIdByGameId = async (gid, pid) => {
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


export const detectUserSession = async () => {
    const userId = localStorage.getItem("uid")
    if(!userId){
        localStorage.removeItem("uid");
        localStorage.removeItem("sessionExpiry");
        alert("Créez-vous un compte !")
        return false
    }

    const pseudo = await getUserFieldById(userId, "pseudo");
    if(!pseudo){
        localStorage.removeItem("uid");
        localStorage.removeItem("sessionExpiry");
        //alert("Un problème est survenu !");
        return false
    }

    const timeStamp = localStorage.getItem("sessionExpiry");
    if (timeStamp) {
        const token = new Date(timeStamp);
        const now = new Date();

        if (token < now) {
            localStorage.removeItem("uid");
            localStorage.removeItem("sessionExpiry");
            alert("Session expirée !");
            return false
        }
    } else {
        localStorage.removeItem("uid");
        localStorage.removeItem("sessionExpiry");
        return false
    }

    return true
}