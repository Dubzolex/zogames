import {db,getUserPseudobyID} from "./firebase.js";
import {doc,setDoc,getDoc,getDocs,updateDoc,collection,onSnapshot,deleteDoc} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


const docRef = doc(collection(db,"loup-garou"),"0");
const colPlayer = collection(docRef,"players");
const colRole = collection(docRef,"roles");
const colGame = collection(docRef,"game");

let data = {};
const userIDloc = localStorage.getItem("userID");
const UI = document.getElementById("interface");


onSnapshot(colPlayer, async (snapshot) => {
    const player = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
    }, {});

    data["players"] = player;
    //console.log("data players",data);
    await displayCard();
    await updatePlayers();
});

onSnapshot(colRole, async (snapshot) => {
    const role = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
    }, {});
    //console.log("data roles",data);
    data["roles"] = role;
    await updateRoles();
});
















firebase

























































const displayActionRole = async (appel) => {
  
    //récupérer le pseudo de tout les joueurs dans les selects
    const listOption = `<option value="">Sélectionner</option>` + 
    (await Promise.all(Object.entries(data.players).map(async ([id,player]) => {
        const pseudo = await getUserPseudobyID(id);
        if(player.life)
            return `<option value="${id}">${pseudo}</option>`;
    }))).join('');

    //récupérer le pseudo de tous les loups
    const listLoup = (await Promise.all(Object.keys(data.players).filter(id => ["Loup Garou"].includes(data.players[id].role)).map(id => getUserPseudobyID(id)))).join(", ");

    //partie html de chaque étape appelée
    const  html = {
        Voyante: [`
            <h3>Voyante</h3>
            <p>Choisis une personne dont tu veux connaitre son identité.</p>
            <select id="list-joueur">${listOption}</select>
            <button onclick="voyante()">Regarder</button>`
        ],

        Garde: [`
            <h3>Garde</h3>
            <p>Choisis une personne à protèger.</p>
            <select id="list-joueur">${listOption}</select>
            <button onclick="garde()">Protéger</button>`
        ],

        "Loup Garou": [`
            <div class="flex gap-10">
                <h3>Loups Garous</h3>
                <p>${listLoup}</p>
                <p>Choisis une cible à dévorer.</p>
            </div>
            <ul id="loupgarou-attaque" class="flex-column-between gap-item"></ul>
            <div class="flex-row gap-10">
                <select id="list-joueur">${listOption}</select>
                <button onclick="loupgarou()">Dévorer</button>
            </div>`
        ],

        Sorcière: [`
            <h3>Sorcière</h3>
            <p>Veux-tu sauver la victime des loups ou empoisonner une personne.</p>
            <select><option>${await getUserPseudobyID(data.roles["Loup Garou"]?.attaque?.id || "")}</option></select>
            <button onclick="sorcièreSoin()">Soin</button>
            <select id="list-joueur">${listOption}</select>
            <button onclick="sorcièrePoison()">Poison</button>
            <button onclick="timeLeft()">Ne rien faire</button>`
        ],
                
        Chasseur: [`
            <h3>Chasseur</h3>
            <p>Choisis une personne qui va recevoir ta dernière balle.</p>
            <select id="list-joueur">${listOption}</select>
            <button onclick="chasseur()">Tirer</button>`
        ],
           
        Cupidon: [`
            <h3>Cupidon</h3>
            <p>Choisis deux personnes à mettre en couple.</p>
            <select id="list-joueur1">${listOption}</select>
            <select id="list-joueur2">${listOption}</select>
            <button onclick="cupidon()">Amour</button>`
        ],
               
        Vote: [`
            <div class="flex gap-10">
                <h3>Vote de la journée</h3>
                <p id="count-vote"></p>
            </div>
            <ul id="list-vote" class="flex-column-between gap-10"></ul>
            <div class="flex-row gap-10">
                <select id="list-joueur">${listOption}</select>
                <button onclick="voter()">Voter</button>
            </div>`
        ],
         
        Assassin: [`
            <h3>Assassin</h3>
            <p>Choisis une cible à éliminer.</p>
            <select id="list-joueur">${listOption}</select>
            <button onclick="assassin()">Poignarder</button>`
        ],
        
    }
    UI.innerHTML = html[appel]
    await updatePlayers();
    await updateRoles();
}



