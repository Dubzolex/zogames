import { db, getUserFieldById, getPseudoByUserIdByGameId, status } from "./index.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { gameContent } from "./package.js"


const params = new URLSearchParams(window.location.search);
const gameId = params.get("g")
const playerId = params.get("p")
const module = "2"

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
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

const WaitForPlayers = async () => {
    while (players == null || submissions == null || updateList) {
        await new Promise(resolve => setTimeout(resolve, 100));
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

    //Partie Accueil - Theme du jeu
    div = document.getElementById("theme");
    if(div && !div.textContent){
        div.textContent = settings.round[round].theme
    }

    //Partie Accueil - Numéro du round
    const max = settings.maxRound
    div = document.getElementById("round")
    if(div && !div.textContent){
        div.textContent = "Tour " + round + " / " + max
    }

    //Partie Formulaire - lancer le timer
    if(phase == "form"){
        startTimer();
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

    // Partie Formulaire - Lister les musiques et Remplir les sélecteurs
    const form = document.getElementById("form");
    if(form && !form.innerHTML){
        form.innerHTML = presents.filter(p => p.title && p.id != settings.playerId).map(p => {
            return `
            <li class="fx-col ai-center gap-10">
                <div>${p.title}</div>
                <select id="${p.id}">
                    <option>Choisissez un joueur</option>
                    ${presents.map(sub => `<option value="${sub.id}">${players[sub.id].pseudo}</option>`).join("")}
                </select>
            </li>`}).join("")
        }

    // Partie Résultat -  Liste des players et leur titre
    const result = document.getElementById("result")
    if(result){
        result.innerHTML = presents.filter(p => p.title).map(p => {
            return  `<li class="fx-row jc-between">
                        <div>${players[p.id].pseudo} : </div>
                        <div><em>${p.title}</em></div>
                    </li>`
        }).join("")
    }

    // Partie Résultat - Calcul des scores du round
    let score = await calculScore({}, round)
    console.log(score)

    // Partie Résultat - Calcul des scores de la partie
    let scores = {}
    for(let i=1; i <= round; i++){
        scores = await calculScore(scores, i)
    }
    console.log(scores)
    
    let results = []
    for (let p of presents) {
        const id = p.id
        const pseudo = players[id].pseudo
        const point = score[id] || 0
        const points = scores[id] || 0
        results.push({ pseudo, points, point })
    }
    results.sort((a, b) => b.points - a.points)
    const tab = document.getElementById("result-score")
    if(tab)
        tab.innerHTML = `
            <table class="score-table">
            <thead><tr><th>/</th><th>Joueur</th><th colspan="2">Points</th></tr></thead>
            <tbody>${results.map((r, i) => {
                if(!r.pseudo){
                    return null
                }
                return`<tr><td>${i + 1}</td><td>${r.pseudo}</td><td>${r.points}</td><td>+${r.point}</td></tr>`
            }).join('')}
            </tbody>
            </table>`
}

    
const calculScore = async (score, round) => {
    const presents = submissions.filter(s => s.round == round && s.isPresent)
    for(let q of presents){
        const jq = q.id
        let predict = null
        try{
            predict = q.predict
        } catch(e){
            console.error(e)
        }
        for(let r of presents){
            try{
                const jr = r.id
                const res = r.response[q.id]  
                if(res && res === jq){
                    if (predict && predict === jr) {        // match parfait : +2 pour q
                        score[jq] = (score[jq] || 0) + 2
                    } else{                                 // bonne réponse : +1 pour r
                        score[jr] = (score[jr] || 0) + 1
                    }
                }
            } catch(e){
                //console.error(e)
            }
        }
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
    const presentNow = submissions.filter(p => p.round == (round) && p.isPresent)
    const presentNext = submissions.filter(p => p.round == (round + 1) && p.isPresent)
    

    console.log(presentNow)
    // Partie Formulaire - Calcul des réponses
    if(presentNow.length > 0 && presentNow.every(p => p.response)) {
        await updateDoc(docRef, { 
            [`round.${round}.phase`]: "result"
        })
    }

    // Partie Résult - Lancer le round suivant
    if(presentNow.length == presentNext.length){
        await updateDoc(docRef, {
            currentRound: settings.nextRound
        })
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

// ========== Partie Accueil - Enregistrer la question et la prédiction ==========
const submit = async () => {
    const round = settings.currentRound

    if (settings.round[round].phase != "home"){
        status("La partie a commencé !", false);
        return;
    }

    try{
        const title = document.getElementById("title").value.trim()
        const predict = document.getElementById("predict").value.trim()

        if (!title) {
            await status("Veuillez remplir le titre !", false);
            return;
        }
        if (!predict) {
            await status("Veuillez remplir la prédiction !", false);
            return;
        }
        
        await updateDoc(doc(collection(docRef, "submissions"), String(round + playerId)), {
            title: title,
            predict: predict
        });
        document.getElementById("title").value = "";
        document.getElementById("predict").value = ""
        await status("Titre et prédiction enregistrés !", true)

    } catch(e){
        console.error(e)
    }
}


// ========== Partie Accueil - Lancer le jeu ==========
const launch = async () => {
    const round = settings.currentRound
    try{
        const sub = submissions.find(s => s.round == round && s.id == settings.playerId)
        if(!(sub && sub.title)){
            status("Trouve un titre !", false)
            return;
        }
    
        await updateDoc(docRef, { 
            started: true,
            [`round.${round}.phase`]: "form",
            nextRound: settings.nextRound + 1
        });
    } catch(e){
        console.error("Erreur lors du lancement du jeu", e)
    }
}


// ========== Partie Formulaire - Envoyer les réponses ==========
const send = async () => {
    const round = settings.currentRound
    const playerId = settings.playerId
    
    let response = {}
    const subRound = submissions.filter(s => s.round == round && s.isPresent)
    for(let player of subRound){
        const select = document.getElementById(player.id)
        if(select && select.value){
            response[player.id] = select.value
        }
    }
    response[playerId] = ""

    if(subRound.length != Object.keys(response).length){
        status("Répondre à toutes les musiques !", false)
        return;
    }

    try{
        const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
        await updateDoc(playerDoc, {
            response
        })
        status("Réponses enregistrées !", true)
        await waitting("waitting1")
    } catch(e){
        console.error(e)
    }
}





// ========== Partie result - Passer au round suivant ==========
const next = async () => {
    const round = settings.currentRound
    const max = settings.maxRound
    const next = settings.nextRound
    const id = settings.playerId
    if(round == max){
        window.location.href = "index.html";
        return
    }
    
    const playerDoc = doc(collection(docRef, "submissions"), String((round+1) + settings.playerId))
    await setDoc(playerDoc,{
       isPresent: true,
       id,
       round: round+1
    })

    await waitting("waitting2")
}


// ========== Partie form, result - Attendre les autres jouerus ==========
const waitting = async (element) => {
    let div = document.getElementById(element)
    if(div){
        div.innerHTML = `<button>En attente...</button>`
    }
}






const buttonEventListener = async () => {
    document.getElementById("quit")?.addEventListener("click", quit);
    document.getElementById("launch")?.addEventListener("click", launch);
    document.getElementById("send")?.addEventListener("click", send);
    document.getElementById("submit")?.addEventListener("click", submit);
    document.getElementById("next")?.addEventListener("click", next);
}


const startTimer = () => {
    const round = settings.currentRound

    let count = settings.timer || 180
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
                        [`round.${round}.phase`]: "result"
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
