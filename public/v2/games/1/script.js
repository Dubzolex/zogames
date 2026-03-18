import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"
import { status, getUserPseudoByPlayerIdByGameId } from "/v2/src/tools/script.js"
import { TEMPLATE } from "/v2/src/frontend/package.js"


const params = new URLSearchParams(window.location.search)
const gameId = params.get("g")
const playerId = params.get("p")
const module = "1"

let players = null
let submissions = null
let settings = null
let presents = null
let round = null

const docRef = doc(db, "game", gameId)
let isUpdate = true
let isSearch = false
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

// ========== SHOW PHASE ==========
const showPhase = async () => {
    try{
        const phase = settings.phase[round]
        const page = TEMPLATE[settings.stage][phase]

        if(page){
            document.getElementById("container").innerHTML = page
        }

        // Nom du jeu
        const name = document.getElementById("name")
        if(name)
            name.textContent = TEMPLATE[settings.stage].name

        // Code de partie
        const code = document.getElementById("code")
        if(code)
            code.textContent = gameId

        // Theme du jeu
        const theme = document.getElementById("theme")
        if(theme)
            theme.textContent = settings.theme[round]

        // Numéro du round
        const max = settings.maxRound
        const div = document.getElementById("round")
        if(div)
            div.textContent = "Tour " + round + " / " + max

        updateHome()
        updateForm()
        updateCorrect()
        updateResult()

        if(phase == "form"){
            startTimer({
                count: settings.duration || 180,
                phase: "correct",
                auto: sendEnd
            })
        } else if(phase == "correct"){
            startTimer({
                count: 60,
                phase: "next",
                auto: nextEnd
            })
        }

    } catch(e){
        console.error("Show Phase", e)
    }
}

const updateHome = () => {
    try{
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

    } catch(e){
        console.warn("Home")
    }
}

const updateForm = async () => {
    try{
        const form = document.getElementById("form")
        if(form && !form.innerHTML){
            countElement = 0
            form.innerHTML = presents.filter(p => p.question).map(p => {
                countElement++
                return `
                <li class="fx-col ai-center gap-10">
                    <div>${p.question} ?</div>
                    <input id="${p.id}" type="text" placeholder="Votre réponse">
                </li>`}).join("")
        }

    } catch(e){
        console.warn("Form", e)
    }
}