const displayCondition = async (partie,qui) => {
    let elementPartie = {
        win: `<h2 style="font-weight: bold;color: green">Victoire !</h2>`,
        lose: `<h2 style="font-weight: bold;color: red">Défaite !</h2>`,
        égalité: `<h2 style="font-weight: bold;color:darkviolet">Égalité !</h2>`
    }
style="font-size: 20px; color: rgb(107, 76, 15)"
    let elementQui = {
        Villageois:  `<p>Les villageois ont gagné la partie.</p>`,
        "Loup Garou": `<p>Les Loups Garous ont gagné la partie.</p>`,
        Ange: `<p>L'Ange a gagné la partie.</p>`,
        Assassin: `<p>L'Assassin a gagné la partie.</p>`,
        Couple: `<p>Le Couple a gagné la partie.</p>`,
        Vampire: `<p>Les Vampires ont gagné la partie.</p>`,
        Egalité: ``
    }
    
    UI.innerHTML = `
    <div class="flex-column-center flex-center flex-1 gap-20">
        ${elementPartie[partie]}
        ${elementQui[qui]}
    </div>`;

}




const displaySentence = async (appel) => {

    //const chasseur = await getUserPseudobyID(data.roles["Chasseur"].mort.id[0]) || "";
    //const maire = await getUserPseudobyID(data.roles.maire.id) || "";
    const death = data.players[userIDloc].death;

    let text = {
        "Attente": `Distribution des <b>roles</b>, regardez votre carte pour connaitre votre identité...`,
        "Nuit": `La <b>Nuit</b> tombe sur le village...`,
        "Jour": `Le <b>Jour</b> se lève sur le village...`,
        "Voyante": `La <b>Voyante</b> utilise sa boule de cristal...`,
        "Garde": `Le <b>Garde</b> confectionne un bouclier...`,
        "Loup Garou": `Les <b>Loups Garous</b> cherchent leur proie...`,
        "Sorcière": `La <b>Sorcière</b> est en train de concocter une potion...`,
        //"Chasseur": `Le <b> Chasseur ${chasseur} </b> décide qui il va emporter avec lui...`,
        "Cupidon": `Le <b>Cupidon</b> désigne deux âmes à unir...`,
        "Vote": `La phase des <b>Votes</b> a commencé...`,
        //"Maire-Election": `L'<b>Election du Maire</b> est en cours...`,
        //"Maire-Choix": `Egalité, Le <b>Maire ${maire}</b> départage les votes...`,
        //"Maire-Mort": `<b>${maire}</b> choisie le nouveau Maire...`,
        "Loup Garou Noir": `Le <b>Loup-Garou-Noir</b> se décide...`,
        "Pirate": `Le <b>Pirate</b> désigne son otage...`,
        "Dictateur": `Le <b>Dictateur</b> décide s'il veut se dévoiler...`,
        "Dictateur-Vote": `Le <b>Dictateur</b> réalise un coup d'état...`,
        "Assassin": `L'<b>Assassin</b> ne controle plus ses pulsions...`,
        "Survivant": `Le <b> Survivant </b> décide s'il veut se protéger...`,
        "Corbeau": `Le <b>Corbeau</b> s'apprête a diffamer quelqu'un...`,
        "Renard": `Le <b>Renard</b> renifle les méchants...`,
        "Vampire": `Les <b>Vampires</b> sont en quête de leur victime...`
    };
    
    

    UI.innerHTML = `
    <div class="flex-column-center flex-center flex-1 gap-element">
        <p>${text[appel] || ""}</p>
        ${death ? `<i class="fa-solid fa-skull-crossbones"></i>` : ""}
    </div>`;
    
}



