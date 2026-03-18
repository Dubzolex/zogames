import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"
import { status, getUserPseudoByPlayerIdByGameId } from "/v2/src/tools/script.js"
import { TEMPLATE } from "/v2/src/frontend/package.js"


const params = new URLSearchParams(window.location.search);
const gameId = params.get("g")
const playerId = params.get("p")
const module = "3"

let players = null
let submissions = null
let settings = null
let presents = null
let round = 0

const docRef = doc(db, "game", gameId)
let isUpdate = true
let isSearch = true
let timer = null
let countElement = 0


// ========== SETTINGS DATABASE ==========
onSnapshot(docRef, async (snapshot) => {
    try{
        isUpdate = true
        settings = snapshot.data()
        round = settings.currentRound

        if(!await verifyPlayerInGame()){
            return
        }
           
        await verifyHostInGame()

        await showPhase()
        await updateList()
        await updateNextPhase()

        isUpdate = false

    } catch (e){
        console.error("Database Settings", e)
    }
}, (e) => {
    console.error("Database Settings", e)
})

// ========== SUBMITS DATABASE ==========
onSnapshot(collection(docRef, "submissions"), async (snapshot) => {
    try {
        submissions = snapshot.docs.map(doc => doc.data())

        if(!isUpdate){
            await verifyHostInGame()
            await updateList()
            await updateNextPhase()
        }

    } catch (e){
        console.error("Database Submissions", e)
    }
}, (e) => {
    console.error("Database Submissions", e)
})

// ========== PLAYERS DATABASE ==========
onSnapshot(collection(docRef, "players"), async (snapshot) => {
    try {
        isSearch = true

        const docs = await Promise.all(snapshot.docs.map(async doc => {
            const pseudo = await getUserPseudoByPlayerIdByGameId(gameId, doc.id)
            return { 
                id: doc.id,
                pseudo: pseudo,
                ...doc.data()
            }
        }))
        players = docs.reduce((acc, player) => {
            acc[player.id] = player;
            return acc;
        }, {})

    } catch (e){
        console.error("Database Players", e)
    }
    isSearch = false
}, (e) => {
    console.error("Database Players", e)
})

// ========== FUNCTION ELEMENT ORDER ==========
const WaitForData = async () => {
    while (submissions == null || isSearch) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}


// ========== DISPLAY ELEMENT GAME EACH START PAGE ==========
const showPhase = async () => {
    const phase = settings.phase[round]
    const page = TEMPLATE[settings.stage][phase]

    if(page) {
        document.getElementById("container").innerHTML = page
    }

    //Partie Accueil, Formulaire, Résultat - nom du jeu
    let div = document.getElementById("name");
    if(div && !div.textContent){
        div.textContent = TEMPLATE[settings.stage].name;
    }

    //Partie Accueil, Formulaire, Résultat - Code de partie
    div = document.getElementById("code");
    if(div && !div.textContent){
        div.textContent = settings.id;
    }

    //Partie Accueil - Lettre du round
    div = document.getElementById("letter");
    if(div && !div.textContent){
        div.textContent = "Lettre " + settings.letter[round]
    }

    //Partie Accueil - Numéro du round
    const max = settings.maxRound
    div = document.getElementById("round")
    if(div && !div.textContent){
        div.textContent = "Tour " + round + " / " + max
    }

    updateHome()
    updateForm()
    updateCorrect()
    updateResult()

    clearInterval(timer);

    if(phase == "form"){
        startTimerForm()
    }
    if(phase == "correct"){
        startTimerScore()
    }
}


