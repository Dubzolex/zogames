// connexion.js
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";
import {signOut,signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js"
import {auth,getUserPseudobyID} from "./firebase.js";


let userIDloc = localStorage.getItem("userID") || "";

// Initialisation des fonctions Firebase
const functions = getFunctions();
const updateAge = httpsCallable('updateAge');

// Appeler la fonction
updateAge({ age: 25 }).then(result => {
    console.log(result.data.message); // "Âge mis à jour avec succès."
})
.catch(error => {
    console.error('Erreur:', error.message);
});