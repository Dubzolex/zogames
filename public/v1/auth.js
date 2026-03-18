import { db, auth, getUserFieldById, status, detectUserSession } from "./index.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";



// ===== SIGNUP =====
export const signUp = async() => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    if(!email || !password){
        status("Renseigner vos informations !", false)
        return
    }

    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid
        localStorage.setItem("uid", userId);
        localStorage.setItem("sessionExpiry", new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 10).toISOString());

        const pseudo = "Guest" + String(Math.floor(Math.random() * 9000) + 1000);
        await setDoc(doc(collection(db, "users"), userId),{
            pseudo,
            email,
            createdAt: new Date().toISOString()
        })

        status("Votre compte a été créé !", true)
        await myaccount()
        

    } catch(error){
        console.error("Erreur d'inscription: ", error.message);

        switch (error.code) {
            case "auth/invalid-email":
                status("L'adresse email n'est pas valide !", false);
                break;
            case "auth/email-already-in-use":
                status("Votre email est déjà utilisé !", false);
                break;
            case "auth/password-does-not-meet-requirements":
                status("Le mot de passe est trop court !", false);
                break;
            default:
                status("Erreur lors de l'inscription.", false);
                break;
        }
    }
}


// ===== LOGIN =====
export const login = async() => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!email || !password){
        status("Renseigner vos informations !", false)
        return
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        localStorage.setItem("uid", userId);
        localStorage.setItem("sessionExpiry", new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 10).toISOString());

        status("Vous êtes connecté !", true)
        await myaccount()
        
    } catch(error){
        console.error("Erreur de connexion: ", error.message);

        switch (error.code) {
            case "auth/user-not-found":
                status("Utilisateur non trouvé !", false);
                break;
            case "auth/wrong-password":
                status("Mot de passe incorrect !", false);
                break;
            case "auth/invalid-login-credentials":
                status("Mot de passe incorrect !", false);
                break;
            case "auth/invalid-email":
                status("L'adresse email n'est pas valide !", false);
                break;
            default:
                status("Erreur lors de la connexion.", false);
                break;
        }
    }
}


const myaccount = async () =>{
    const div = document.getElementById("auth");
    if(div){
        div.innerHTML = `<button><a href="account.html">Mon Compte</a></button>`
    }
    const email = document.getElementById("email")
    const password = document.getElementById("password")
    try{
        email.value = ""
        password.value = ""
    }catch{

    }
}



// ==== PSEUDO ====
export const updateUserPseudo = async () => {
    if(!await detectUserSession()){
        window.location.href = "index.html"
        return
    }

    const pseudo = document.getElementById("pseudo").value.trim()
    if(!pseudo){
        status("Remplir le champ pseudo !", false)
    }

    const userId = localStorage.getItem("uid")
    await updateDoc(doc(collection(db, "users"), userId), {
        pseudo,
        updatedAt: new Date().toISOString()
    })
}



// ==== LOGOUT ====
export const logout = async() => {
    localStorage.removeItem("uid")
    localStorage.removeItem("sessionExpiry")
    window.location.href = "auth.html";
}