const display = async (appel) => {
    
    const role = data.players[userIDloc].role;
    const death = data.players[userIDloc].death;
    
    let roleForced = ["Villageois", "Voyante", "Garde",  "Chasseur",  "Sorcière", "Cupidon","Loup Garou","Loup Garou Noir","Ange","Survivant","Assassin","Vampire","Pirate","Dictateur","Corbeau","Renard","Maire-Election","Maire-Choix","Maire-Mort"];

    if(death){
        await displaySentence(appel)
    }
    
    switch(appel){
        //afficher l'image du fond d'écran
        case "Nuit":case "Voyante":case "Garde": case "Sorcière":case "Cupidon": 
        case "Pirate": case "Dictateur": case "Corbeau":case "Renard":case "Survivant":
        case "Assassin":case "Loup Garou":case "Loup Garou Noir":
            document.querySelector(".fondjour").classList.add("nuit");
            break;
    
        case "Jour":case "Chasseur":case "Maire-Election":case "Maire-Choix":case "Maire-Mort":
        case "Vote":case "Dictateur-Vote":
            document.querySelector(".fondjour").classList.remove("nuit");
            break;
        
        //appeler le chasseur lors de sa mort
        case "Chasseur":
            if(data.roles["Chasseur"].mort.id[0] && data.roles["Chasseur"].mort.id[0] === userIDloc){
                await displayActionRole(appel);
                return;
            }
        break;

    }

    switch(`${appel} ${role}`){
        //condition de victoire
        case "condition-villageois Villageois":
        case "condition-villageois Voyante":
        case "condition-villageois Garde":
        case "condition-villageois Sorcière":
        case "condition-villageois Chasseur":
        case "condition-villageois Cupidon":
        case "condition-villageois Pirate":
        case "condition-loup-garou Loup Garou":
        case "condition-assassin Assassin":
        case "condition-ange Ange":
            await displayCondition("win",appel);
            return;

        //action des roles
        case "Voyante Voyante":
        case "Garde Garde":
        case "Loup Garou Loup Garou":
        case "Loup Garou Loup Garou Noir":
        case "Sorcière Sorcière":
        case "Cupidon Cupidon":
        case "Loup Garou Noir Loup Garou Noir":
        case "Pirate Pirate":
        case "Dictateur Dictateur":
        case "Dictateur-Vote Dictateur":
        case "Survivant Survivant":
        case "Assassin Assassin":
        case "Corbeau Corbeau":
        case "Renard Renard":
        case "Vampire Vampire":
            await displayActionRole(appel);
            return;
    } 

    switch(appel){
        case "condition-villageois":
        case "condition-loup-garou":
        case "condition-assassin":
        case "condition-ange":
            await displayCondition("lose",appel);
            return;
        
        case "Vote":
        case "Maire-Election":
            await displayActionRole(appel);
            return;
    }
    await displaySentence(appel);
}




















































































    
const displayCard = async () => {

    //création de la carte
    const camp = {
        "Villageois": "Villageois",
        "Voyante": "Villageois",
        "Garde":   "Villageois",
        "Loup Garou": "Loup Garou",
        "Sorcière":  "Villageois",
        "Chasseur": "Villageois",
        "Cupidon": "Villageois",
        "Ange": "Seul",
        "Loup Garou Noir": "Loup Garou",
        "Pirate": "Villageois",
        "Dictateur": "Villageois",
        "Assassin": "Seul",
        "Survivant": "Seul",
        "Corbeau": "Villageois",
        "Renard": "Villageois",
        "Vampire": "Vampire",
    };

    const text = {
        "Villageois": "Tu n'as pas de role en particulier, à part débattre lors du vote de jour.",
        "Voyante": "Chaque nuit, tu regarde l'identité d'une personne.",
        "Garde":   "Chaque nuit, tu protège une personne différente.",
        "Loup Garou": "Tu te réveilles la nuit avec tes compères pour manger une personne.",
        "Sorcière": "Tu disposes d'une potion de mort et d'une potion de soin pour sauver la victime des Loups Garous à utiliser durant la nuit.",
        "Chasseur": "A ta mort, tu utilise ton fusil pour éliminer une personne.",
        "Cupidon": "Tu choisis deux personnes qui seront en couple, si l'un meurt, l'autre se suicidera.",
        "Ange": "Pour gagner, tu dois te faire éliminer durant les votes de jour.",
        "Loup Garou Noir":  "Une fois dans la partie, tu peux rallier la victime des loups garous à ton camp.",
        "Pirate": "Tu choisis un otage, si tu as le plus bulletin à l'issu du vote de la journées,c'est ton otage qui meurt à la place.",
        "Dictateur": "Tu décides de faire un coup d'état pour remplacer le vote de la journée, si tu échoues en éliminanr un gentil, tu te suicide, sinon tu deviens le maire du village.",
        "Assassin": "Chaque nuit, tu utilise ton couteau pour poignarder une personne, tu es immunisé contre l'attaque des loups.",
        "Survivant": "Tu disposes deux protection, à utiliser la nuit astucieusement.",
        "Corbeau": "Chaque nuit, tu choisis une personne qui aura deux voies supplémentaire au prochain vote.",
        "Renard": "Chaque nuit, tu renifles deux personnes pour savoir si ils sont hostiles au village.",
        "Vampire": "Toutes les deux nuits, tu transforme une personne en vampire, l'assassin est immunisé contre votre attaque et le chasseur vous tue si vous le ciblé."
    
    };

    //affichage de la carte du role

    const role = data.players[userIDloc].role;

    if(role){
        const carte = document.querySelector(".carte-role");
        carte.innerHTML = `
            <h3>${role}</h3>
            <div class="image-role ${role.replace(/\s+/g, '-')}" style="width: 100px; height:100px;"></div>
            <p style="font-style: italic;">${camp[role]}</p>
            <p class="text-center">${text[role]}</p>`;
    }
}




