//appel utilisant une liste

const btnVoyante = async () =>  {
    const option = document.getElementById("list-joueur").value;
    let players = await get("personne");
    players = players.find(player => player.id === option);
    if (!players) return;

    let local = await get("local");
    //let roles = await get("game/roles");

    if (option === local.id) {
        alert("Choisir une autre personne.");
        return;
    }

    await envoieMessage(`${players.pseudo} est ${players.role}.`,local.id,"information");
    await timeLeft();
}

const btnGarde = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if (!option) return;

    let local = await get("local");
    let roles = await get("game/roles");

    if (option === roles.garde.last.id) {
        alert("Cette personne ne peut pas être protégée une seconde fois.");
        return;
    }
        
    await db.ref("game/roles/garde").update({
        "protect/id": option,
        "last/id": option
    });
    if(local.id === option)
        await envoieMessage(`Tu sera protégé cette nuit.`,local.id,"information");
    else
       await envoieMessage(`Tu as protégé ${await getPseudobyID(option)} cette nuit.`,local.id,"information"); 
    await timeLeft();
}

const btnChasseur = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    let local = await get("local");
    //let roles = await get("game/roles");

    await envoieMessage(`${await getPseudobyID(option)} as reçu ta balle.`,local.id,"information");
    await db.ref("game/roles/chasseur/cible").update({
        id: option,
    });
   
    await timeLeft();
}

const btnPirate = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option);

    let local = await get("local");
    //let roles = await get("game/roles");

    if(local.id === option){
        alert("Tu ne peut pas te prendre en otage.");
        return;
    }

    await db.ref("game/roles/pirate").update({ 
        "otage/id": option,
        choix: true,
        "otage/life": true
    });

    await envoieMessage(`Tu as pris en otage ${await getPseudobyID(option)}.`, local.id,"information");
    await envoieMessage(`Tu est devenu otage.`, option,"information");
    await timeLeft();
}


const btnAssassin = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    let local = await get("local");
    //let roles = await get("game/roles");

    if(local.id === option){
        alert("Tu ne peut pas te poignarder toi-même.");
        return;
    }

    await db.ref("game/roles/assassin").update({ "attaque/id": option });

    await envoieMessage(`Tu as poignarder ${await getPseudobyID(option)}.`,local.id,"information");
    await timeLeft();
}

const btnCorbeau = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    let local = await get("local");
    //let roles = await get("game/roles");

    if(local.id === option){
        alert("Tu ne peut pas te choisir.");
        return;
    }
    await db.ref("game/roles/corbeau").update({ "cible/id": option,choix: true, "cible/life": true});

    await envoieMessage(`${await getPseudobyID(option)} recevra deux votes de ta part.`,local.id,"information");
    await timeLeft();
}






const btnMaireMort = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    //let local = await get("local");
    //let roles = await get("game/roles");

    await db.ref("game/roles/maire").update({ id: option });

    await envoieMessage(`${await getPseudobyID(option)} devient le nouveau Maire.`,"tous","information");
    await timeLeft();
}

const btnMaireChoix = async () =>  {
    const option = document.getElementById("list-maire").value;
    if(!option) return;

    //let local = await get("local");
    //let roles = await get("game/roles");

    await db.ref("game/roles/maire/vote").update({ 
        id: option,
        choix: true
    });

    await timeLeft();
}

//appel utilisant 2 listes

const btnCupidon = async () =>  {
    let option = [document.getElementById("list-joueur1").value,document.getElementById("list-joueur2").value];
    let players = await get("personne");
    players = players.filter(player => option.includes(player.id));

    if(players.length !== 2 || option[0] === option[1]){
        alert("Choisir deux personnes différentes.");
        return;
    }
    
    let local = await get("local");
    //let roles = await get("game/roles");

    await db.ref("game/roles/cupidon").update({ 
        "couple/id": [option[0],option[1]],
        choix: true,
        "couple/life": true
    });

    await envoieMessage(`Tu est en couple avec ${players[0].pseudo}, il est ${players[0].role}.`, option[1],"information");
    await envoieMessage(`Tu est en couple avec ${players[1].pseudo}, il est ${players[1].role}.`, option[0],"information");
    await envoieMessage(`${players[0].pseudo} et ${players[1].pseudo} seront en couple.`, local.id,"information");
    await timeLeft();
}

