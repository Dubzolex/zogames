import { db, getUserFieldById, getPseudoByUserIdByGameId, status } from "./index.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { gameContent } from "./package.js"


const params = new URLSearchParams(window.location.search);
const gameId = params.get("g")
const playerId = params.get("p")
const module = "3"

let players = null
let submissions = null
let settings = null

const docRef = doc(db, "game", gameId)
let updateUI = true
let updateList = true


// ========== SETTINGS DATABASE ==========
onSnapshot(docRef, async (snapshot) => {
    try{
        const snap = snapshot.data()
        settings = { ...snap, playerId }

        await WaitForSettings()
        if(settings.stage != module){ return }

        await displayGame()

        await WaitForPlayers()

        await displayPlayer()
        await updatePlayer()
        updateUI = false

    } catch(e){
        console.error(e);
    } 
}, (e) => {
    console.error(e);
})


// ========== PLAYERS DATABASE ==========
onSnapshot(collection(docRef, "players"), async (snapshot) => {
    try {
        updateList = true

        await WaitForSettings()
        if(settings.stage != module){ return }

        const docs = await Promise.all(snapshot.docs.map(async doc => {
            const pseudo = await getPseudoByUserIdByGameId(gameId, doc.id)
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
        console.error(e);
    }
    updateList = false
}, (e) => {
    console.error(e);
})


// ========== SUBMITS DATABASE ==========
onSnapshot(collection(docRef, "submissions"), async (snapshot) => {
    try {
        await WaitForSettings()
        submissions = snapshot.docs.map(doc => doc.data())

        if(settings.stage != module){ return }

        if(!updateUI){
            await WaitForPlayers()
            await updatePlayer()
        }

    } catch (e){
        console.error(e);
    }
}, (e) => {
    console.error(e);
})


// ========== FUNCTION ELEMENT ORDER ==========
const WaitForSettings = async () => {
    while (settings == null) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}

const WaitForPlayers = async () => {
    while (players == null || submissions == null || updateList) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}


// ========== DISPLAY ELEMENT GAME EACH START PAGE ==========
const displayGame = async () => {
    const round = settings.currentRound
    const phase = settings.round[round].phase
    const page = gameContent[settings.stage][phase]

    document.getElementById("quiz").innerHTML = page

    //Partie Accueil, Formulaire, Résultat - nom du jeu
    let div = document.getElementById("name");
    if(div && !div.textContent){
        div.textContent = gameContent[settings.stage].name;
    }

    //Partie Accueil, Formulaire, Résultat - Code de partie
    div = document.getElementById("code");
    if(div && !div.textContent){
        div.textContent = settings.id;
    }

    //Partie Accueil - Lettre du round
    div = document.getElementById("letter");
    if(div && !div.textContent){
        div.textContent = "Lettre " + settings.round[round].letter
    }

    //Partie Accueil - Numéro du round
    const max = settings.maxRound
    div = document.getElementById("round")
    if(div && !div.textContent){
        div.textContent = "Tour " + round + " / " + max
    }
}


// ========== DISPLAY ELEMENT PLAYERS EACH START PAGE ==========
const displayPlayer = async () =>{
    const round = settings.currentRound
    const presents = submissions.filter(p => p.round == round && p.isPresent)
    try{
        submissions.sort((a, b) => players[a.id].pseudo.localeCompare(players[b.id].pseudo))
        presents.sort((a, b) => a.title.localeCompare(b.title))
    } catch(e){}
 
    //Partie Accueil - Menu du jeu
    const menu = document.getElementById("menu");
    if(menu){
        if(players[settings.playerId].isHost){
            menu.innerHTML += `<button id="launch">Lancer</button>`
        }
    }

    //Partie Accueil - Liste des thèmes
    
    if(players[settings.playerId].isHost){
        const theme = document.getElementById("theme")
        if(theme)
            theme.innerHTML = gameContent[settings.stage].theme.map((t, i) => {
                const check = gameContent[settings.stage].check[i] || false
                return `<li class="fx-row gap-5">
                    <div>
                        <input type="checkbox" id="${i}"${check ? "checked" : ""}>
                    </div>
                    <div>${t}</div>
                </li>`
                }).join("")
    } else{
        const msg = document.getElementById("msg")
        if(msg)
            msg.textContent = "Le créateur de la partie ajoute les thèmes !"
    }

    // Partie Formulaire - Lister les themes
    const form = document.getElementById("form");
    if(form && !form.innerHTML){
        const themes = settings.theme
        form.innerHTML = themes.map(p => {
            const t = gameContent[settings.stage].theme[p]
            return `
            <li class="fx-row jc-between gap-40">
                <div class="fx-row jc-start ai-center">${t} :</div>
                <div>
                    <input id="${p}" type="text" placeholder="${settings.round[round].letter} ..." autocomplete="off">
                </div>
            </li>`}).join("")
    }

    // Partie Correct - Liste des mots par theme
    const word = document.getElementById("word")
    if(word){
        const themes = settings.theme
        word.innerHTML = themes.map(i => {
            const t = gameContent[settings.stage].theme[i]
            
            return  `<li class="fx-col gap-20">
                        <div class="fx-col "><strong>${t}</strong></div>
                        <div class="fx-col gap-20">
                            ${presents.map(p => {
                                if (!p.response[i]){
                                    return null
                                }
                                return  `<div class="fx-row jc-between">
                                            <div>${p.response[i]}</div>
                                            <div>
                                                <input type="checkbox" checked id="${i}${p.id}">
                                            </div>
                                        </div>`

                            }).join("")}
                        </div>
                    </li>`}).join("")
    }

    // Partie Résultat - Calcul des scores de la partie
    let scores = {}
    for(let i=1; i <= round; i++){
        scores = await calculScore(scores, i)
    }
    
    let results = []
    for (let p of presents) {
        const id = p.id
        const pseudo = players[id].pseudo
        const points = scores[id] || 0
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

    
const calculScore = async (score, round) => {
    const presents = submissions.filter(s => s.round == round && s.isPresent)
    const themes = settings.theme
    try{
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
const updatePlayer = async () => {
    const round = settings.currentRound
    const presents = submissions.filter(a => a.round == round && a.isPresent)

    // Partie Accueil - liste des joueurs de la partie
    const div1 = document.getElementById("player1")
    if(div1){div1.innerHTML = ""}

    // Partie Accueil - sélecteur de la prédiction
    const predict = document.getElementById("predict")
    if(predict){
        predict.innerHTML = ""
        const option = document.createElement("option")
        option.textContent = "Choisissez un joueur"
        option.value = ""
        predict.appendChild(option)
    }

    // Partie Formulaire - liste des joueurs qui ont répondu
    const div2 = document.getElementById("player2")
    if(div2){div2.innerHTML = ""}

    // Partie Result - liste des joueurs pour le round suivant
    const div3 = document.getElementById("player3")
    if(div3){div3.innerHTML = ""}

    for(let t of presents){
        const player = players[t.id]
        const subNext= submissions.find(s => s.id == t.id && s.round == (round + 1))

        const li = document.createElement("li")
        li.textContent = player.pseudo
        const option = document.createElement("option")
        option.textContent = player.pseudo
        option.value = player.id

        if(div1){
            if(t && t.title)
                li.innerHTML += ` <i class="fa-solid fa-star"></i>`
            div1.appendChild(li)
        }
        if(predict){
            if((t.id != settings.playerId) || players[settings.playerId].isHost)
                predict.appendChild(option)
        }
        if(div2){
            if(t && t.response)
                li.innerHTML += ` <i class="fa-solid fa-thumbs-up"></i>`
            div2.appendChild(li)
        }
        if(div3){
            if(subNext && subNext.isPresent){
                li.innerHTML += ` <i class="fa-solid fa-thumbs-up"></i>`
            }
            div3.appendChild(li)
        }
    }

    buttonEventListener()
    await updateNextPhase()
}

const updateNextPhase = async () => {
    const round = settings.currentRound
    const phase = settings.round[round].phase
    const max = settings.maxRound
    const presentNow = submissions.filter(p => p.round == (round) && p.isPresent)
    const presentNext = submissions.filter(p => p.round == (round + 1) && p.isPresent)

    // Partie Formulaire - Calcul des réponses
    if(phase == "form" && presentNow.length > 0 && presentNow.every(p => p.response)) {
        await updateDoc(docRef, { 
            [`round.${round}.phase`]: "correct",
            nextRound: round + 1
        })
    }

    // Partie Correct - Lancer le round suivant
    if(presentNow.length == presentNext.length){
        if(round < max){
            await updateDoc(docRef, {
                [`round.${round+1}.phase`]: "form",
                currentRound: settings.nextRound
            })
        }
        else{
            await updateDoc(docRef, {
                [`round.${round}.phase`]: "score",
            })
        }
    }

    // Partie Correct - Lancer le round suivant
    const first = presentNow.find(p => p.first)
    if(phase == "form" && first && (first.id != playerId) ){
        await sendGlobal()
    }

    //Lancer les timer
    if(phase == "form"){
        startTimer(180, "score")
    }
}


// ========== Partie Accueil - Quitter la Partie ==========
const quit = async () => {
    try {
        const round = settings.currentRound
        const playerDoc = doc(docRef, "submissions", String(round + settings.playerId));
        await updateDoc(playerDoc,{
            isPresent: false
        })
        window.location.href = "index.html";
        
    } catch (e) {
        console.error(e); 
    }
}


// ========== Partie Accueil - Lancer le jeu ==========
const launch = async () => {
    try{
        const themes = gameContent[settings.stage].theme
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
            [`round.${round}.phase`]: "form",
            nextRound: round + 1
        });
    } catch(e){
        console.error(e)
    }
}


// ========== Partie Formulaire - Envoyer les réponses ==========
const send = async () => {
    const round = settings.currentRound
    const playerId = settings.playerId
    
    let response = {}
    const themes = settings.theme
    const letter = settings.round[round].letter
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

    if(themes.length != Object.keys(response).length){
        status("Répondre à tous les thèmes !", false)
        return
    }

    try{
        const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
        await updateDoc(playerDoc, {
            response,
            first: true
        })
    } catch(e){
        console.error(e)
    }
}

const sendGlobal = async () => {
    const round = settings.currentRound
    const playerId = settings.playerId
    
    let response = {}
    const themes = settings.theme
    const letter = settings.round[round].letter
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
    const round = settings.currentRound
    const id = settings.playerId
    const themes = settings.theme
    const presents = submissions.filter(a => a.round == round && a.isPresent)
    
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
        await updateDoc(doc(collection(docRef, "submissions"), String((round) + id)),{
            score
        })
    
        await setDoc(doc(collection(docRef, "submissions"), String((round+1) + id)),{
            isPresent: true,
            id,
            round: round+1
        })
        await waitting("waitting2")
    } catch(e){
        console.error(e)
    }
}


// ========== Partie score - fin de la partie ==========
const finish = async () => {
    window.location.href = "index.html";
}

// ========== Partie form, result - Attendre les autres jouerus ==========
const waitting = async (element) => {
    let div = document.getElementById(element)
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


const startTimer = (duration, phase) => {
    const round = settings.currentRound

    let count = duration || 180
    const div = document.getElementById("count");
    const timerId = setInterval(() => {
    
        if(div){
            div.textContent = count + "s"
        }
        count--;
        if (count < 0){
            clearInterval(timerId);
            (async () => {
                try {
                    await updateDoc(docRef, { 
                        [`round.${round}.phase`]: phase
                    });
                } catch (error) {
                    console.error(error)
                }
            })();
        }
    }, 1000)
}



























// ==== Player Valide ====
const detectSession = async () => {
    if(!(100000 < gameId && gameId < 999999)){ 
        alert("Un problème est survenu ! a")
        window.location.href = "index.html"
        return
    }
    /*
    if(!players.map(p => p.id).includes(playerId) && !leaveVolontary){
        alert("Un problème est survenu ! b")
        window.location.href = "index.html"
        return
    }*/
    /*
    if((players.map(p => p.isHost).filter(item => item == true).length == 0) && !leaveVolontary){
        alert("Un problème est survenu!")
        window.location.href = "index.html"
        return
    }*/
    /*
    if((!players.find(p => p.id == playerId).question && setting.page > 0)){
        alert("Un problème est survenu ! c")
        window.location.href = "index.html"
        return
    }*/

    /*
    if(players.find(p => p.id == playerId).isHost && setting.page > 0){
        for(let player of players){
            if(!player.question)
                updateDoc(doc(db, "game", gameId, "players", player.id), {
                    isInGame: false
                })
        }
            
    }*/
}
