import { db, getUserFieldById, getPseudoByUserIdByGameId, status } from "./index.js";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import { gameContent } from "./package.js";


const params = new URLSearchParams(window.location.search);
const gameId = params.get("g")
const playerId = params.get("p")
const module = "1"

let players = null
let submissions = null
let settings = null

const docRef = doc(db, "game", gameId);
let updateUI = true
let updateList = true


// ========== SETTINGS DATABASE ==========
onSnapshot(docRef, async (snapshot) => {
    try{
        const snap = snapshot.data()
        settings = { ...snap }

        await WaitForSettings()
        if(settings.stage != module){ return }

        await displayGame()
        
        await WaitForPlayers()

        await displayPlayer()
        await updatePlayer()
        updateUI = false

    } catch (e){
        console.error(e);
    }
}, (e) => {
    console.error(e);
    //alert("Un problème est survenu")
})



// ========== PLAYERS DATABASE ==========
onSnapshot(collection(docRef, "players"), async (snapshot) => {
    try {
        await WaitForSettings()
        if(settings.stage != module){ return }

        updateList = true

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
    console.error(e)
    alert("Un problème est survenu !")
    window.location.href = "index.html"
})


// ========== SUBMITS DATABASE ==========
onSnapshot(collection(docRef, "submissions"), async (snapshot) => {
    try {
        await WaitForSettings()
        if(settings.stage != module){ return }

        submissions = snapshot.docs.map(doc => doc.data())

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
    while (submissions == null || updateList) {
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}


const displayGame = async () => {
    const round = settings.currentRound
    document.getElementById("quiz").innerHTML = gameContent[settings.stage][settings.round[round].phase]

    //Partie Accueil, Formulaire, Résultat - nom du jeu
    const name = document.getElementById("name");
    if(name && !name.textContent){
        name.textContent = gameContent[settings.stage].name;
    }

    //Partie Accueil, Formulaire, Résultat - Code de partie
    const code = document.getElementById("code");
    if(code && !code.textContent){
        code.textContent = gameId;
    }

    //Partie Accueil - Theme du jeu
    const theme = document.getElementById("theme");
    if(theme && !theme.textContent){
        theme.textContent = settings.round[round].theme
    }

    //Partie Accueil - Numéro du round
    const max = settings.maxRound
    const div = document.getElementById("round")
    if(div && !div.textContent){
        div.textContent = "Tour " + round + " / " + max
    }

    //Partie Formulaire - lancer le timer
    if(settings.round[round].phase == "form"){
        startTimer();
    }
}


const displayPlayer = async () =>{
    const round = settings.currentRound
    const presents = submissions.filter(p => p.round == round && p.isPresent)

    //Partie Accueil - Menu du jeu 1
    const menu = document.getElementById("menu");
    if(menu){
        if(players[playerId].isHost)
            menu.innerHTML += `<button id="launch">Lancer</button>`
    }

    // Partie Formulaire
    const form = document.getElementById("form");
    if(form && !form.innerHTML){
        form.innerHTML = presents.filter(p => p.question).map(p => {
            return `
            <li class="fx-col ai-center gap-10">
                <div>${p.question} ?</div>
                <input id="${p.id}" type="text" placeholder="Votre réponse">
            </li>`}).join("")
    }

    // Partie Correction
    const result = document.getElementById("result")
    if(result)
        result.innerHTML = presents.filter(p => p.question).map((p, index) => {
            let res = presents.map(other => {return {"value": other.response[p.id] || "", "id": other.id}}).filter(i => i.value)
            for (let i = 0; i < res.length; i++) {
                let j = Math.floor(Math.random() * (i+1))
                if(i!=j)
                    [res[i], res[j]] = [res[j], res[i]]
            }

            const hr = index < presents.filter(p => p.question).length - 1 ? "<hr>" : "";
            return  `<div class="fx-col jc-between gap-20">
                        <div><b>${p.question} ?</b></div>
                        <div class="fx-col gap-10">
                            ${res.map(r => {
                                return  `<div class="fx-row jc-between ai-center">
                                            <div>${r.value}</div>
                                            <div>
                                                <input type="checkbox" id="${p.id}${r.id}">
                                            </div>
                                        </div>`
                            }).join("")}
                        </div>
                    </div>
                    ${hr}`
        }).join("")

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
    const tab = document.getElementById("tab")
    if(tab)
        tab.innerHTML = `
            <table class="score-table">
            <thead><tr><th>/</th><th>Joueur</th><th>Points</th></tr></thead>
            <tbody>${results.map((r, i) => {
                if(!r.pseudo){
                    return null
                }
                return`<tr><td>${i + 1}</td><td>${r.pseudo}</td><td>${r.points}</td></tr>`
            }).join('')}
            </tbody>
            </table>`
}


const calculScore = async (score, round) => {
    const presents = submissions.filter(s => s.round == round && s.isPresent)

    try{
        for(let p of presents){
            for(let q of presents){
                for(let r of presents){
                    try{
                        const value = p.score[q.id][r.id]
                        if(value){
                            score[r.id] = score[r.id] + 1 || 1
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

    // Partie Formulaire - liste des joueurs qui ont répondu
    const div2 = document.getElementById("player2")
    if(div2){div2.innerHTML = ""}

    // Partie Result - liste des joueurs pour le round suivant
    const div3 = document.getElementById("player3")
    if(div3){div3.innerHTML = ""}

    for(let p of presents){
        const player = players[p.id]
        const subNext = submissions.find(s => s.id == p.id && s.round == (round + 1))

        const li = document.createElement("li")
        li.textContent = player.pseudo
        const option = document.createElement("option")
        option.textContent = player.pseudo
        option.value = player.id

        if(div1){
            if(p.question)
                li.innerHTML += ` <i class="fa-solid fa-star"></i>`
            div1.appendChild(li)
        }
        if(div2){
            if(p.response)
                li.innerHTML += ` <i class="fa-solid fa-thumbs-up"></i>`
            div2.appendChild(li)
        }
        if(div3){
            if(subNext && subNext.isPresent)
                li.innerHTML += ` <i class="fa-solid fa-thumbs-up"></i>`
            div3.appendChild(li)
        }
    }

    if(presents.find(p => p.id == playerId).response != null){
        await waitting("wait1")
    }

    if(presents.find(p => p.id == playerId).score != null){
        await waitting("wait2")
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
            [`round.${round}.phase`]: "correct"
        })
    }

    // Partie Résult - Lancer le round suivant
    if(presentNow.length == presentNext.length){
        if(round < max){
            await updateDoc(docRef, {
                currentRound: settings.nextRound
            })
        }
        else{
            await updateDoc(docRef, {
                [`round.${round}.phase`]: "score"
            })
        }
    }

}


// ==== Partie Accueil - Quitter la Partie ====
const quit = async () => {
    try {
        const round = settings.currentRound
        const docPlayer = doc(db, "game", gameId, "submissions", String(round + playerId))
        await updateDoc(docPlayer, {
            isPresent: false
        })
        window.location.href = "index.html";
    } catch (e) {
        console.error(e); 
    }
}


// ==== Partie Accueil - enregistrer la question et la prédiction ====
const submit = async () => {
    try{
         const div = document.getElementById("question")
         const question = div.value.trim()
         if (!question) {
            await status("Veuillez remplir la question !", false);
            return;
        }
        const round = settings.currentRound
        const docPlayer = doc(db, "game", gameId, "submissions", String(round + playerId))
        await updateDoc(docPlayer, {
            question
        });
        div.value = "";
        await status("Question enregistrée !", true)
    } catch(e){
        console.error(e)
    }
}


// ==== Partie Accueil - lancer le jeu ====
const launch = async () => {
    const round = settings.currentRound

    if(!submissions.find(p => p.round == round && p.id == playerId).question){
        status("Posez une question !", false)
        return;
    } 
    try{
        await updateDoc(docRef, {
            [`round.${round}.phase`]: "form",
            started: true,
            nextRound: round + 1
        });
    } catch(e){
        console.error(e)
    }
}


// ==== Partie Formulaire - envoyer les réponses des questions ====
const send = async () => {
    const round = settings.currentRound
    const presents = submissions.filter(p => p.round == round && p.isPresent)

    try{
        let response = {}
        for(let p of presents){
            const input = document.getElementById(p.id)
            if(input && input.value){
                response[p.id] = input.value
            }
        }
        if(presents.length != Object.keys(response).length){
            status("Répondre à toutes les questions !", false)
            return
        }
        const docPlayer = doc(db, "game", gameId, "submissions", String(round + playerId))
        await updateDoc(docPlayer, {
            response
        })
        status("Réponses enregistrées !", true)
    } catch(e){
        console.error(e)
    }
}


const next = async () => {
    const round = settings.currentRound
    const presents = submissions.filter(p => p.round == round && p.isPresent) 

    try{
        let score = {}
        for(let q of presents){
            score[q.id] = {}
            for(let r of presents){
                const input = document.getElementById(String(q.id + r.id))
                if(input){
                    score[q.id][r.id] = input.checked
                }
            }
        }
        const docPlayer = doc(db, "game", gameId, "submissions", String(round + playerId))
        await updateDoc(docPlayer, {
            score
        })
        await setDoc(doc(db, "game", gameId, "submissions", String((round+1) + playerId)), {
            isPresent: true,
            round: round+1,
            id: playerId
        })
    } catch(e){
        console.error(e)
    }
}



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




const startTimer = () => {
    const round = settings.currentRound

    let count = settings.duration || 180
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
                        [`round.${round}.phase`]: "correct"
                    });
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, 1000);
};


const detectSession = async () => {

    //Partie valide
    if((100000 < gameId && gameId < 999999)){ 
        return
    }

    //Player valide
    if(players.map(p => p.id).includes(playerId)){
        return
    }



    //Problème de session
    alert("Une problème est survenu !")
    window.location.href = "index.html"
}




/*
// ==== Player Valide ====
const detectPlayerSession = async () => {
    if(!(100000 < gameId && gameId < 999999)){ 
        alert("Un problème est survenu!")
        window.location.href = "index.html"
        return
    }

    if(!players.map(p => p.id).includes(playerId) && !leaveVolontary){
        alert("Un problème est survenu!")
        window.location.href = "index.html"
        return
    }

    if((players.map(p => p.MJ).filter(item => item == true).length == 0) && !leaveVolontary){
        alert("Un problème est survenu!")
        window.location.href = "index.html"
        return
    }
}*/
/*
// ==== Game Valide ====
const detectGameSession = async () => {
    if((!players.find(p => p.id == playerId).question && settings.step > 0)){
        alert("Un problème est survenu !")
        window.location.href = "index.html"
        return
    }

    if(players.find(p => p.id == playerId).MJ && setting.step > 0){
        for(let player of players){
            if(!player.question)
                deleteDoc(doc(collection(doc(collection(db, "game"), gameId), "players"), player.id))
        }
            
    }
}
*/