import { db, getUserFieldById, getPseudoByUserIdByGameId, status } from "./index.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

    document.getElementById("a").onclick = async () => {
    // La fonction est correctement affectée à la propriété onclick
        const m = document.getElementById("b")
        const v = m.checked
        console.log(m,v)


        
    };