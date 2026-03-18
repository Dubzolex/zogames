import { doc, addDoc, setDoc, getDoc, updateDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"

import { db } from "/v2/src/backend/index.js"
import { TEMPLATE } from "/v2/src/frontend/package.js"
import { status } from "/v2/src/tools/script.js"

export class Game {

constructor(element = null) {
    this.element = element
    this.stage = null
    this.gameId = null
}

create = async (stage) => {
    try {
        this.stage = stage
        await this.random()
        await this.init()

    } catch(e) {
        console.error(e)
        status("La création de la partie a échouée.", false, this.element)
    }
}

random = async () => {
    try{
        let snap
        do {
            this.gameId = String(Math.floor(Math.random() * 900000) + 100000)
            const docRef = doc(db, "game", this.gameId)
            snap = await getDoc(docRef)
        } while (snap.exists())

    } catch(e) {
        throw e
    }
}

getValue = (id, defaultValue = null) => {
    return document.getElementById(id)?.value ?? defaultValue
}

setArray = (array = [], max = 10) => {
    let tab = []
    for (let i = 0; i < max; i++) {
        const index = Math.floor(Math.random() * array.length)
        const value = array.splice(index, 1)[0]
        tab.push(value)
    }
    return tab
}

setObjet = (array = [], max = 10) => {
    let tab = {}
    for (let i = 1; i <= max; i++) {
        const index = Math.floor(Math.random() * array.length)
        tab[i] = array.splice(index, 1)[0]
    }
    return tab
}
 
values = [
    {
        stage: "1",
        access: this.getValue("public1"),
        duration: this.getValue("time1", 180),
        maxRound: this.getValue("round1"),
        phase: {1:"home", 2:"home", 3:"home", 4:"home", 5:"home", 6:"home", 7:"home", 8:"home", 9:"home", 10:"home"},
        theme: this.setObjet(TEMPLATE[1].themes)
    },
    {
        stage: "2",
        access: this.getValue("public2", "public"),
        duration: this.getValue("time2", 180),
        maxRound: this.getValue("round2", 4),
        phase: {1:"home", 2:"home", 3:"home", 4:"home", 5:"home", 6:"home", 7:"home", 8:"home", 9:"home", 10:"home"},
        theme: this.setObjet(TEMPLATE[2].themes)
    },
    {
        stage: "3",
        access: this.getValue("public3", "public"),
        duration: this.getValue("time3", 180),
        maxRound: this.getValue("round3", 3),
        phase: {1:"home", 2:"form", 3:"form", 4:"form", 5:"form", 6:"form", 7:"form", 8:"form", 9:"form", 10:"form"},
        letter: this.setObjet(TEMPLATE[3].letters)
    },
    {
        stage: "4",
        access: this.getValue("public4", "public"),
        duration: this.getValue("duration4", 120),
        maxRound: 1,
        phase: {1:"home"},
        sentence: this.setArray(TEMPLATE[4].sentences, this.getValue("round4"))
    },
]

init = async () => {
    const selectedStage = this.values.find(s => s.stage == this.stage)
    if (!selectedStage) throw new Error("Stage introuvable")

    try{
        await setDoc(doc(db, "game", this.gameId), {
            createdAt: new Date().toISOString(),
            currentRound: 1,
            nextRound: 1,
            id: this.gameId,
            started: false,
            ...selectedStage
        })

    } catch(e) {
        this.gameId = null
        throw e
    }
}

getId = () => {
    return this.gameId
}

}


export class Player {

constructor(element = null) {
    this.element = element
    this.gameId = null
    this.data = null
}

join = async (gameId) => {
    try {
        const docRef = doc(db, "game", gameId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            status("Cette partie n'existe pas !", false, this.element)
            return
        }

        this.gameId = gameId
        this.data = docSnap.data()

        await this.register()
        await this.connect()
        
        status("Partie rejointe avec succès !", true, this.element)

    } catch(e) {
        console.error(e)
        status("Votre inscription à la partie a échoué.", false, this.element)
    }
}

register = async () => {
    if(!this.gameId) {
        alert("La partie n'existe pas.")
    }

    const userId = localStorage.getItem("uid")
    if(!userId){
        window.location.href = `/v2/login/guest/?g=${this.gameId}`
        return
    }

    const mapRef = doc(db, "game", this.gameId, "maps", "bindings")
    try{
        const snap = await getDoc(mapRef)
        const data = snap.data()

        if(Object.keys(data).includes(userId)){
            this.playerId = data[userId]
            return
        }

    } catch(e) {
        
    }

    this.playerId = String(Math.floor(Math.random() * 900000) + 100000)

    //Document Maps
    try {
        await updateDoc(mapRef, {
            [this.playerId]: userId,
            [userId]: this.playerId
        })

    } catch(e) {
        await setDoc(mapRef, {
            [this.playerId]: userId,
            [userId]: this.playerId
        })
    }

    //Document Players
    try {
        const playerRef = doc(db, "game", this.gameId, "players", this.playerId)
        await setDoc(playerRef, {
            joinedAt: new Date().toISOString(),
            id: this.playerId,
        })

    } catch(e) {
        this.playerId = null
        throw e
    }
}

connect = async () => {
    if(!this.gameId) {
        alert("La partie n'existe pas.")
    }
    try{
        const round = this.data.currentRound || 1
        const stage = this.data.stage

        //Document Submissions
        await setDoc(doc(db, "game", this.gameId, "submissions", 
            String(round + this.playerId)), {
            id: this.playerId,
            round: round,
            isPresent: true
        })

        window.location.href = `/v2/games/${stage}/?g=${this.gameId}&p=${this.playerId}`

    } catch(e){
        throw e
    } 
}

getId = () => {
    return this.playerId
}

}