import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"
import { status, getUserPseudoByPlayerIdByGameId } from "/v2/src/tools/script.js"
import { TEMPLATE } from "/v2/src/frontend/package.js"


const params = new URLSearchParams(window.location.search);
const gameId = params.get("g")
const playerId = params.get("p")
const module = "4"

let players = null
let submissions = null
let presents = null
let settings = null
let round = 0

const docRef = doc(db, "game", gameId)
let isSearch = true
let isUpdate = true
let countElement = 0
let timer = null


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

    document.getElementById("container").innerHTML = page

    //Partie Accueil, Formulaire, Résultat - nom du jeu
    let div = document.getElementById("name");
    if(div){
        div.textContent = TEMPLATE[settings.stage].name
    }

    //Partie Accueil, Formulaire, Résultat - Code de partie
    div = document.getElementById("code");
    if(div){
        div.textContent = settings.id;
    }

    //Partie Accueil - Theme du jeu
    div = document.getElementById("theme");
    if(div){
        div.textContent = settings.theme[round]
    }

    //Partie Accueil - Numéro du round
    const max = settings.maxRound
    div = document.getElementById("round")
    if(div){
        div.textContent = "Tour " + round + " / " + max
    }

    //Autre phase
    updateHome()
    updateForm()
    updateResult()


    clearInterval(timer)
    //Partie Formulaire - lancer le timer
    if(phase == "form"){
        startTimer({ count: settings.duration || 180, phase: "result"})
    }
    //Partie Resultat - lancer le timer
    if((phase == "result") && (round < max)){
        startTimer({ count: 60, phase: "next"})
    }
}


// ========== DISPLAY ELEMENT PLAYERS EACH START PAGE ==========
const updateHome = async () => {
    // Menu du jeu
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
        console.warn(e)
    }
}

const updateForm = async () => {
    // Lister les element favoris et Remplir les sélecteurs
    const form = document.getElementById("form")
    if(form && !form.innerHTML){
        countElement = 0
        form.innerHTML = `
            <div class="fx-col ai-center gap-40">
                <strong>Qui est le plus supceptible de...</strong>
                <div class="fx-col ai-center gap-60 w-300">
                    ${Object.values(settings.sentence).map(s => {
                        const phrase = "..." + s + " ?"
                        return`
                        <div class="fx-col ai-center gap-20">
                            <div>${phrase}</div>
                            <select id="${countElement++}">
                                <option value="">Choisissez un joueur</option>
                                ${presents.filter(p => p.pseudo)
                                    .map(p => `<option value="${p.id}">${p.pseudo}</option>`)
                                    .join("")}
                            </select>
                        </div>`
                    }).join("")}
                </div>
            </div>` 
    }  
}

const updateResult = async () => {
    // Liste des players et leur titre
    const result = document.getElementById("result")
    if(result){
        
        const items = Object.values(settings.sentence).map((s, i) => {
            let score = {}
            for(let p of presents){
                score[p.response[i]] = (score[p.response[i]] || 0) + 1
            }
            let results = []
            for (let p of presents) {
                results.push({ 
                    pseudo: p.pseudo,
                    point: (score[p.id] || 0) / presents.length * 100,
                    vote: presents.find(r => p.response[i] == r.id).pseudo,
                    me: p.response[i] == playerId
                })
            }
            results.sort((a, b) => b.point - a.point)

            const tab = `
                <table class="table-score-4">
                    <thead><tr><th>Joueur</th><th>Vote</th><th>Taux</th></tr></thead>
                    <tbody>
                        ${results
                            .filter(p => p.pseudo)
                            .map((r, j) => {
                            return`
                                <tr>
                                    <td>${r.me ? `<u>${r.pseudo}</u>`: r.pseudo}</em></td>
                                    <td><em>${r.vote}</em></td>
                                    <td>${r.point}%</td>
                                </tr>`
                        }).join("")}
                    </tbody>
                </table>`

            return `
                <div class="fx-col gap-30">
                    <div>
                        ...${s} ?
                    </div>
                    
                    <div class="fx-col">
                        ${tab}
                    </div>
                </div>`
        })

        result.innerHTML = items.join("")
    }
}


// ========== UPDATE PLAYERS LISTS ==========
const updateList = async () => {
    // Home - liste des joueurs de la partie
    const list1 = document.getElementById("player1")
    if(list1){
        list1.innerHTML = presents?.filter(p => p?.pseudo)
            .map(p => `
                <li class="fx-row jc-center gap-20">
                    ${p?.isHost ? `<i class="fa-solid fa-crown"></i>` : ""}
                    <div>${p.pseudo}</div>
                </li>`)
            .join("")
        updateHome()
    }

    // Form - liste des joueurs qui ont répondu
    const list2 = document.getElementById("player2")
    if(list2)
        list2.innerHTML = presents.filter(p => p?.pseudo)
            .map(p => `
                <li class="fx-row gap-10">
                    <div>${p.pseudo}</div>
                    ${p.response ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                </li>`)
            .join("")

    try{
        if(presents?.find(p => p.id == playerId)?.response){
            await waitting("wait1")
        }

    }catch(e){
        //console.warn(e)
    }
    
    await buttonEventListener()
}


const updateNextPhase = async () => {
    const phase = settings.phase[round]
    
    // Partie Formulaire - Calcul des réponses
    if((phase == "form") && (presents.length == presents.filter(p => p.response).length)) {
            await updateDoc(docRef, { 
                [`phase.${round}`]: "result",
                nextRound: round + 1
            })
    }
}


// ========== Partie Accueil - Quitter la Partie ==========
const quit = async () => {
    try {
        await updateDoc(doc(docRef, "submissions", String(round + playerId)),{
            isPresent: false
        })
        window.location.href = "../../index.html";
        
    } catch (e) {
        console.error(e)
    }
}

// ========== Partie Accueil - Lancer le jeu ==========
const launch = async () => {
    try{
        await updateDoc(docRef, {
            [`phase.${round}`]: "form",
        });

    } catch(e){
        console.error("Erreur lors du lancement du jeu", e)
    }
}


// ========== Partie Formulaire - Envoyer les réponses ==========
const send = async () => {
    try{
        let response = {}
        for(let i=0; i<10; i++){
            const select = document.getElementById(i)
            if(select && select.value){
                response[i] = select.value
            }
        }
        if(Object.keys(response).length == countElement) {
            const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
            await updateDoc(playerDoc, {
                response
            })
            status("Réponses enregistrées !", true)

        } else {
            status("Répondre à toutes les questions !", false)
        }
       
    } catch(e){
        console.error(e)
    }
}


// ========== Partie result - Passer au round suivant ==========
const next = async () => {
    window.location.href = "../../";
}


// ========== Partie form, result - Attendre les autres jouerus ==========
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
}


const startTimer = (data) => {
    let { count, phase } = data
    const div = document.getElementById("count")

    timer = setInterval(() => {
        if(div){
            div.textContent = count + "s"
        }
        count--;
        if (count < 0){
            clearInterval(timer);
            (async () => {
                try {
                    await updateDoc(docRef, { 
                        [`phase.${round}`]: phase
                    });
                } catch (error) {
                    console.error(error)
                }
            })()
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
            isPresent: false,
            round,
            id: playerId 
        })
    }

    if(["result"].includes(phase)){
        if(!(sub && sub.response)) {
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

        const round = settings.currentRound;
        presents = submissions.filter(a => a.round == round && a.isPresent).map(p => ({ ...p, ...players[p.id] }))
        presents.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
        presents[0]["isHost"] = true
              
    } catch(e){
        console.error(e)
    }
}