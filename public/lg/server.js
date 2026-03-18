let data;

db.ref("server").on("value", (snapshot) => {
    data = snapshot.val();
});


let updating = false;

const interval = setInterval(async () => {
    const local = await get("local");
    if(local.MJ && !updating){
        updating = true
        await gameCycleTimer();
        updating = false;
    }
        
}, 1000); // Change interval to 1 second (1000 ms)

const gameCycleTimer = async () => {
    try {
        if (data.timer > 1) {
            data.timer--;
        } else {
            data.nstep++;
            data.nstepInfini++;

            if (data.stepDay[data.nstep] === undefined) {
                await conditionDeVictoire("");
                await planRoleNuit();
                await resetRoles();
                await resetVotes();
            }
            data.timer = data.stepDay[data.nstep].time;
        }

        if(data.timer === data.stepDay[data.nstep].time - 1){ await StartOfPhase();}
        if(data.timer === 1){ await EndOfPhase();}

        await db.ref("game/program/").update({
            appel: data.stepDay[data.nstep].phase
        });
     
        await db.ref("/").update({
            server: data
        });

    } catch (error) {
        console.error("Error during interval execution:", error);
    }
}

const planRoleNuit = async () =>  {
    try {
        
        data.nstep = 0;
        data.nDay++;

        let players = await get("personne");
        let roles = await get("game/roles");
        let setting = await get("game/setting");

        //les roles se levant la nuit
        let roleNuit = ["Cupidon", "Voyante", "Garde", "Pirate", "Survivant", "Dictateur", "Corbeau", "Renard", "Assassin", "Vampire", "Loup Garou", "Loup Garou Noir", "Sorcière"];

        // Récupérer les rôles de la partie qui jouent la nuit
        let rolePrésent = roleNuit.filter(role => players.some(player => player.role === role));
        console.log(rolePrésent)
        const phase = ["Nuit", ...rolePrésent, "Jour", "Vote"];
        
        //ajouter les roles présent dans le stepDay
        data.stepDay = [];
        for (let i = 0; i < phase.length; i++) {
            let time = Number(setting.tempsRole);
            switch(phase[i]){
                case "":
                case "dépouillement":
                    time = 3;
                break;

                case "Nuit":
                case "Jour":
                    time = 5;
                break;

                case "Vote":
                    time = Number(setting.tempsVote);
                break;
            }

            const step = {phase: phase[i],time: time};
            data.stepDay[i] = step;
            // ici, vous pouvez ajouter une logique pour gérer chaque phase
        }
        
    

        //retirer les roles qui n'ont plus d'action
        if(roles.cupidon.choix){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Cupidon");
        }
        if(roles.sorcière.soin.choix && roles.sorcière.poison.choix){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Sorcière");
        }
        if(roles.loupgarounoir.choix){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Loup Garou Noir");
        }
        if(roles.survivant.nombre === 0){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Survivant");
        }
        if(roles.dictateur.choix){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Dictateur");
        }
        if(roles.pirate.choix){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Pirate");
        }
        if(data.nDay % 2 === 1){
            data.stepDay = data.stepDay.filter(item => item.phase !== "Vampire");
        }

    } catch (error) {
        console.error("Error during planRoleNuit:", error);
    }
}

const addElementPlan = async (element, timer) => {
    try {
        const step = {phase:element,time: Number(timer)}
        let newstep = [];
        for (let i = 0; i < data.stepDay.length; i++) {
            newstep.push(data.stepDay[i])
            if(i === data.nstep){
                newstep.push(step);
            }
        }
        
        await db.ref("server").update({
            stepDay: newstep,
            timer: data.timer
        });
        
    } catch (error) {
        console.error("Error during addElementPlan:", error);
    }
}

const replaceElementPlan = async (element,newelement,timer) => {
    try {
        console.log(timer)
        for (let i = 0; i < data.stepDay.length; i++) {
            
            if (data.stepDay[i].phase === element) {
                data.stepDay[i].phase = newelement;
                data.stepDay[i].time = Number(timer);
            }
            console.log(i,data.stepDay[i])
        }

        await db.ref("server").update({
            stepDay: data.stepDay,
            timer: data.timer
        });
        console.log(data.stepDay)
        
    } catch (error) {
        console.error("Error during replaceElementPlan:", error);
    }
}