const updatePlayers = async () => {

    //affichage des votes

    const listVote = document.getElementById("list-vote");
    if(listVote){
        listVote.innerHTML = "";
        let countPlayer = 0;
        let countVote = 0;
        for (let player in data.players) {
            countPlayer++;
            const pseudo = await getUserPseudobyID(player);
            const target = await getUserPseudobyID(data.players[player].vote)
            if(pseudo && target){
                listVote.innerHTML += `<li>${pseudo} vote pour ${target}</li>`;
                countVote++
            }         
        }
        const vote = document.getElementById("count-vote");
        if(vote){
            vote.textContent = `( ${countVote} / ${countPlayer} )`;
        }
    }
}



const updateRoles = async () => {

    //affichage des attaques des loups

    const listVote = document.getElementById("loup-garou-attque");
    if(listVote){
        listVote.innerHTML = "";
        const LG = data.roles["Loup Garou"]?.vote;
        for (let player in LG) {
            const pseudo = await getUserPseudobyID(player);
            const target = await getUserPseudobyID(LG[player])
            if(pseudo && target){
                listVote.innerHTML += `<li>${pseudo} veut dévorer ${target}</li>`;
            }         
        }
    }
}   











































//bouton html
window.voyante = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;
    if (option === userIDloc) {
        alert("Choisir une autre personne.");
        return;
    }
    await envoieMessage(`${await getUserPseudobyID(option)} est ${data.players[option].role}.`,userIDloc,"information");
    await timeLeft();
}
//bouton html
window.garde = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;
    if (option === data.roles["Garde"].last-id) {
        alert("Cette personne ne peut pas être protégée une seconde fois.");
        return;
    }
    await updateDoc(doc(collection(docRef,"roles"),"Garde"),{
        "last-id":option,
        "id":option
    })
    if(option === userIDloc)
        await envoieMessage(`Tu sera protégé cette nuit.`,userIDloc,"information");
    else
       await envoieMessage(`Tu as protégé ${await getUserPseudobyID(option)} cette nuit.`,userIDloc,"information"); 
    await timeLeft();
}
//bouton html
window.loupgarou = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    await updateDoc(doc(collection(docRef, "roles"),"Loup Garou"), {
        [`vote.${userIDloc}`]: option
    });

    //compter le nombre de loup garou
}
//bouton html
window.sorcièreSoin = async () =>  {
   
    if(data.roles["Sorcière"].soin.choix){
        alert("Tu as déja utilisé ta potion de soin");
        return;
    }

    if(!data.roles["Loup Garou"].choix){
        alert("Aucune attaque effectuée par les loups.");
        return;
    }
    const option = data.roles["Loup Garou"].attaque.id;
    await updateDoc(doc(collection(docRef, "roles"),"Sorcière"), {
        choix: true,
        id: option
    });
    await envoieMessage(`${await getUserPseudobyID(option)} a été sauver.`,userIDloc,"information");
    await timeLeft();
}
//bouton html
window.sorcièrePoison = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option)return;
    if(data.roles["Sorcière"].poison.choix){
        alert("Tu as déja utilisé ta potion de poison.");
        return;
    }
    if(option === data.roles["Loup Garou"].attaque.id){
        alert("Cette personne est déja visée par les loups.");
        return;
    }
    if(option === userIDloc){
        alert("Tu ne peux pas t'empoisonner.");
        return;
    }

    await updateDoc(doc(collection(docRef, "roles"),"Sorcière"), {
        "poison/choix":true,
        "poison/id": option
    });
    await envoieMessage(`${await getUserPseudobyID(option)} recevra une potion de poison.`,userIDloc,"information");
    await timeLeft();
}
//bouton html
window.chasseur = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;
    await envoieMessage(`${await getUserPseudobyID(option)} as reçu ta balle.`,userIDloc,"information");
    await updateDoc(doc(collection(docRef,"roles"),"Chasseur"),{
        "cible/id": option,
    })
    await timeLeft();
}

