import { auth, db ,getUserPseudobyID} from "./firebase.js";
import { doc, setDoc, getDoc, getDocs, updateDoc,collection,onSnapshot,deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


const docRef = doc(collection(db,"loup-garou"),"0");
const colPlayer = collection(docRef,"players");
const colRole = collection(docRef,"roles");
const colGame = collection(docRef,"game")

let data = {};
let local = {};
let userIDloc = localStorage.getItem("userID");



onSnapshot(colPlayer, async (snapshot) => {
    const player = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
    }, {});
    data["players"] = player;
    await updatePlayer();
})
onSnapshot(colRole, async (snapshot) => {
    const role = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
    }, {});
    
    data["roles"] = role;
    await updateRole();
});

onSnapshot(docRef, async (snapshot) => {
    let snap = snapshot.data();
    data["started"] = snap.started

    const player = Object.keys(data.players);

    if(snap.started && player.includes(userIDloc)){
        window.location.href = "partie.html";
    }

})

const updatePlayer = async () => {
    const listPlayer = document.getElementById("list-player");
    listPlayer.innerHTML = "";

    for (let id in data.players) {
        const li = document.createElement('li');

        li.textContent = `${await getUserPseudobyID(id)}`;
        li.addEventListener("click", () => {
            if(local.admin){
                deleteDoc(doc(colPlayer, id));
            }
        })
        listPlayer.appendChild(li);
    }
}

const updateRole = async () => {
    const listRole = document.getElementById('list-role');
    listRole.innerHTML = "";

    for (let role in data.roles) {
        let count = data.roles[role].count;
        if(count>0){
            const li = document.createElement('li');
            li.textContent = role + (count > 1 ? ' X' + count : '');
            li.addEventListener('click', function () {
               // if(!local.admin){
                    updateDoc(doc(collection(docRef,"roles"),role),{
                        count: count-1
                    })

                //}
            });
            listRole.appendChild(li);      
        }
         
    }

    const roleCards = ["Villageois", "Voyante", "Garde",  "Chasseur",  "Sorcière", "Cupidon","Loup Garou",
        "Loup Garou Noir","Ange","Survivant","Assassin","Vampire","Pirate","Dictateur","Corbeau","Renard",];
    const roleDoublons = ["Villageois","Loup Garou","Chasseur",];
    
    const rolePresent = Object.entries(data.roles)
    .filter(([role, { count }]) => count >= 1)
    .map(([role]) => role);

    const selector = document.getElementById('selector');
    if(selector){
        selector.innerHTML = '';
        const optionDefault = document.createElement('option');
        optionDefault.textContent = "Choisir un rôle";
        optionDefault.value = "";
        selector.appendChild(optionDefault);
        
        for (let role of roleCards) {
            if(roleDoublons.includes(role) || !rolePresent.includes(role)){
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                selector.appendChild(option);
            }
        }
    }
    
}

window.joinPartie = async () => {
    if (!userIDloc) {
       alert("Veuillez-vous inscrire !");
       return;
    }
    if(data.started){
        alert("La partie a commencé !");
        return;
    }
    await setDoc(doc(colPlayer, userIDloc), {});
}

window.quitPartie = async () => {
    if(data.started){
        alert("La partie a commencé !");
        return;
    }
    if (userIDloc) {
        await deleteDoc(doc(colPlayer, userIDloc));
    }
}

window.addRole = async () => {
    const selector = document.getElementById("selector");
    if (selector && selector.value) {
        const role = selector.value;
        const n = (data.roles[role] && data.roles[role].count) || 0; // Default to 0 if not found
        await setDoc(doc(colRole, role), {
            count: n + 1
        });
    }
};




const updateBouton = async () => {

    if(local && local.admin){
        setting.innerHTML = `
        <div class="container flex-column-between form">
            <h1>Configuration Partie</h1>
            <div class="flex-column-between flex-center gap">
                <div id="vote-label">Temps de vote :</div>
                <select id="tempsvote" onchange="gameSetting()">
                    <option value="30">30 secondes</option>
                    <option value="60">1 minute</option>
                    <option value="120">2 minutes</option>
                    <option value="180">3 minutes</option>
                </select>
            </div>
            <div class="flex-column-between flex-center gap">
                <div>Temps d'appel des rôles :</div>
                <select id="tempsrole" onchange="gameSetting()">
                    <option value="20">20 secondes</option>
                    <option value="30">30 secondes</option>
                    <option value="45">45 secondes</option>
                </select>
            </div>
            <div class="flex-column-center flex-center">
                ${!started ?
                    `<button class="btn" onclick="StartPartie()">Lancer la partie</button>`:
                    `<button class="btn" onclick="StopPartie()">Arrêter la partie</button>` 
                }
            </div>
        </div>
        `
    }
    updateSetting();
}

const updateSetting = async (setting) => {
    document.getElementById("tempsvote").value = setting.tempsVote;
    document.getElementById("tempsrole").value = setting.tempsRole;  
}






window.lancer = async () =>{
    let roleRandom = Object.keys(data.roles).flatMap(key => 
        Array(data.roles[key].count).fill(key)
    );

    let player = Object.keys(data.players);

    //une partie avec minimum 4 joueurs
    if(player.length < 0){
        alert("Manque de joueurs, minimum 4 !");
        return;
    }

    //avoir autant de joueurs que de role
    if(player.length !== roleRandom.length){
        alert("Mauvaise configuration de la partie !");
        return;
    }

    //mettre les roles aléatoire
    for (let i = 0; i < roleRandom.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [roleRandom[i], roleRandom[j]] = [roleRandom[j], roleRandom[i]];
    }

    for (let i = 0; i < roleRandom.length; i++) {
        await updateDoc(doc(colPlayer,player[i]),{
            role: roleRandom[i],
            life: true
        })
    }

    await setDoc(doc(colGame,"server"),{})



    await updateDoc(docRef,{
        started: true
    })
}

const gameSetting = async () => {

    db.ref("game/setting").update({
        tempsVote: selectVote.value,
        tempsRole: selectRole.value
    });

}
    /*
}return db.ref("game/roles/").update({
    "garde/protect/id": "",
    "garde/last/id": "",
    "loupgarou/attaque/id": "",
    "loupgarou/attaque/allier": false,
    "loupgarou/choix": false,
    "loupgarounoir/choix": false,
    "chasseur/mort/id": [""],
    "chasseur/cible/id":"",
    "sorcière/soin/choix": false,
    "sorcière/soin/id":"",
    "sorcière/poison/choix": false,
    "sorcière/poison/id":"",
    "sorcière/id": "",
    "maire/vote/tab": [""],
    "maire/vote/id": "",
    "maire/vote/choix": false,
    "maire/id": "",
    "maire/choix": false,
    "cupidon/couple/id": ["",""],
    "cupidon/couple/life": false,
    "cupidon/choix": false,
    "pirate/otage/id": "",
    "pirate/otage/life": false,
    "pirate/choix": false,
    "dictateur/choix": false,
    "dictateur/cible/choix": false,
    "dictateur/cible/id":"",
    "survivant/nombre": 2,
    "survivant/utilise": false,
    "assassin/attaque/id": "",
    "corbeau/cible/id": "",
    "corbeau/cible/life":false,
    "corbeau/choix": false,
    "vampire/attaque/id":"",
    "vampire/attaque/choix": false,
    "vampire/mort/id": "",
    "vampire/mort/choix": false,
});*/


