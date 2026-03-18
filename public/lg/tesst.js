import { functions } from "./api.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";

function sendAge() {
    const age = 7;

    // Appel à la fonction cloud avec l'âge en paramètre
    const receiveAge = httpsCallable(functions,"addUserAge");

    receiveAge({ age: age })
      .then(result => {
        const message = result.data.message;
        alert(message);  // Affiche la réponse du serveur
      })
      .catch(error => {
        console.error("Erreur lors de l'appel de la fonction:", error);
        alert('Erreur lors de l\'envoi de l\'âge');
      });
}
sendAge()