// ========== DISPLAY ELEMENT PLAYERS EACH START PAGE ==========
const updateHome = async () => {
    //Partie Accueil - Menu du jeu
    const launchBtn = document.getElementById("launch");
    if (launchBtn) {
        launchBtn.remove();
    }

    const menu = document.getElementById("menu");
    if(menu){
        if(presents.find(p => p.id == playerId)?.isHost){
            menu.innerHTML += `<button id="launch">Lancer</button>`
        }
    }

    //Partie Accueil - Liste des thèmes
    if(presents.find(p => p.id == playerId)?.isHost){
        const theme = document.getElementById("theme")
        if(theme)
            theme.innerHTML = TEMPLATE[settings.stage].themes.map((t, i) => {
                const check = TEMPLATE[settings.stage].check[i] || false
                return `<li class="fx-row gap-10">
                    <div>
                        <input type="checkbox" id="${i}"${check ? "checked" : ""}>
                    </div>
                    <div>${t}</div>
                </li>`
                }).join("")
    }
}

const updateForm = async () => {
    // Partie Formulaire - Lister les themes
    const form = document.getElementById("form");
    if(form && !form.innerHTML){
        countElement = 0
        const themes = settings.theme
        form.innerHTML = themes.map(p => {
            const t = TEMPLATE[settings.stage].themes[p]
            countElement++
            return `
            <li class="fx-row jc-between gap-40">
                <div class="fx-row jc-start ai-center">${t} :</div>
                <div>
                    <input id="${p}" type="text" placeholder="${settings.letter[round]}..." autocomplete="off">
                </div>
            </li>`}).join("")
    }
}

const updateCorrect = async () => {
    // Partie Correct - Liste des mots par theme
    const word = document.getElementById("word")
    if(word){
        const themes = settings.theme
        word.innerHTML = themes.map(i => {
            const t = TEMPLATE[settings.stage].themes[i]
            return  `<li class="fx-col gap-20">
                        <div class="fx-col "><strong>${t}</strong></div>
                        <div class="fx-col gap-20">
                            ${presents.map(p => {
                                try{
                                    if(p.response[i])
                                        return  `<div class="fx-row jc-between">
                                                    <div>${p.response[i]}</div>
                                                    <div>
                                                        <input type="checkbox" checked id="${i}${p.id}">
                                                    </div>
                                                </div>`
                                    return null
                                } catch(e){
                                    return null
                                }
                            }).join("")}
                        </div>
                    </li>`}).join("")
    }
}

const updateResult = async () => {
    let scores = {}
    for(let i=1; i <= round; i++){
        scores = await calculScore(scores, i)
    }
    let results = []
    for (let p of presents) {
        const pseudo = players[p.id].pseudo
        const points = scores[p.id] || 0
        results.push({ pseudo, points })
    }
    results.sort((a, b) => b.points - a.points)
    const tab = document.getElementById("result")
    if(tab)
        tab.innerHTML = `
            <table class="score-table">
            <thead><tr><th>/</th><th>Joueur</th><th>Points</th></tr></thead>
            <tbody>${results.map((r, i) => {
                if(!r.pseudo){
                    return null
                }
                return  `<tr><td>${i + 1}</td><td>${r.pseudo}</td><td>${r.points}</td></tr>`
            }).join('')}
            </tbody>
            </table>`
}

// Partie Résultat - Calcul des scores de la partie
const calculScore = async (score, round) => {
    try{
        const presents = submissions.filter(s => s.round == round && s.isPresent)
        const themes = settings.theme
        for(let p of presents){
            for(let t of themes){
                for(let m of presents){
                    try{
                        const value = p.score[t][m.id]
                        if(value){
                            score[m.id] = score[m.id] + 1 || 1
                        }
                    } catch(e){
                        //console.error(e)
                    }
                }
            }
        }
    } catch(e){

    }
    return score
}

