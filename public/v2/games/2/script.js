import { doc, setDoc, getDoc, getDocs, updateDoc, collection, onSnapshot, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"
import { status, getUserPseudoByPlayerIdByGameId } from "/v2/src/tools/script.js"
import { TEMPLATE } from "/v2/src/frontend/package.js"


const params = new URLSearchParams(window.location.search);
const gameId = params.get("g")
const playerId = params.get("p")
const module = "2"

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
           
        await new Promise(resolve => setTimeout(resolve, 1000))
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

        await verifyHostInGame()
        
        if(!isUpdate){
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
    await updateHome()
    await updateForm()
    await updateResult()

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
}

const updateForm = async () => {
    // Lister les element favoris et Remplir les sélecteurs
    const form = document.getElementById("form")
    if(form && !form.innerHTML){
        countElement = 0
        form.innerHTML = presents
            .filter(p => p.favorite && (p.id != playerId || presents.length == 1))
            .map(p => {
                countElement++
                return `
                <li class="fx-col ai-center gap-10">
                    <div>${p.favorite}</div>
                    <select id="${p.id}">
                        <option value="">Choisissez un joueur</option>
                        ${presents
                            .filter(p => p.favorite)
                            .map(sub => `<option value="${sub.id}">${players[sub.id].pseudo}</option>`)
                            .join("")}
                    </select>
                </li>`})
            .join("")
    }
}

const updateResult = async () => {
    // Liste des players et leur titre
    const result = document.getElementById("result")
    if(result){
        result.innerHTML = presents.filter(p => p.favorite).map(p => {
            try{
                //ma reponse a l element favoris
                const response = presents.find(r => r.id == playerId)?.response?.[p.id]

                //la reponse du joueur predit sur cet element favoris
                const predict = presents.find(r => r.id == p.predict)?.response?.[p.id]

                return  `<li class="fx-row jc-between w-300">
                        <div class="${(predict == p.id) ? "valid-predict" : ""}">
                            ${p.pseudo} : 
                        </div>

                        <div class="${response == p.id ? "green" : ""} ${p?.predict == playerId ? "predict" : ""}">
                            <em>${p.favorite}</em>
                        </div>
                    </li>`
            }catch(e){
                console.error(e)
                return null
            }
        }).join("")
    }

    const tab = document.getElementById("result-score")
    if(tab){
        // Calcul des scores du round
        let score = calculScore({}, round)

        // Calcul des scores de la partie
        let scores = {}
        for(let i=1; i <= round; i++){
            scores = calculScore(scores, i)
        }
        
        let results = []
        try {
            for (let p of presents) {
                const pseudo = players[p.id].pseudo
                const point = score[p.id] || 0
                const points = scores[p.id] || 0
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
        } catch(e){
            console.log(e)
        }
    }
    
}
    
const calculScore = (score, roundId) => {
    const presentScore = submissions.filter(s => s.round == roundId && s.isPresent)
    for(let q of presentScore){
        const jq = q.id
        let predict = null
        try{
            predict = q.predict
        } catch(e){
            console.error(e)
        }
        for(let r of presentScore){
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
const updateList = async () => {
    // Home - liste des joueurs de la partie
    const list1 = document.getElementById("player1")
    if(list1){
        list1.innerHTML = presents?.filter(p => p?.pseudo)
            .map(p => `
                <li class="fx-row jc-center gap-20">
                    ${p?.isHost ? `<i class="fa-solid fa-crown"></i>` : ""}
                    <div>${p.pseudo}</div>
                    ${p.favorite ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                </li>`)
            .join("")
        updateHome()
    }
        

    // Home - selecteur de la prédiction
    const predict = document.getElementById("predict")
    if(predict){
        const defaultOption = '<option value="">Votre prédiction</option>'
        const options = presents.filter(p => p.pseudo)
            .map(p => `
                <option value="${p.id}">${p.pseudo}</option>
                `)
            .join("")
        predict.innerHTML = defaultOption + options
    }


    // Form - liste des joueurs qui ont répondu
    const list2 = document.getElementById("player2")
    if(list2)
        list2.innerHTML = presents.filter(p => p?.pseudo && p.favorite)
            .map(p => `
                <li class="fx-row gap-10">
                    <div>${p.pseudo}</div>
                    ${p.response ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                </li>`)
            .join("")

    // Result - liste des joueurs pour le round suivant
    const list3 = document.getElementById("player3")
    if(list3) 
        list3.innerHTML = presents.filter(p => p?.pseudo && p.favorite && 
            (p.response || (!p.response && p.id == playerId)))
                .map(p => {
                    return `
                    <li class="fx-row gap-10">
                        <div>${p.pseudo}</div>
                        ${p.next ? `<i class="fa-solid fa-thumbs-up"></i>` : ""}
                    </li>`})
                .join("")

    try{
        if(presents?.find(p => p.id == playerId)?.response){
            await waitting("wait1")
        }

        if(presents?.find(p => p.id == playerId)?.next){
            await waitting("wait2")
        }
    }catch(e){
        //console.warn(e)
    }
    
    await buttonEventListener()
}


const updateNextPhase = async () => {
    const phase = settings.phase[round]
    
    // Partie Formulaire - Calcul des réponses
    if(phase == "form"){
        //Pour plusieurs joueurs
        if((countElement > 0) && (presents.filter(p => p.favorite && p.response).length == (countElement+1))) {
            await updateDoc(docRef, { 
                [`phase.${round}`]: "result"
            })
        }

        //Pour un joueur
        if((presents.length == 1) && (presents.filter(p => p.favorite && p.response).length == (countElement))) {
            await updateDoc(docRef, { 
                [`phase.${round}`]: "result"
            })
        }
    }
    
    // Partie Résult - Calcul pour etape suivante
    if(phase == "result"){
        if(presents.filter(p => p.favorite && p.response).length == 
            presents.filter(p => p.favorite && p.response && p.next).length) {
                await updateDoc(docRef, {
                    currentRound: settings.nextRound
                }) 
        }
    }
    

    //Changement de round après la fin du chrono
    if(phase == "next"){
        await updateDoc(docRef, {
            currentRound: settings.nextRound
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

// ========== Partie Accueil - Enregistrer la question et la prédiction ==========
const submit = async () => {
    try{
        if (settings.phase[round] != "home"){
            status("La partie a commencé !", false);
            return;
        }

        const favorite = document.getElementById("favorite")?.value.trim()
        const predict = document.getElementById("predict")?.value.trim()

        if (!favorite) {
            await status("Veuillez renseigner votre préférence !", false);
            return;
        }
        if (!predict) {
            await status("Veuillez remplir la prédiction !", false);
            return;
        }
        
        await updateDoc(doc(collection(docRef, "submissions"), String(round + playerId)), {
            favorite: favorite,
            predict: predict
        });
        document.getElementById("favorite").value = ""
        document.getElementById("predict").value = ""
        await status("Préférence et prédiction enregistrées !", true)

    } catch(e){
        console.error(e)
    }
}


// ========== Partie Accueil - Lancer le jeu ==========
const launch = async () => {
    try{
        const sub = presents.find(p => p.id == playerId)
        if(!(sub && sub.favorite)){
            status("Trouvez votre élément favori !", false)
            return
        }
        await updateDoc(docRef, { 
            [`phase.${round}`]: "form",
            nextRound: round + 1
        });

    } catch(e){
        status("Le lancement a échoué", false)
        console.error("Erreur lors du lancement du jeu", e)
    }
}


// ========== Partie Formulaire - Envoyer les réponses ==========
const send = async () => {    
    let response = {}
    for(let p of presents){
        const select = document.getElementById(p.id)
        if(select && select.value){
            response[p.id] = select.value
        }
    }

    if(countElement !== Object.keys(response).length){
        status("Trouvez toutes les préférences !", false)
        return
    }

    try{
        const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
        await updateDoc(playerDoc, {
            response
        })
        status("Réponses enregistrées !", true)

    } catch(e){
        console.error(e)
    }
}


// ========== Partie result - Passer au round suivant ==========
const next = async () => {
    const max = settings.maxRound
    
    if(round >= max){
        window.location.href = "../../";
        return
    }
    
    const playerDoc = doc(collection(docRef, "submissions"), String(round + playerId))
    await updateDoc(playerDoc, {
        next: true
    })
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
    const round = settings.currentRound
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
    try {
        if(!sub){
            await setDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
                isPresent: true,
                round,
                id: playerId 
            })
        }

        if(["home"].includes(phase)){
            if(sub && !sub.isPresent){
                await updateDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
                    isPresent: true,
                })
            }
        }

        if(["form", "result"].includes(phase)){
            if(!(sub && sub.favorite)){
                await updateDoc(doc(db, "game", gameId, "submissions", String(round + playerId)), { 
                    isPresent: false,
                })
                document.getElementById("container").innerHTML = `Attendez le prochain tour...`
                return false
            }
        }

        return true
    } catch(e) {
        console.log(e)
        console.warn("submissions:", submissions)
        console.warn("sub:", sub)
    }
    

    
}


const verifyHostInGame = async () => {
    try{
        await WaitForData()

        presents = submissions.filter(a => a.round == round && a.isPresent).map(p => ({ ...p, ...players[p.id] }))
        presents.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
        presents[0]["isHost"] = true
              
    } catch(e){
        console.error(e)
        console.warn("presents:", presents)
        console.warn("settings:", settings)
    }
}