const btnRenard = async () =>  {
    const option = [document.getElementById("list-joueur1").value,document.getElementById("list-joueur2").value];
    let players = await get("personne");
    players = players.filter(player => option.includes(player.pseudo));

    if(players.length !== 2 || option[0] === option[1]){
        alert("Choisir deux personnes différentes.");
        return;
    }
    
    let local = await get("local");
    //let roles = await get("game/roles");

    const méchant = ["Loup Garou","Loup Garou Noir","Assassin"];

    if(méchant.includes(players[0].role) || méchant.includes(players[1].role)){
        await envoieMessage("Tu as trouvé au moins un méchant",local.id,"information")
    }else{
        await envoieMessage("Tu n'as pas renifler de méchant.",local.id,"information");
    }
    await timeLeft();
}

//appel utilisant la liste du bas

const btnLoupGarou = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    let players = await get("personne");

    let local = await get("local");
    //let roles = await get("game/roles");

    await db.ref("users/" + local.id).update({ LG: option });

    //compter le nombre de loup garou
    if(players.filter(players => ["Loup Garou","Loup Garou Noir"].includes(players.role)).length === 1){
        await timeLeft();
    }
}

const btnVoter = async () =>  {
    const option = document.getElementById("list-joueur").value;

    let local = await get("local");
    //let roles = await get("game/roles");
   
    if(option){
        await db.ref("users/" + local.id).update({ vote: option });
    }else{
        await db.ref("users/" + local.id).update({ vote: "" });
    }
}




const btnSorcièreSoin = async () =>  {
    let local = await get("local");
    let roles = await get("game/roles");
    
    if(roles.sorcière.soin.choix){
        alert("Tu as déja utilisé ta potion de soin");
        return;
    }

    if(!roles.loupgarou.choix){
        alert("Aucune attaque effectuée par les loups.");
        return;
    }

    await db.ref("game/roles/sorcière/soin").update({ 
        choix: true,
        id: roles.loupgarou.attaque.id
    });

    await envoieMessage(`${await getPseudobyID(roles.loupgarou.attaque.id)} a été sauver.`,local.id,"information");
    
    await timeLeft();
}

const btnSorcièrePoison = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    let local = await get("local");
    let roles = await get("game/roles");

    if(roles.sorcière.poison.choix){
        alert("Tu as déja utilisé ta potion de poison.");
        return;
    }

    if(option === roles.loupgarou.attaque.id){
        alert("Cette personne est déja visée par les loups.");
        return;
    }

    if(option === local.id){
        alert("Tu ne peux pas t'empoisonner.");
        return;
    }
    
    await db.ref("game/roles/sorcière/poison").update({ 
        choix: true,
        id: option
    });

    await envoieMessage(`${await getPseudobyID(option)} recevra une potion de poison.`,local.id,"information");
    await timeLeft();
}



const btnDictateur = async () =>  {
    await db.ref("game/roles/dictateur").update({ 
        "choix": true,
        "cible/choix":true
    });
    //mettre le replace en 
    await timeLeft();
}

const btnDictateurVote = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return

    let local = await get("local");

    if(local.id === option){
        alert("Tu ne peux pas te désigner toi-même.");
        return;
    }
    
    await db.ref("game/roles/dictateur").update({ 
        "cible/id": option
    });
    
    await timeLeft();
}













const btnLoupGarouNoir = async () =>  {
    let roles = await get("game/roles");
    
    await db.ref("game/roles/loupgarounoir").update({ 
        "choix": true,
    });
    await db.ref("game/roles/loupgarou").update({ 
        "attaque/allier": true,
    });

    await envoieMessage(`${await getPseudobyID(roles.loupgarou.id)} fait partie des Loups Garous.`,"Loup Garou","information");
    await envoieMessage(`${await getPseudobyID(roles.loupgarou.id)} fait partie des Loups Garous.`,"Loup Garou Noir","information");
    await timeLeft();
}