// ========== UPDATE PLAYERS LISTS ==========
const updateList = async () => {

    // Partie Accueil - liste des joueurs de la partie
    const div1 = document.getElementById("player1")
    if(div1){
        div1.innerHTML = presents.filter(p => p.pseudo).map(p =>
            `<li class="fx-row gap-10">
                ${p.isHost ? `<i class="fa-solid fa-crown"></i>` : ""}
                <div>${p.pseudo}</div>
            </li>`
        ).join("")
    }

    // Partie Formulaire - liste des joueurs qui ont répondu
    const div2 = document.getElementById("player2")
    if(div2){
        div2.innerHTML = presents.filter(p => p.pseudo).map(p =>
            `<li class="fx-row gap-10">
                <div>${p.pseudo}</div>
                ${p.response ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
            </li>`
        ).join("")
    }

    // Partie Result - liste des joueurs pour le round suivant
    const div3 = document.getElementById("player3")
    if(div3){
        div3.innerHTML = presents.filter(p => p.pseudo && p.response).map(p =>
            `<li class="fx-row gap-10">
                <div>${p.pseudo}</div>
                ${p.score ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
            </li>`
        ).join("")
    }

    if(presents?.find(p => p.id == playerId)?.response){
        await wait("wait1")
    }

    if(presents?.find(p => p.id == playerId)?.score){
        await wait("wait2")
    }

    await buttonEventListener()
}

// ========== DISPLAY RESULT ==========



const updateNextPhase = async () => {
    const phase = settings.phase[round]
    const max = settings.maxRound

    // Partie Formulaire - Calcul des réponses
    if((phase == "form") && (presents.filter(p => p.response).length == presents.length)) {
        await updateDoc(docRef, { 
            [`phase.${round}`]: "correct",
            nextRound: round + 1
        })
    }

    // Partie Correct - Vérifier si les scores sont enregstré
    if((phase == "correct") && 
        (presents.filter(p => p.response && p.score).length == presents.filter(p => p.response).length)){
            await updateDoc(docRef, {
                [`phase.${round}`]: "next",
            })
    }

    // Partie Correct - Lancer le round suivant
    if(phase == "next"){
        if(round < max){
            await updateDoc(docRef, {
                currentRound: settings.nextRound
            })
        }
        else{
            await updateDoc(docRef, {
                [`phase.${round}`]: "score",
            })
        }
    }

    // Partie Form - récuperer les reponses des autres joueur sauf le premier
    const first = presents.find(p => p.response && p.first)
    if(phase == "form" && first && (first.id != playerId) ){
        await new Promise(resolve => setTimeout(resolve, 2000))
        await sendGlobal()
    }

}


// ========== Partie Accueil - Quitter la Partie ==========
const quit = async () => {
    try {
        const round = settings.currentRound
        const playerDoc = doc(docRef, "submissions", String(round + playerId));
        await updateDoc(playerDoc,{
            isPresent: false
        })
        window.location.href = "../../";
        
    } catch (e) {
        console.error(e); 
    }
}


// ========== Partie Accueil - Lancer le jeu ==========
const launch = async () => {
    try{
        const themes = TEMPLATE[settings.stage].themes
        let choose = []
        for(let i = 0; i < themes.length; i++){
            const input = document.getElementById(i)
            if(input && input.checked){
                choose.push(i)
            }
        }
        
        const round = settings.currentRound
        await updateDoc(docRef, { 
            started: true,
            theme: choose,
            [`phase.${round}`]: "form",
            nextRound: round + 1
        });
    } catch(e){
        console.error(e)
    }
}


// ========== Partie Formulaire - Envoyer les réponses ==========
const send = async () => {
    let response = {}
    const themes = settings.theme
    const letter = settings.letter[round]
    for(let t of themes){
        const input = document.getElementById(String(t))
        if(input && input.value){
            if(letter.toLowerCase() == input.value.charAt(0).toLowerCase()){
                response[t] = input.value
            } else{
                status(`Un mot ne commence pas par la lettre ${letter}.`, false)
                return
            }
        }
    }

    if(Object.keys(response).length < countElement){
        status("Répondre à tous les thèmes !", false)
        return
    }

    try{
        const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
        await updateDoc(playerDoc, {
            response,
            first: true
        })
        status("Les mots sont enregistrés !", true)
    } catch(e){
        console.error(e)
    }
}