const cupidon = async () =>  {
    let option = [document.getElementById("list-joueur1").value,document.getElementById("list-joueur2").value];


    if(option[0] && option[1] && option[0] === option[1]){
        alert("Choisir deux personnes différentes.");
        return;
    }
    await updateDoc(doc(collection(docRef,"roles" ),"Cupidon"), {
        "couple/id": option,
        "couple/life":true,
        choix: true
    });
    await envoieMessage(`Tu est en couple avec ${await getUserPseudobyID(option[0])}, il est ${data.players[option[0]].role}.`, option[1],"information");
    await envoieMessage(`Tu est en couple avec ${await getUserPseudobyID(option[1])}, il est ${data.players[option[1]].role}.`, option[0],"information");
    await envoieMessage(`${await getUserPseudobyID(option[0])} et ${await getUserPseudobyID(option[1])} seront en couple.`, userIDloc,"information");
    await timeLeft();
}
//bouton html
window.voter = async () =>  {
    const option = document.getElementById("list-joueur").value;
   
    await updateDoc(doc(collection(docRef, "players"),userIDloc), {
        vote: option
    });
}





























window.pirate = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    if(userIDloc === option){
        alert("Tu ne peux pas te prendre en otage.");
        return;
    }

    await updateDoc(doc(collection(docRef,"Pirate")),{
        "otage/id": option,
        choix: true,
        "otage/life": true
    })

    await envoieMessage(`Tu as pris en otage ${await getUserPseudobyID(option)}.`, userIDloc,"information");
    await envoieMessage(`Tu est devenu otage.`, option,"information");
    await timeLeft();
}


window.assassin = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    if(userIDloc === option){
        alert("Tu ne peut pas te poignarder toi-même.");
        return;
    }

    await updateDoc(doc(collection(docRef,"Assassin")),{
        "attaque/id": option,
    })

    await envoieMessage(`Tu as poignarder ${await getUserPseudobyID(option)}.`,userIDloc,"information");
    await timeLeft();
}



















































































onSnapshot(doc(colGame,"message"), async (snapshot) => {
    const message = snapshot.data()
    data["message"] = message;
    await displayMessage()   
}, {});

    

//enregistrer le message dans la base de données

