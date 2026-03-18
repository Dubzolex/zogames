import { db, auth, getUserFieldById, status } from "./index.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

/*
signInAnonymously(auth)
  .then((userCredential) => {
    // L'objet userCredential contient l'objet user (utilisateur connecté)
    const user = userCredential.user;
    
    // Récupérer l'UID
    const uid = user.uid;
    console.log("UID de l'utilisateur anonyme:", uid);

    // Mettre l'UID dans le stockage local (localStorage)
    localStorage.setItem('uid', uid); 

    // Mettre d'autres données dans Firestore, par exemple :
    // db.collection("players").doc(uid).set({ status: "anonyme" });
  })
  .catch((error) => {
    // Gérer les erreurs de connexion ici
    console.error("Erreur de connexion anonyme:", error);
  })*/