const sendGlobal = async () => {
    let response = {}
    const themes = settings.theme
    const letter = settings.letter[round]
    for(let t of themes){
        const input = document.getElementById(String(t))
        if(input && input.value){
            if(letter.toLowerCase() == input.value.charAt(0).toLowerCase()){
                response[t] = input.value
            }
        }
    }
    try{
        if(response){
            const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
            await updateDoc(playerDoc, {
                response,
            })
        }
    } catch(e){
        console.error(e)
    }
}





// ========== Partie correct - Passer au round suivant ==========
const next = async () => {
    const themes = settings.theme
    
    let score = {}
    for(let t of themes){
        score[t] = {};
        for(let p of presents){
            const input = document.getElementById(String(t + p.id))
            if(input){
                score[t][p.id] = input.checked
            }
        }
    }

    try{
        await updateDoc(doc(collection(docRef, "submissions"), String((round) + playerId)),{
            score
        })
    
    } catch(e){
        console.error(e)
    }
}


// ========== Partie score - fin de la partie ==========
const finish = async () => {
    window.location.href = "../../";
}

// ========== Partie form, result - Attendre les autres jouerus ==========
const wait = async (element) => {
    const div = document.getElementById(element)
    if(div){
        div.innerHTML = `<button>En attente...</button>`
    }
}


const buttonEventListener = async () => {
    document.getElementById("quit")?.addEventListener("click", quit)
    document.getElementById("launch")?.addEventListener("click", launch)
    document.getElementById("send")?.addEventListener("click", send)
    document.getElementById("submit")?.addEventListener("click", submit)
    document.getElementById("next")?.addEventListener("click", next)
    document.getElementById("finish")?.addEventListener("click", finish)
}


const startTimerForm = () => {
    const round = settings.currentRound
    let count = settings.duration || 180
    const div = document.getElementById("count")

    timer = setInterval(() => {
        if(div){
            div.textContent = count + "s"
        }
        if(count == 0){
            sendGlobal()
        }
        count--;
        if (count < 0){
            clearInterval(timer);
            (async () => {
                try {
                    await updateDoc(docRef, { 
                        [`phase.${round}`]: "correct",
                        nextRound: round + 1
                    });
                } catch (error) {
                    console.error(error)
                }
            })();
        }
    }, 1000)
}


const startTimerScore = () => {

    let count = 30
    const div = document.getElementById("count");
    timer = setInterval(() => {
        if(div){
            div.textContent = count + "s"
        }
        if(count == 0){
            next()
        }
        count--;
        if (count < 0){
            clearInterval(timer);
            (async () => {
                try {
                    await updateDoc(docRef, { 
                        [`phase.${round}`]: "next"
                    });
                } catch (error) {
                    console.error(error)
                }
            })();
        }
    }, 1000)
}


// ========== Verify Session ==========
const verifyPlayerInGame = async () => {
    const phase = settings.phase[round]

    await WaitForData()

    if(!players[playerId]){
        document.getElementById("container").innerHTML = `Vous n'êtes pas dans la bonne partie...`
        return false
    }
    
    if(settings.stage != module){
        document.getElementById("container").innerHTML = `Vous n'êtes pas dans le bon jeu...`
        return false
    }


    const sub = submissions.find(a => a.round == round && a.id == playerId)
    if(!sub){
        await setDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
            isPresent: true,
            round,
            id: playerId 
        })
        return true
    }

    if(["correct", "result"].includes(phase)){
        if(!(sub && sub.response)){
            await updateDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
                isPresent: false,
            })
            document.getElementById("container").innerHTML = `Attendez le prochain tour...`
            return false
        }
    }

    if(!sub.isPresent){
        await updateDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
            isPresent: true,
        })
    }

    return true
}


const verifyHostInGame = async () => {
    try{
        await WaitForData()

        presents = submissions.filter(s => s.round == round && s.isPresent).map(p => ({ ...p, ...players[p.id] }))
        presents.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
        presents[0]["isHost"] = true
              
    } catch(e){
        console.error(e)
    }
}