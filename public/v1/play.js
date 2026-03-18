import { db, auth, detectUserSession, getUserFieldById, status } from "./index.js";
import { doc, addDoc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";


import { gameContent } from "./package.js";


const generateRandomNumberGame = async () => {
    try{
        let gameId, snap
        do {
            gameId = String(Math.floor(Math.random() * 900000) + 100000);
            const docRef = doc(db, "game", gameId);
            snap = await getDoc(docRef);
        } while (snap.exists());
        return gameId
    } catch(e){
        throw e
    }
}


const collectEntry = async (data) => {
    const {stage, elementAccess, elementDuration, elementRound} = data

    let values = {stage}

    let div = document.getElementById(elementAccess)
    if(div){
        const access = div.value
        values = {...values, access}
    }
    div = document.getElementById(elementDuration)
    if(div){
        const duration = div.value
        values = {...values, duration}
    }else{
        values = {...values, duration: "0"}
    }
    div = document.getElementById(elementRound)
    if(div){
        const maxRound = div.value
        values = {...values, maxRound}
    } else{
        values = {...values, maxRound: 1}
    }

    return values
}


const configureSettings = async (data) => {
    const {stage, maxRound, gameId, access, duration} = data

    //Configurer les rounds
    let round = {}; 
    for (let i = 1; i <= maxRound; i++) {
        //phase
        round[i] = {phase: "home"}

        //theme
        const themes = gameContent[stage].theme
        const theme = themes[Math.floor(Math.random() * themes.length)]
        round[i] = {...round[i], theme}

        //lettre
        try{
            const letters = gameContent[stage].letter
            const letter = letters[Math.floor(Math.random() * letters.length)]
            round[i] = {...round[i], letter}
        } catch(e){

        }
    }

    //Enregistrer la configuration de la partie
    try{
        await setDoc(doc(db, "game", gameId), {
            createdAt: new Date().toISOString(),
            stage,
            duration,
            access,
            round,
            currentRound: 1,
            nextRound: 1,
            maxRound,
            id: gameId,
            started: false
        });
    } catch(e){
        throw new Error("Configure settings" + e)
    }
}


const registerPlayers = async (data) => {
    const {isHost, gameId} = data


    //Joueur deja inscrit
    const userId = localStorage.getItem("uid")
    if(!userId){
        if(isHost){
            status
        }else{
            window.location.href = `connect.html?g=${gameId}`
        }
        return
    }
    try{
        const mapRef = doc(db, "game", gameId, "maps", "bindings")
        const snap = await getDoc(mapRef)
        let data = snap.data()

        if(Object.keys(data).includes(userId)){
            const playerId = data[userId]
            await registerPlayersAtRound(gameId, playerId)
            return
        }

    } catch(e){
        //console.error(e)
    }

    
    
    try{
        let playerId = String(Math.floor(Math.random() * 900000) + 100000)

        //Document Maps
        const mapRef = doc(db, "game", gameId, "maps", "bindings")
        console.log(userId)
        try{
            await updateDoc(mapRef, {
                [playerId]: userId,
                [userId]: playerId
            })
        }catch{
            await setDoc(mapRef, {
                [playerId]: userId,
                [userId]: playerId
            })
        }

        await new Promise(r => setTimeout(r, 1000))

        //Document Players
        const playerRef = doc(db, "game", gameId, "players", playerId)
        await setDoc(playerRef, {
            joinedAt: new Date().toISOString(),
            id: playerId,
            isHost
        })
        
        await registerPlayersAtRound(gameId, playerId)

    } catch(e){
        status("Votre inscription a échoué !", false, "status-j")
        console.error(e)
    }
}


const registerPlayersAtRound = async (gameId, playerId) => {
    //Documents Submissions
    try{
        const gameRef = doc(db, "game", gameId)
        const snap = await getDoc(gameRef)
        const docs = snap.data()
        console.log(docs)
        const round = docs.currentRound || 1

        await setDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), {
            id: playerId,
            round: round,
            isPresent: true
        })

    } catch(e){
        status("Votre inscription a échoué !", false, "status-j")
        console.error(e)
        return
    }
    
    window.location.href = `game.html?g=${gameId}&p=${playerId}`;
}




// ==================== CREATE GAME ====================
export const createGame = async (data) => {
    const {elementStatus} = data

    if(localStorage.getItem("uid")){
        try{
        let gameId = await generateRandomNumberGame()
        let value = await collectEntry(data)
        await configureSettings({...value, gameId})
        await registerPlayers({isHost: true, gameId})
        } catch(e){
            console.error(e)
            status("Votre inscription à la partie a échouée.", false, elementStatus)
        }
        return
    }
    status("Veuillez-vous inscrire.", false, elementStatus)
    
}




// ==================== JOIN GAME ====================
export const joinGameWithCode = async (input, div) => {

    try{
        const code = document.getElementById(input).value;
        if(!code){
            status("Veuillez rentrer un code.", false, div)
            return
        }
        await joinGameWithList(code, div)
    }
    catch(e){
        console.error(e)
        status("Veuillez rentrer un code.", false, div)
    }
}

export const joinGameWithList = async (gameId, div = "") => {
    let docRef, docSnap
    try{
        docRef = doc(db, "game", gameId);
        docSnap = await getDoc(docRef);
        if (!docSnap.exists()){
            status("Cette partie n'existe pas !", false, div)
            return
        }

    } catch(e){
        return
    }
    await registerPlayers({gameId, isHost: false})
}

export const joinGameWithoutAccount = async (data) => {
    const { gameId } = data
    try{
        const pseudo = document.getElementById("pseudo").value.trim()
        if(!pseudo){
            status("Remplir le champ pseudo !", false)
            return
        }

        const userCredential = await signInAnonymously(auth)
        const userId = userCredential.user.uid
        localStorage.setItem("uid", userId)
        localStorage.setItem("sessionExpiry", new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 1).toISOString())
        await setDoc(doc(collection(db, "users"), userId), {
            pseudo,
            createdAt: new Date().toISOString()
        })
        
    } catch (e){
        console.error(e)
        return
    }
    
    await registerPlayers({ gameId, isHost: false })
}