const updateCorrect = () => {
    try{
        const correct = document.getElementById("correct")
        if(correct) 
            correct.innerHTML = presents.filter(p => p.question).map((p, index) => {
                let res = presents.map(other => {return {"value": other?.response?.[p.id] || "", "id": other.id}}).filter(i => i.value)
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
                        ${""}`
            }).join("")
    } catch(e){
        console.warn("Correct",e)
    }
}

const updateResult = () => {
    
    let scores = {}
    for(let i=1; i <= round; i++){
        scores = calculScore(scores, i)
    }
    
    let results = []
    for (let p of presents) {
        try{
            const id = p.id
            const pseudo = players[id]?.pseudo
            const points = scores[id] || 0
            results.push({ pseudo, points })
        } catch(e){}
    }
    results.sort((a, b) => b.points - a.points)
    const tab = document.getElementById("tab")
    if(tab)
        tab.innerHTML = `
            <table class="score-table">
            <thead><tr><th>/</th><th>Joueur</th><th>Points</th></tr></thead>
            <tbody>${results.filter(p => p.pseudo).map((r, i) => {
                return`<tr><td>${i + 1}</td><td>${r.pseudo}</td><td>${r.points}</td></tr>`
            }).join('')}
            </tbody>
            </table>`
}

const calculScore = (score, roundId) => {
    const presentRound = submissions.filter(s => s.round == roundId && s.isPresent)
    for(let p of presentRound){
        for(let q of presentRound){
            for(let r of presentRound){
                try{
                    const value = p.score[q.id][r.id]
                    if(value){
                        score[r.id] = score[r.id] + 1 || 1
                    }
                } catch(e){}
            }
        }
    }
    return score
}

// ========== UPDATE PLAYERS LISTS ==========
const updateList = async () => {

    // Home - liste des joueurs de la partie
    const list1 = document.getElementById("player1")
    if(list1)
        list1.innerHTML = presents.filter(p => p.pseudo)
            .map(p => `
                <li class="fx-row jc-center gap-20">
                    ${p.isHost ? `<i class="fa-solid fa-crown"></i>` : ""}
                    <div>${p.pseudo}</div>
                    ${p.question ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                </li>`)
            .join("")

    // Form - liste des joueurs qui ont répondu
    const list2 = document.getElementById("player2")
    if(list2)
        list2.innerHTML = presents.filter(p => p.pseudo && p.question)
            .map(p => `
                <li class="fx-row gap-10">
                    <div>${p.pseudo}</div>
                    ${p.response ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                </li>`)
            .join("")

    // Correct - liste des joueurs pour le round suivant
    const list3 = document.getElementById("player3")
    if(list3) 
        list3.innerHTML = presents.filter(p => p.pseudo && p.question)
            .map(p => {
                return `
                <li class="fx-row gap-10">
                    <div>${p.pseudo}</div>
                    ${p.score ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                </li>`})
            .join("")

    try{
        if(presents?.find(p => p.id == playerId)?.response){
            await waitting("wait1")
        }

        if(presents?.find(p => p.id == playerId)?.score){
            await waitting("wait2")
        }
    }catch(e){
        console.warn(e)
    }
    
    await buttonEventListener()
}

// ========== BUTTON DOM ==========
const quit = async () => {
    try {
        const docPlayer = doc(db, "game", gameId, "submissions", String(round + playerId))
        await updateDoc(docPlayer, {
            isPresent: false
        })
        
    } catch (e) {
        console.error(e)
    }
    window.location.href = "../../"
}

const submit = async () => {
    try{
         const div = document.getElementById("question")
         const question = div.value.trim()
         if (!question) {
            await status("Veuillez remplir la question !", false);
            return;
        }
        
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

const launch = async () => {
    if(!presents.find(p => p.id == playerId).question){
        status("Posez une question !", false)
        return
    } 
    try{
        await updateDoc(docRef, {
            [`phase.${round}`]: "form",
            started: true,
            nextRound: round + 1
        })
    } catch(e){
        console.error(e)
    }
}

const send = async () => {
    try{
        let response = {}
        for(let p of presents){
            const input = document.getElementById(p.id)
            if(input && input.value){
                response[p.id] = input.value
            }
        }
        if(Object.keys(response).length < count){
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

const sendEnd = async () => {
    try{
        let response = {}
        for(let p of presents){
            const input = document.getElementById(p.id)
            if(input && input.value){
                response[p.id] = input.value
            }
        }
        const docPlayer = doc(db, "game", gameId, "submissions", String(round + playerId))
        await updateDoc(docPlayer, {
            response
        })

    } catch(e){
        console.error(e)
    }
}

const next = async () => {
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

    } catch(e){
        console.error(e)
    }
}

const nextEnd = async () => {
    await next()
}

const finish = async () => {
    window.location.href = "../../index.html";
}

const waitting = async (element) => {
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

// ========== UPDATE PHASE ==========
const updateNextPhase = async () => {
    const phase = settings.phase[round]
    const max = settings.maxRound

    // Form vers Correct
    if((phase == "form") && (countElement > 0) && (presents.filter(p => p.question && p.response)?.length == countElement)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await updateDoc(docRef, { 
            [`phase.${round}`]: "correct"
        })
    }

    // Correct vers Next
    if((phase == "correct") && (countElement > 0) && (presents.filter(p => p.question && p.response && p.score).length == countElement)){
        await new Promise(resolve => setTimeout(resolve, 1000))
        await updateDoc(docRef, { 
            [`phase.${round}`]: "next"
        })
    }

    // Next vers Round suivant
    if(phase == "next") {
        if(round < max){
            await updateDoc(docRef, {
                currentRound: settings.nextRound
            })
        }
        else{
            await updateDoc(docRef, {
                [`phase.${round}`]: "result"
            })
        }
        window.location.reload()
    }
}

const startTimer = (data) => {
    let {count, phase, auto} = data

    const round = settings.currentRound
    clearInterval(timer);
    const div = document.getElementById("count")
    timer = setInterval(() => {
        if(div){
            div.textContent = count + "s"
        }
        count--;
        if (count < 0){
            clearInterval(timer);
            (async () => {
                if(auto) await auto()
                try {
                    await updateDoc(docRef, { 
                        [`phase.${round}`]: phase
                    });
                } catch (e) {
                    console.error(e)
                }
            })();
        }
    }, 1000);
}

// ========== Verify Session ==========
const verifyPlayerInGame = async () => {
    const round = settings.currentRound
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
            isPresent: false,
            round,
            id: playerId 
        })
    }

    if(["home"].includes(phase)){
        if(!sub.isPresent){
            await updateDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
                isPresent: true,
            })
        }
    }

    if(["form", "correct"].includes(phase)){
        if(!(sub && sub.question)){
            await updateDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
                isPresent: false,
            })
            document.getElementById("container").innerHTML = `Attendez le prochain tour...`
            return false
        }
    }

    return true
}

const verifyHostInGame = async () => {
    try{
        await WaitForData()

        const round = settings.currentRound;
        presents = submissions.filter(a => a.round == round && a.isPresent).map(p => ({ ...p, ...players[p.id] }))
        presents.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
        presents[0]["isHost"] = true
              
    } catch(e){
        console.error(e)
    }
}