const timeLeft = async () => {
    try {
            interface.innerHTML = "";
            db.ref("server").update({timer: 2});
        }
    catch (error) {
        console.error("Error during timeleft:", error);
    }
}

const resetRoles = async () => {
    try {
        await db.ref("game/roles/").update({
            "garde/protect/id": "",
            //"garde/last/id": "",
            "loupgarou/attaque/id": "",
            "loupgarou/attaque/allier": false,
            "loupgarou/choix": false,
            //"loupgarounoir/choix": false,
            "chasseur/mort/id": [""],
            "chasseur/cible/id":"",
            "sorcière/poison/id":"",
            "sorcière/soin/id":"",
            "maire/vote/tab": [""],
            "maire/vote/id": "",
            "maire/vote/choix": false,
            //"maire/id": "",
            //"maire/choix": false,
            //"cupidon/couple/id": ["",""],
            //"cupidon/couple/life": false,
            //"cupidon/choix": false,
            //"pirate/otage/id": "",
            //"pirate/otage/life": false,
            //"pirate/choix": false,
            //"dictateur/choix": false,
            //"dictateur/cible/choix": false,
            //"dictateur/cible/id":"",
            //"survivant/nombre": 2,
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
    } catch (error) {
        console.error("Error during resetRoles", error);
    }
};

const resetVotes = async () => {
    try {
        let players = await get("personne");
        for(let player of players){
            await db.ref("users/" + player.id).update({
                LG: "",
                vote: ""
            }); 
        }
    } catch (error) {
        console.error("Error during resetVotes", error);
    }
};

const StartOfPhase = async () => {//retard de 1 seconde du depart dutimer

let roles = await get("game/roles");
let players = await get("personne");

switch (data.stepDay[data.nstep].phase) {
    case "Nuit":
        await envoieMessage(`${data.stepDay[data.nstep].phase} ${data.nDay} :`,"tous","evenement");
        break;

    case "Jour"://les mort durant la nuit

        //tué la victime des Loup Garou
        if(roles.loupgarou.attaque.allier){
            await db.ref("users/" + roles.loupgarou.attaque.id).update({ 
                role: "Loup Garou"
            });
            await envoieMessage("Tu t'es transformé en Loup Garou",roles.loupgarou.attaque.id,"information");
            await envoieMessage("Une personne s'est transformé en Loup Garou.","tous","information");
        }else{
            await JoueurMort(roles.loupgarou.attaque.id,"Loup Garou");
        }

        //tué la personne viser par la Sorcière
        await JoueurMort(roles.sorcière.poison.id,"Sorcière");

        //tué la victime  viser par Assassin
        await JoueurMort(roles.assassin.attaque.id,"Assassin");

        //transforme la victime des vampires ou tué le vampire
        
        if(roles.vampire.mort.choix){
            //tué le vampire si mauvais choix
            await JoueurMort(roles.vampire.mort.id,"Vampire");
        }else if(roles.vampire.attaque.choix){
            //chercher si la victime des vampires n'est pas morte la nuit ou elle est choisit
            if(players.some(player => player.id === roles.vampire.attaque.id)){
                //transformé la victime en Vampire
                await db.ref("users/" + roles.vampire.attaque.id).update({ 
                    role: "Vampire"
                });
                await envoieMessage("Tu t'es transformé en Vampire",roles.vampire.attaque.id,"information");
                await envoieMessage("Une personne s'est transformé en Vampire.","tous","information");
            }
        }
        
    break;

    case "Maire-Election":
    case "Dictateur-Vote":
            await envoieMessage(`Jour ${data.nDay} :`,"tous","evenement");
    break;

    case "Vote":
        if(data.stepDay[data.nstep-1].phase !== "Maire-Election")
            await envoieMessage(`Jour ${data.nDay} :`,"tous","evenement");
        if(roles.corbeau.choix && roles.corbeau.cible.life){
            //vérifier que la victime du corbeau encore vivante
            await envoieMessage(`${await getPseudobyID(roles.corbeau.cible.id)} a reçu la visite du corbeau.`,"tous","information");
        }
    break;
}

}

const EndOfPhase = async () => {//arriver a 1 seconde du timer

    let roles = await get("game/roles");
    let players = await get("personne");

switch (data.stepDay[data.nstep].phase) {
    
    case "Maire-Election"://lancer le dépouillement de l'élection du maire
        await bulletinElectionMaire();
    break;
    
    case "Maire-Choix"://tuer par alea un joueur avec max de vote si pas choisie par la maire
        await gestionMaireChoix()
    break;
    
    case "Maire-Mort"://mettre un nouveau maire alea si pas choisit par l'ancien maire
        await gestionMaireMort();
    break;

    case "Chasseur"://retirer du tableau le nom du chasseur venant de tirer
        await gestionChasseur();
    break;
    
    
    case "Loup Garou"://configurer le vote des loups a l hunanimité
        await gestionLoupGarou();
    break;

    case "Vote"://lancer le dépouillement du vote jour
        await bulletinVote();
    break;

    case "Dictateur":
        await gestionDictateur();
    break;

    case "Dictateur-Vote":
        await gestionDictateurVote();
    break;
    
    case "Vampire"://configurer le vote des vampires par alea des votes enregistree
        await gestionVampire();
    break;

}

if(data.stepDay.length > data.nstep + 1){
    switch (data.stepDay[data.nstep+1].phase) {
        case "Vote":
            if(!roles.maire.choix && data.stepDay[data.nstep].phase !== "Maire-Election"){
                await addElementPlan("Maire-Election",30);
            }
            await conditionDeVictoire("");
        break;
    }
}


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



const gestionChasseur = async () => {
    let roles = await get("game/roles");

    let chasseur = roles.chasseur.mort.id.filter(chasseur => chasseur !== roles.chasseur.mort.id[0]);
    if(!chasseur[0]){
        chasseur = [""]
    }
    await db.ref("game/roles/chasseur").update({
        "mort/id": chasseur
    });

    await JoueurMort(roles.chasseur.cible.id,"Chasseur");
}








const gestionLoupGarou = async () => {
    let players = await get("personne");
    let roles = await get("game/roles");

    let voteLG = players.filter(player => player.LG).map(player => player.LG);
    await resetVotes();
    if(voteLG.length === 0) return;
    
    if(!voteLG.every(vote => vote === voteLG[0])){
        await db.ref("server").update({timer: 15});
        return;
    }
    let attaque = players.find(player => player.id === voteLG[0]);
    
    if(attaque){
        switch(attaque.role){
            case "Assassin":
                await envoieMessage(`Votre cible ${attaque.pseudo} est immunisée.`,"Loup Garou","information");
                await envoieMessage(`Votre cible ${attaque.pseudo} est immunisée.`,"Loup Garou Noir","information");
                await db.ref("game/roles/loupgarou").update({
                    "attaque/id": "",
                    "choix": false
                });
                return;
            default:
                await envoieMessage(`Votre cible est ${attaque.pseudo}.`,"Loup Garou","information");
                await envoieMessage(`Votre cible est ${attaque.pseudo}.`,"Loup Garou Noir","information");
                await db.ref("game/roles/loupgarou").update({
                    "attaque/id": attaque.id,
                    "choix":true
                });    
        }
    }
}









const gestionDictateur = async () => {
    let roles = await get("game/roles");
    let setting = await get("game/setting");

    

    if(roles.dictateur.cible.choix){
        await replaceElementPlan("Vote","Dictateur-Vote",setting.tempsRole);
    }
}

const gestionDictateurVote = async () => {
    let roles = await get("game/roles");
    let players = await get("personne");

    let cible = players.find(player => player.id = roles.dictateur.cible.id);
    let dictateur = players.find(player => player.role = "Dictateur");
    
    await JoueurMort(roles.dictateur.cible.id,"Dictateur")
   
    if(cible && dictateur){
       if(["Loup Garou","Loup Garou Noir","Assassin"].includes(cible.role)){
        await db.ref("game/roles/maire").update({ 
            id: dictateur.id
        });
        await envoieMessage(`${dictateur.pseudo} devient Maire après ce coup d'état.`,"tous","information")
        }else{
            await JoueurMort(dictateur.id,"Direct");
        } 
    }
    

}







const gestionVampire = async () => {
    let players = await get("personne");
    let roles = await get("game/roles");

    let voteVampire = players.filter(player => player.LG).map(player => player.LG);
    await resetVotes();
    if(voteVampire.length === 0) return;
    let vote = voteVampire[Math.floor(Math.random() * voteVampire.length)]
    
    let cible = players.find(player => player.id === vote);
    if(!cible) return;
    if(cible.role === "Chasseur"){
        let player = players.find(player => player.role === "Vampire")
        await db.ref("game/roles/vampire").update({
            "mort/id": player.id,
            "mort/choix": true
        });  
        return;
    }
    
    if(cible.id === roles.garde.protect.id) return;
    if(cible.role === "Assassin") return;
    if(cible.role === "Survivant" && roles.surviant.utilise) return;

    await db.ref("game/roles/vampire").update({
        "attaque/choix": true,
        "attaque/id": cible.id
    });
    await envoieMessage(`Votre cible est ${cible.pseudo}.`,"Vampire","information"); 
}















const bulletinVote = async () => {
    let players = await get("personne");
    let roles = await get("game/roles");
    let setting = await get("game/setting");

    let bulletinVote = players.filter(player => player.vote).map(player => player.vote);

    if(roles.corbeau.choix && roles.corbeau.cible.life){
        bulletinVote.push(roles.corbeau.cible.id);
        bulletinVote.push(roles.corbeau.cible.id);
    }

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
















const JoueurMort = async (id, parQui) => {
    let players = await get("personne");
    let roles = await get("game/roles");
    const playerdeath = players.find(player => player.id === id);
    if (!playerdeath) return;

    switch(parQui){
        case "Loup Garou":
            if(playerdeath.role === "Assassin") return;
            if(playerdeath.role === "Survivant" && roles.survivant.utilise) return;
            if(roles.loupgarou.attaque.id === roles.sorcière.soin.id) return;
            if(roles.garde.protect.id === playerdeath.id) return;
            await JoueurEliminer(playerdeath,parQui);
        break;

        case "Sorcière":
            await JoueurEliminer(playerdeath,parQui);
        break;

        case "Assassin":
            if(id === roles.sorcière.soin.id) return;
            if(playerdeath.role === "Survivant" && roles.survivant.utilise) return;
            if(roles.garde.protect.id === playerdeath.id) return; 
            await JoueurEliminer(playerdeath,parQui);
        break;
        
        case "Chasseur":
        case "Pirate":
        case "Dictateur":
        case "Suicide":
            await JoueurEliminer(playerdeath,parQui);
        break;
        
        case "Vote":
            if(playerdeath.role === "Pirate" && roles.pirate.otage.life){
                envoieMessage(`${playerdeath.pseudo} est Pirate, il est épargné par ce vote.`,"tous","information")
                await JoueurMort(roles.pirate.otage.id,"Pirate");
                return;        
            }
            await JoueurEliminer(playerdeath,parQui);
        break;

        case "Vampire":
            await JoueurEliminer(playerdeath,parQui);
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
            await JoueurEliminer(playerdeath,parQui);
        break;

        
    }     
}


const JoueurEliminer = async (playerdeath,parQui) => {
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

    let roles = await get("game/roles");
    let setting = await get("game/setting");

    if(!text[parQui]) text[parQui] = "s'est tué par amour, il était";

    await envoieMessage(`${playerdeath.pseudo} ${text[parQui]} ${playerdeath.role}.`,"tous","important");
    
    await db.ref("users/" + playerdeath.id).update({
        death: true
    });

    let players = await get("personne");
    
    //le mort était le maire
    if (playerdeath.id === roles.maire.id && players.length > 0)
        await addElementPlan("Maire-Mort",setting.tempsRole)

    //le mort était chasseur
    if (playerdeath.role === "Chasseur") {
        //ajouter le chasseur a la liste des chasseur qu'il tire
        let chasseur = roles.chasseur.id.filter(chasseur => chasseur !== "");
        chasseur.push(playerdeath.id)
        await db.ref("game/roles/chasseur").update({"mort/id": chasseur});
        await addElementPlan("Chasseur",setting.tempsRole);
    }

    //le mort était dictateur
    if(playerdeath.role === "Dictateur"){
        await replaceElementPlan("Dictateur-Vote","Vote",setting.tempsVote);
    }

    //le mort était otage du pirate
    if(roles.pirate.otage.id === playerdeath.id){
        await db.ref("game/roles/pirate").update({
            "otage/life": false
        });
    }
    
    //le mort était en couple
    if(roles.cupidon.couple.life){
        if(roles.cupidon.couple.id.includes(playerdeath.id)){
            const amour = roles.cupidon.couple.id.filter(amour => amour !== playerdeath.id);
            await JoueurMort(amour,`${parQui} Couple`);
            await db.ref("game/roles/cupidon").update({
                "couple/life": false
            });
        } 
    }

    //le mort était ange ou ange en couple
    if(playerdeath.role === "Ange" && data.nDay === 1){
        switch(parQui){
            case "Vote":
                conditionDeVictoire("Ange");
            break;
            case "Vote Couple":
                conditionDeVictoire("Couple");
            break;
        }
    }

    //le mort était choisis par le corbeau
    if(playerdeath.id === roles.corbeau.cible.id){
        db.ref("game/roles/corbeau").update({
            "cible/life": false
        })
    }
}















const envoieMessage = async (text,name,forme) => {
    try {
        let message = await get("game/message") || [];
        let msg = {
            "text": text,
            "destinataire": name,
            "forme": forme,
        }
        message.push(msg);
        if (message.length > 40) message.shift();
        await db.ref("game/").update({ message });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
    }
};















const conditionDeVictoire = async (forced) => {
    let players = await get("personne");
    let roles = await get("game/roles");

    const groupe = {
        "Villageois": ["Villageois","Voyante","Garde","Chasseur","Sorcière","Cupidon","Pirate","Dictateur","Corbeau","Renard"],
        "LoupGarou": ["Loup Garou","Loup Garou Noir"],
        "Assassin": ["Assassin"],
        "Ange": ["Ange"],
        "Vampire":["Vampire"]
    }

    //récupérer le couple si en vie et parti de camp différent
    let Couplelife = false;
    if(roles.cupidon.couple.life){
        const couple = players.filter(player => roles.cupidon.couple.id.includes(player.id));
    Couplelife = 
    !((groupe.Villageois.includes(couple[0].role) && groupe.Villageois.includes(couple[1].role)) ||
    (groupe.LoupGarou.includes(couple[0].role) && groupe.LoupGarou.includes(couple[1].role)));
    }

    
    //récupérer si villageois en vie
    const Villageoislife = players.some(player => groupe.Villageois.includes(player.role));

    //récupérer si loupgarou en vie
    const LoupGaroulife = players.some(player => groupe.LoupGarou.includes(player.role));

    //récupérer si assassin en vie
    const Assassinlife = players.some(player => groupe.Assassin.includes(player.role));

    //récupérer si ange en vie
    const Angelife = players.some(player => groupe.Ange.includes(player.role));

    //récupérer si vampire en vie
    const Vampirelife = players.some(player => groupe.Vampire.includes(player.role));

    let camp = await db.ref("game/program/camp").once("value");
    camp = camp.val();

    if(camp)return;

    if(!LoupGaroulife && !Assassinlife && !Couplelife && !Angelife && !Vampirelife)
        camp = "Villageois";

    if(!Villageoislife && !Assassinlife && !Couplelife  && !Angelife && !Vampirelife)
        camp = "Loup Garou";

    if(!Villageoislife && !LoupGaroulife && !Couplelife  && !Angelife && !Vampirelife)
        camp = "Assassin";

    if(!Villageoislife && !LoupGaroulife && !Assassinlife  && !Angelife && !Vampirelife)
        camp = "Couple";

    if(!Villageoislife && !LoupGaroulife && !Couplelife && !Assassinlife  && !Angelife)
        camp = "Vampire";

    if(!Villageoislife && !LoupGaroulife && !Assassinlife && !Couplelife && !Angelife && !Vampirelife)
        camp = "Egalité";

    switch(forced){
        case "Ange":
        case "Couple":
            camp = forced;
    }

    await db.ref("game/program").update({
        camp
    });
}