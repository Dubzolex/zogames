




const JoinPartie = async () => {
    const local = await get("local");
    if (userIDloc && local && local.pseudo) {
        db.ref("users/" + userIDloc).update({
            client: true,
        });
    }else{
        alert("Veuillez-vous inscrire !");
    }
}

const QuitPartie = async () => {
    if (userIDloc) {
        db.ref("users/" + userIDloc).update({
            client: false,
        });
    }
}

const AddRole = async () => {
    let carte = await get("game/carte")
    if (selector.value) {
        if(!carte) carte = {}
        carte[selector.value] = (carte[selector.value] || 0 ) + 1;
        db.ref("game/").update({carte})
    }
}

const updateListUser = async () => {
    const listPlayer = document.getElementById("list-player");
    listPlayer.innerHTML = "";
    let village = await get("village");
    let local = await get("local");

    for (let player of village) {
        const li = document.createElement('li');

        li.textContent = `${player.pseudo} ${player.admin ? '(Admin)' : ''}`;
        li.addEventListener("click",()=>{
            if(local.admin){
                db.ref("users/" + player.id).update({
                client: false,
                });
            }
        })
        listPlayer.appendChild(li);
    }
}

const updateListCarte = async (carte) => {
    let roleCards = [
        "Villageois", 
        "Voyante", 
        "Garde",  
        "Chasseur",  
        "Sorcière", 
        "Cupidon",
        "Loup Garou",
        "Loup Garou Noir",
        "Ange",
        "Survivant",
        "Assassin",
        "Vampire",
        "Pirate",
        "Dictateur",
        "Corbeau",
        "Renard",
    ];
    const roleDoublons = [
        "Villageois",
        "Loup-Garou",
        "Chasseur",
    ];
    let roleCounts = [];

    if(carte){
        roleCounts = Object.keys(carte).map(name => {
            return { name: name, count: carte[name] };
        });
    }

    const selector = document.getElementById('selector');
    selector.innerHTML = '';
    const optionDefault = document.createElement('option');
    optionDefault.textContent = "Choisir un rôle";
    optionDefault.value = "";
    selector.appendChild(optionDefault);
    
    for (let role of roleCards) {
        if(roleDoublons.includes(role) || !roleCounts.map(r => r.name).includes(role)){
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            selector.appendChild(option);
        }
    }
}
const updateListRole = async (carte) => {
    let local = await get("local");

    let roleCounts = []

    if(carte){
        roleCounts = Object.keys(carte).map(name => {
            return { name: name, count: carte[name] };
        });
    }   
    const listRole = document.getElementById('list-role');
    listRole.innerHTML = "";
    for (let role of roleCounts) {
        const li = document.createElement('li');
        li.textContent = role.name + (role.count > 1 ? ' X' + role.count : '');
        li.addEventListener('click', function () {
            if(local.admin){
                carte[role.name] = (carte[role.name] || 0 ) - 1;
                if(carte[role.name] <= 0){
                    db.ref("game/carte/" + role.name).remove();
                } else{
                    db.ref("game/").update({carte: carte})
                }
            }
        });
        listRole.appendChild(li);   
    }
}

const updateBouton = async () => {
    const join = document.getElementById("join");
    const add = document.getElementById("add");
    const setting = document.getElementById("setting");

    let local = await get("local");
    let started = await get("game/started");

    
    join.innerHTML = started ? "" : (local && local.client ? 
        `<button class="btn" onclick="QuitPartie()">Quitter la partie</button>`:
        `<button class="btn" onclick="JoinPartie()">Rejoindre la partie</button>`);
    


    if (started && local && local.client) {
        window.location.href = "partie.html";
    }
    
    
    add.innerHTML = `<select id="selector"></select>${local && local.admin ? `<button class="btn" onclick="AddRole()">Ajouter</button>`:""}`;


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
    updateListCarte();
    updateSetting();
}

const updateSetting = async (setting) => {
    document.getElementById("tempsvote").value = setting.tempsVote;
    document.getElementById("tempsrole").value = setting.tempsRole;  
}

db.ref("users").on("value", () => {
    updateListUser();
    updateBouton();
});

db.ref("game/carte").on("value", (snapshot) => {
    updateListRole(snapshot.val());
    updateListCarte(snapshot.val());
});

db.ref("game/started").on("value", (snapshot) => {
    updateBouton()
});

db.ref("game/setting").on("value", (snapshot) => {
    updateSetting(snapshot.val());
});


const StartPartie = async () =>{
    let local = await get("local");
    let village = await get("village");

    if(village.length < 1){
        alert("manque de joueurs : minimum 4");
        return;
    }
    let carte = await get("game/carte");
    let roleSac  = {};
    if(carte){
        roleSac = Object.keys(carte).reduce((acc, name) => {
        for (let i = 0; i < carte[name]; i++) {
            acc.push(name);
        }
        return acc;
        }, []);
    }

    if (village.length !== roleSac.length) { 
        alert("Mauvaise configuration de la partie");
        return;  
    }
        
    // Mélange des rôles
    let alea;
    for (let i = 0; i < roleSac.length; i++) {
        alea = Math.floor(Math.random() * roleSac.length);
        [roleSac[i], roleSac[alea]] = [roleSac[alea], roleSac[i]];
    }

    let promises = [];
    let index = 0;

    for (let membre of village) {
        let updatePromise = db.ref("users/" + membre.id).update({
            role: roleSac[index],
            death: false,
            vote: "",
            LG: "",
            MJ: false,
        });
        promises.push(updatePromise);
        index++;
    }

    Promise.all(promises)
        .then(() => {
            return db.ref("users/" + local.id).update({ MJ: true });
        })
        .then(() => {
            return db.ref("server").update({
                stepDay:[{phase:"",time:0}, {phase:"Attente",time:10}],
                nstep: 0,
                timer: 0,
                nstepInfini: 0,
                nDay: 0,
            });
        })
        .then(() => {
            return db.ref("game/roles/").update({
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
            });
        })
        .then(() => {
            return db.ref("game/program/").update({
                camp:"",
                appel:"",
            });
        })
        .then(() => {
            return db.ref("game/message").remove();
        })
        .then(() => {
            return new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 3 secondes
        })
        .then(() => {
            return db.ref("game/").update({
                started: true,
            });
        })
        .catch(error => {
            console.error("Erreur lors de la configuration de la partie : ", error);
        });
}

const gameSetting = async () => {

    db.ref("game/setting").update({
        tempsVote: selectVote.value,
        tempsRole: selectRole.value
    });
}