const btnSurvivant = async () =>  {
    let roles = await get("game/roles");
    if(roles.survivant.nombre > 0){
        await db.ref("game/roles/survivant").update({ 
            utilise: true,
            nombre: roles.survivant.nombre - 1
        });
        await timeLeft();
    }
}



const btnVampire = async () =>  {
    const option = document.getElementById("list-joueur").value;
    if(!option) return;

    let local = await get("local");
    let players = await get("personne");

    if(local.id === option){
        alert("Tu ne peut pas te choisir.");
        return;
    }
    let vampire = players.filter(player => player.role === "Vampire").map(player => player.id);
    if(vampire.includes(option)){
        alert("Tu ne peut pas choisir un vampire.");
        return;
    }
    await db.ref("users/" + local.id).update({ LG: option });
    if(vampire.length === 1){
        await timeLeft();
    }
}























































const updateUser = async () => {

    const local = await get("local");
    const players = await get("personne");

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

    document.querySelector(".role-name").textContent = local.role;
    document.querySelector(".image-role").classList.add(local.role.replace(/\s+/g, '-'));
    document.querySelector(".role-description-camp").textContent = "camp : " + camp[local.role]
    document.querySelector(".role-description-text").textContent = text[local.role]

    //affichage des votant

    const vote = document.getElementById("nb-vote");
    if(vote){
        vote.textContent = `( ${players.filter(player => player.vote).length} / ${players.length} )`;
    }
    

    //affichage des votes

    const listVote = document.getElementById("list-vote");
    if(listVote){
        listVote.innerHTML = "";
        for (let player of players.filter(player => player.vote)) {
            const targetPseudo = await getPseudobyID(player.vote);
            listVote.innerHTML += `<li>${player.pseudo} vote pour ${targetPseudo}</li>`;
        }
    }
    

    const listLG = document.getElementById("loupgarou-attaque");
    if(listLG){
        listLG.innerHTML = "";
        for (let player of players.filter(player => player.LG)) {
            const pseudo = await getPseudobyID(player.LG);
            listLG.innerHTML += `<li>${player.pseudo} veut dévorer ${pseudo}</li>`;
        }
    }
    
    //affichage des vampires et leur attaque

    const listVampire = document.getElementById("vampire-attaque");
    if(listVampire){
        listVampire.innerHTML = "";
        for (let player of players.filter(player => player.LG)) {
            const pseudo = await getPseudobyID(player.LG);
            listVampire.innerHTML += `<li>${player.pseudo} veut croquer ${pseudo}</li>`;
        }   
    }
    
}


db.ref("users").on("value", () => {
    updateUser();
});























//affichage du journal de messages

const message = async (messages) => {
    const listmessage = document.querySelector(".list-message");
    listmessage.innerHTML = "";
    const local = await get("local")
    if(messages){
       for(let message of messages){
            switch(message.destinataire){
                case "tous":
                case local.id:
                case local.role:
                    const li = document.createElement('li');
                    li.textContent = message.text;
                    li.classList = message.forme;
                    listmessage.appendChild(li);
            }
        } 
    }
}

db.ref("game/message").on("value", (snapshot) => {
    message(snapshot.val());
});
   




































































































































db.ref("server/nstepInfini").on("value", () => { updateUI(); });

const gameStop = async () =>{
    let local = await get("local");

    if(local.admin){
       db.ref("game").update({ started: false }); 
    }
}




db.ref("game/started").on("value", (snapshot) => {
    const started = snapshot.val();
    if (!started) {
        window.location.href = "jouer.html";
    }
})
 






db.ref("server/timer").on("value", (snapshot) => {
    let timer = snapshot.val();
    document.querySelector(".timer").textContent = timer + " seconde" + (timer > 1 ? "s" : "");
});
