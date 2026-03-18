import { db, auth } from "/v2/src/backend/index.js";
import { status, getUserFieldById } from "/v2/src/tools/script.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

export class Authenticator {

constructor() {}

// ===== SIGNUP =====
signUp = async(email, password) => {
    if(!email || !password){
        status("Renseigner vos informations !", false)
        return false
    }

    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid

        await setDoc(doc(collection(db, "users"), userId),{
            email,
            createdAt: new Date().toISOString()
        })
        this.saveLocal(userId, 10)
        status("Votre compte a été créé !", true)
        
        this.myAccount()

    } catch(e) {
        console.error("Erreur d'inscription: ", e.message);

        switch (e.code) {
            case "auth/invalid-email":
                status("L'adresse email n'est pas valide.", false);
                break;
            case "auth/email-already-in-use":
                status("Votre email est déjà utilisé.", false);
                break;
            case "auth/password-does-not-meet-requirements":
                status("Le mot de passe est trop court.", false);
                break;
            default:
                status("Erreur lors de l'inscription.", false);
                break;
        }
        throw e
    }
}


// ===== LOGIN =====
signIn = async(email, password) => {
    if(!email || !password){
        status("Renseigner vos informations !", false)
        return false
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        this.saveLocal(userId, 10)
        status("Vous êtes connecté !", true)

        this.myAccount()
        
    } catch(e){
        console.error("Erreur de connexion: ", e.message);

        switch (e.code) {
            case "auth/user-not-found":
                status("Utilisateur non trouvé.", false);
                break;
            case "auth/wrong-password":
                status("Mot de passe incorrect.", false);
                break;
            case "auth/invalid-login-credentials":
                status("Mot de passe incorrect.", false);
                break;
            case "auth/invalid-email":
                status("L'adresse email n'est pas valide.", false);
                break;
            default:
                status("Erreur lors de la connexion.", false);
                break;
        }
        throw e
    }
}

// ==== ACCOUNT ANINYMOUS ====
signInAnonymous = async () => {
    try {
        const userCredential = await signInAnonymously(auth)
        const userId = userCredential.user.uid
        
        await setDoc(doc(collection(db, "users"), userId), {
            createdAt: new Date().toISOString()
        })
        this.saveLocal(userId, 1)

        return true

    } catch(e) {
        console.error(e)
        status("Erreur lors de l'inscription.", false)
        return false
    }
}



credentials = () => {
    window.location.href = "/v2/login/credentials/"
}

account = () => {
    window.location.href = "/v2/login/account/"
}

saveLocal = async(userId, maxDay) => {
    localStorage.setItem("uid", userId)
    localStorage.setItem("sessionExpiry", 
        new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * maxDay)
        .toISOString())
}


myAccount = async () =>{
    const div = document.getElementById("auth");
    if(div){
        div.innerHTML = `<button><a href="/v2/login/account/">Mon Compte</a></button>`
    }
    document.getElementById("email").value = ""
    document.getElementById("password").value = ""
}


// ==== PSEUDO ====
updateUserPseudo = async (pseudo) => {
    if(!pseudo){
        status("Saisissez un pseudo !", false)
        return false
    }

    try {
        const userId = localStorage.getItem("uid")
        await updateDoc(doc(collection(db, "users"), userId), {
            pseudo,
            updatedAt: new Date().toISOString()
        })
        status("Votre pseudo est enregistré.", true)

        return true

    } catch(e) {
        console.error(e)
        status("Votre pseudo est indisponible.")
        return 
    }   
}


// ==== LOGOUT ====
logout = async() => {
    localStorage.removeItem("uid")
    localStorage.removeItem("sessionExpiry")
    window.location.href = "/v2/login/";
}

// ==== VERIFY ACCOUNT AND SESSION ====
verifyAccount = async () => {
    const uid = localStorage.getItem("uid")
    if(uid){
        const user = await getUserFieldById(uid)
        if(user) {
            this.account()
        }
    }
}

verifyUserPseudo = async () => {
    const uid = localStorage.getItem("uid")
    const user = await getUserFieldById(uid)
    if(!(user && user.pseudo)) {
        this.credentials()
    }
}

verifyUserSession = async () => {
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

}