const envoieMessage = async (text,name,forme) => {
    try {
        console.log("envoie")
                
        await updateDoc(doc(colGame,"message"), {
            [Object.keys(data.message).length]:{
                "text": text,
                "destinataire": name,
                "forme": forme}
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
    }
}


//affichage du journal de messages

const displayMessage = async () => {
    const listmessage = document.querySelector(".list-message");
    listmessage.innerHTML = "";
    const role = data.players[userIDloc].role;

    for(let msg in data.message){
        switch(msg.destinataire){
            case "tous":
            case role:
            case userIDloc:
                const li = document.createElement('li');
                li.textContent = msg.text;
                li.classList = msg.forme;
                listmessage.appendChild(li);
        }
    } 
}




































    

















let server = {};

onSnapshot(doc(colGame,"server"), async (snapshot) => {
    //console.log(snapshot.data())
    server = snapshot.data();
    timer = server.stepDay[server.nstep].time
    const phase = server.stepDay[server.nstep].phase;
    await display(phase);

});

let updating = false;
let timer;
let MJ = true
const interval = setInterval(async () => {
    //console.log("interval",data)
    if(data){
        if (timer >= 0) {
            document.querySelector(".timer").innerHTML = timer;
            timer--
        }else if(MJ && !updating){
            updating = true
            await gameCycleTimer();
            updating = false;
        }
    } 
        
}, 1000); // Change interval to 1 second (1000 ms)

const gameCycleTimer = async () => {
        server.nstep = (server.nstep || 0) + 1;
        server.nstepInfini = (server.nstepInfini || 0) + 1;

        if(!(server.stepDay && server.stepDay[server.nstep])){
            await planRoleAppel();
        }

        await updateDoc(doc(colGame,"server"), { ...server });
        
        if(server.timer === data.stepDay[server.nstep].time - 1){ await StartOfPhase();}
        if(server.timer === 1){ await EndOfPhase();}
}

const planRoleAppel = async () =>  {
        server.nstep = 0;
        server.nDay = (server.nDay || 0) + 1;

        //les roles se levant la nuit
        let roleNuit = ["Cupidon", "Voyante", "Garde", "Pirate", "Survivant", "Dictateur", "Corbeau", "Renard", "Assassin", "Vampire", "Loup Garou", "Loup Garou Noir", "Sorcière"];

        // Récupérer les rôles de la partie qui jouent la nuit
        
        console.log("rolePrésent")
        let rolePresent = roleNuit.filter(role => 
            Object.values(data.players).map(player => player.role).includes(role)
        );

        console.log(rolePresent)
        const phase = ["Nuit", ...rolePresent, "Jour", "Vote"];
        const t0 = 5;
        const t1 = 30;
        const t2 = 60;
        
        //ajouter les roles présent dans le stepDay
        server.stepDay = phase.map(p => {
            return {
                phase: p,
                time: rolePresent.includes(p) ? t1 : p === phase[phase.length-1] ? t2 : t0
            };
        });
}

const addElementPlan = async (element, timer) => {
    try {
        const step = {phase:element,time: Number(timer)}
        let newstep = [];
        for (let i = 0; i < server.stepDay.length; i++) {
            newstep.push(server.stepDay[i])
            if(i === server.nstep){
                newstep.push(step);
            }
        }
        
    } catch (error) {
        console.error("Error during addElementPlan:", error);
    }
}



const timeLeft = async () => {
   
}

const resetRoles = async () => {
    
};

const resetVotes = async () => {
    
};

const StartOfPhase = async () => {//retard de 1 seconde du depart dutimer

switch (server.stepDay[data.nstep].phase) {
    case "Nuit":
        await envoieMessage(`${server.stepDay[data.nstep].phase} ${server.nDay} :`,"tous","evenement");
        break;

    case "Jour"://les mort durant la nuit

        //tué la victime des Loup Garou
        await JoueurMort(roles.loupgarou.attaque.id,"Loup Garou");

        //tué la personne viser par la Sorcière
        await JoueurMort(roles.sorcière.poison.id,"Sorcière");

        //tué la victime  viser par Assassin
        await JoueurMort(roles.assassin.attaque.id,"Assassin");
        
    break;

    case "Vote":
        if(data.stepDay[data.nstep-1].phase !== "Maire-Election")
            await envoieMessage(`Jour ${data.nDay} :`,"tous","evenement");
    break;
}
}

const EndOfPhase = async () => {//arriver a 1 seconde du timer
    switch (server.stepDay[server.nstep].phase) {
        case "Chasseur"://retirer du tableau le nom du chasseur venant de tirer
            await gestionChasseur();
        break;
        case "Loup Garou"://configurer le vote des loups a l hunanimité
            await gestionLoupGarou();
        break;
        case "Vote"://lancer le dépouillement du vote jour
            await bulletinVote();
        break;
        case "Maire-Election"://lancer le dépouillement de l'élection du maire
            await bulletinElectionMaire();
        break;
        case "Maire-Choix"://tuer par alea un joueur avec max de vote si pas choisie par la maire
            await gestionMaireChoix()
        break;
        case "Maire-Mort"://mettre un nouveau maire alea si pas choisit par l'ancien maire
            await gestionMaireMort();
        break;
    }
}






const gestionLoupGarou = async () => {

    //récupérer les votes des loups
    const vote = Object.values(data.roles["Loup Garou"].vote)

    //obtenir celui a qui le plus de vote
    const attaque ="vote.";
    
    if(attaque){
        switch(role){
            case "Assassin":
                await envoieMessage(`Votre cible ${await getUserPseudobyID(attaque)} est immunisée.`,"Loup Garou","information");
                return;
            default:
                await envoieMessage(`Votre cible est ${await getUserPseudobyID(attaque)}.`,"Loup Garou","information");
        }
    }
}





const gestionChasseur = async () => {
    let mort = data["Chasseur"].cible.id;
    let chasseur = data["Chasseur"].mort.id;
    chasseur = chasseur.unshift();
    await updateDoc(colRole,"Chasseur", {
        "cible/id": "",
        "mort/id": chasseur
    });

    await JoueurMort(mort,"Chasseur");
}











const gestionMaireChoix = async () => {
    let roles = await get("game/roles");
    let name ="";
    if(roles.maire.vote.choix){
        name = roles.maire.vote.id;
    }else{
        const randomIndex = Math.floor(Math.random() * roles.maire.vote.tab.length); 
        name = roles.maire.vote.tab[randomIndex]
    }
   await JoueurMort(name,"Vote");
}


const gestionMaireMort = async () => {
    let players = await get("personne");
    let roles = await get("game/roles");

    if (!players.map(player => player.id).includes(roles.maire.id)) {
        const randomIndex = Math.floor(Math.random() * players.length);
        await db.ref("game/roles/maire").update({
            id: players[randomIndex].id
        });
        await envoieMessage(`${players[randomIndex].pseudo} devient le nouveau Maire.`,"tous","information");
    }
}














const bulletinVote = async () => {

    let bulletinVote = players.filter(player => player.vote).map(player => player.vote);

    const voteCounts = bulletinVote.reduce((acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1;
        return acc;
    }, {});

    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVoted = Object.keys(voteCounts).filter(vote => voteCounts[vote] === maxVotes);
    
    if (mostVoted.length > 1) {
        console.log("before")
        await db.ref("game/roles/maire").update({
            "vote/tab": mostVoted
        });
        console.log("mid")
        await entPlan("Maire-Choix",setting.tempsRole);
        console.log("after")
    } else{
        await JoueurMort(mostVoted[0],"Vote");
    }
}

const bulletinElectionMaire = async () => {
    let players = await get("personne");

    const bulletinVote = players.filter(player => player.vote).map(player => player.vote);
    const voteCounts = bulletinVote.reduce((acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1;
        return acc;
    }, {});

    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVoted = Object.keys(voteCounts).filter(vote => voteCounts[vote] === maxVotes);

    let maire;
    if(mostVoted.length>0){
        maire = mostVoted[Math.floor(Math.random() * mostVoted.length)]
        await envoieMessage(`${await getPseudobyID(maire)} a été élu comme Maire.`,"tous","information");
    }else{
        maire = players[Math.floor(Math.random() * players.length)].id;
        await envoieMessage(`${await getPseudobyID(maire)} devient Maire temporairement.`,"tous","information");
    }
    await db.ref("game/roles/maire").update({
        id: maire,
        choix: true
    });
    await resetVotes();
}
















const JoueurMort = async (id, qui) => {
    const role = data.players[id].role;

    switch(parQui){
        case "Loup Garou":
            //un joueur peut pas être tuer par les loups si il est assassin
            if(role === "Assassin") return;
            //un joueur peut pas être tuer par les loups si il est sauver par la sorcière
            if(data.roles["Loup Garou"].attaque.id === data.roles["Sorcière"].soin.id) return;
            //un joueur peut pas être tuer par les loups si il est protèger par le garde
            if(data.roles["Garde"].id === id) return;

            await JoueurEliminer(id,qui);
        break;

        case "Sorcière":
            await JoueurEliminer(id,qui);
        break;

        case "Assassin":
            //un joueur peut pas être tuer par l'assasin si il est sauver par la sorcière car également visé par les loups
            if(data.roles["Sorcière"].soin.id) return;
            //un joueur peut pas être tuer par l'assasin si il protéger par le gardet
            if(data.roles["Garde"].id === id) return;

            await JoueurEliminer(id,qui);
        break;
        
        case "Chasseur":
        case "Pirate":
        case "Dictateur":
        case "Suicide":
            await JoueurEliminer(id,qui);
        break;
        
        case "Vote":
            if(role === "Pirate" && data.roles["Pirate"].otage.life){
                envoieMessage(`${await getUserPseudobyID(id)} est Pirate, il est épargné par ce vote.`,"tous","information")
                await JoueurMort(data.roles["Pirate"].otage.id,"Pirate");
                return;        
            }
            await JoueurEliminer(id,parQui);
        break;

        //cas ou nous sommes déja passer dans cette fonction

        case "Loup Garou Couple":
        case "Sorcière Couple":
        case "Assassin Couple":
        case "Chasseur Couple":
        case "Pirate Couple":
        case "Dictatuer Couple":
        case "Suicide Couple":
        case "Vote Couple":
        case "Vampire Couple":
            await JoueurEliminer(id,qui);
        break;

        
    }     
}


const JoueurEliminer = async (id,qui) => {
    
    const role = data.players[id].role;

    const text = {
        "Loup Garou": "est mort pendant la nuit, il était",
        "Sorcière": "est mort pendant la nuit, il était",
        "Assassin": "s'est fait poignarder, il était", 
        "Chasseur": "a reçu une balle, il était",
        "Vote": "a été victime du vote, il était",
        "Pirate": "est mort comme otage, il était",
        "Dictateur": "a été désigné, il était",
        "Suicide": "est mort sur le coup, il était",
        "Vampire": "a perdu beaucoup de sang, il était",
    }

    await envoieMessage(`${await getUserPseudobyID(id)} ${text[qui]} ${role}.`,"tous","important");
    
    
    //le mort était le maire
    

    //le mort était chasseur
    if (role === "Chasseur") {
        //ajouter le chasseur a la liste des chasseur pour qu'il tire
        let chasseur = data.roles["Chasseur"].mort.id.filter(chasseur => chasseur !== "");
        chasseur.push(id)

        await updateDoc(doc(collection(docRef,"roles" ),"Chasseur"), {
            "mort/id": chasseur
        });
    }

    //le mort était dictateur
    

    //le mort était otage du pirate
    if(data.roles["Pirate"].otage.id === id){
        await updateDoc(doc(collection(docRef,"roles" ),"Pirate"), {
            "otage/life": false
        });
    }
    
    //le mort était en couple
    if(data.roles["Cupidon"].couple.life){
        if(data.roles["Cupidon"].couple.id.includes(id)){
            //récuperer le amoureux restant en vie
            const amour = data.roles["Cupidon"].couple.id.filter(amour => amour !== id);
            await JoueurMort(amour,`${qui} Couple`);
            await updateDoc(doc(collection(docRef,"roles" ),"Cupidon"), {
                "couple/life": false
            });
        } 
    }

    //le mort était ange ou ange en couple
    if(role === "Ange" && server.nDay === 1){
        switch(qui){
            case "Vote":
                conditionDeVictoire("Ange");
            break;
            case "Vote Couple":
                conditionDeVictoire("Couple");
            break;
        }
    }

    //le mort était choisis par le corbeau
    
}































const conditionDeVictoire = async (forced) => {

    const groupe = {
        "Villageois": ["Villageois","Voyante","Garde","Chasseur","Sorcière","Cupidon","Pirate","Dictateur","Corbeau","Renard"],
        "LoupGarou": ["Loup Garou","Loup Garou Noir"],
        "Assassin": ["Assassin"],
        "Ange": ["Ange"],
        "Vampire":["Vampire"]
    }


    //TODO
    //récupérer le couple si en vie et parti de camp différent
    

    
    //récupérer si villageois en vie
    

    //récupérer si loupgarou en vie
    

    //récupérer si assassin en vie
    

    //récupérer si ange en vie

    //récupérer si vampire en vie
    

}







window.stop = async ()=>{
    await updateDoc(docRef,{
        started: false
    })
    window.location.href = "jouer.html";
}