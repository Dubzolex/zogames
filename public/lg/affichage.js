const interface = document.getElementById("interface");



const action = async (step) => {
    let roles = await get("game/roles");
    let players = await get("personne");
    

    let options = players.map(player => {
        return {
            id: player.id,
            pseudo: player.pseudo
        };
    });
    options.unshift({ id: "", pseudo: "Sélectionner" });
    let optionList = options.map(option => `<option value="${option.id}">${option.pseudo}</option>`).join('');

    let optionMaire = options.filter(player => roles.maire.vote.tab.includes(player.id) || player.id === "").map(option => `<option value="${option.id}">${option.pseudo}</option>`).join('')

    const  affichage = {
        Voyante: [`
            <h3>Voyante</h3>
            <p>Choisis une personne dont tu veux connaitre son identité.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnVoyante()">Regarder</button>`,``
        ],

        Garde: [`
            <h3>Garde</h3>
            <p>Choisis une personne à protèger.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnGarde()">Protéger</button>`,``
        ],

        "Loup Garou": [`
            <h3>Loups Garous</h3>
            <p>${players
                .filter(player => ["Loup Garou","Loup Garou Noir"].includes(player.role))
                .map(player => player.pseudo).join(' / ')}</p>
            <p>Choisis une cible à dévorer.</p>`,`
            <ul id="loupgarou-attaque" class="flex-column-between gap-item"></ul>`,`
            <select id="list-joueur">${optionList}</select>
            <button onclick="btnLoupGarou()">Dévorer</button>`
        ],

        Sorcière: [`
            <h3>Sorcière</h3>
            <p>Veux-tu sauver la victime des loups ou empoisonner une personne.</p>`,`
            <select><option>${await getPseudobyID(roles.loupgarou.attaque.id)}</option></select>
            <button onclick="btnSorcièreSoin()">Soin</button>`,`
            <select id="list-joueur">${optionList}</select>
            <button onclick="btnSorcièrePoison()">Poison</button>`,`
            <button onclick="timeLeft()">Ne rien faire</button>`
        ],
                
        Chasseur: [`
            <h3>Chasseur</h3>
            <p>Choisis une personne qui va recevoir ta dernière balle.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`  
            <button onclick="btnChasseur()">Tirer</button>`,``
        ],
           
        Cupidon: [`
            <h3>Cupidon</h3>
            <p>Choisis deux personnes à mettre en couple.</p>`,`
            <select id="list-joueur1">${optionList}</select>`,`
            <select id="list-joueur2">${optionList}</select>`,`
            <button onclick="btnCupidon()">Amour</button>`
        ],
               
        Vote: [`
            <h3>Vote de la journée</h3>
            <h4 id="nb-vote"></h4>
            <p>Vote pour la personne la plus suspecte.</p>`,`
            <ul id="list-vote" class="flex-column-between gap-item"></ul>`,` 
            <select id="list-joueur">${optionList}</select>
            <button onclick="btnVoter()">Voter</button>`
        ],
   
        "Maire-Election": [`
            <h3>Election du Maire</h3>
            <h4 id="nb-vote"></h4>
            <p>Désigne une personne à élire comme Maire.</p>`,`
            <ul id="list-vote" class="flex-column-between gap-item"></ul>`,` 
            <select id="list-joueur">${optionList}</select>
            <button onclick="btnVoter()">Voter</button>`
        ],
        
        "Maire-Choix": [`
            <h3>Maire</h3>
            <p>Choisis une personne pour départager cette égalité.</p>`,``,`
            <select id="list-maire">${optionMaire}</select>`,`
            <button onclick="btnMaireChoix()">Valider</button>`,``
        ],

        "Maire-Mort": [`
            <h3>Maire</h3>
            <p>Nomme un nouveau Maire.</p>`,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnMaireMort()">Donner</button>`
        ],
     
        "Loup Garou Noir": [`
            <h3>Loup Garou Noir</h3>
            <p>Veux-tu r'allier cette personne à ton camp ?</p>`,``,`
            <select></select>`,`
            <button onclick="timeLeft()">Ne rien faire</button>       
            <button onclick="btnLoupGarouNoir()">S'allier</button>`,``
        ],
        
        Assassin: [`
            <h3>Assassin</h3>
            <p>Choisis une cible à éliminer.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnAssassin()">Poignarder</button>`,``
        ],

        Survivant: [`
            <h3>Survivant</h3>
            <p>Veux-tu te protèger cette nuit ?</p>`,``,`
            <button onclick="timeLeft()">Ne rien faire</button>
            <button onclick="btnSurvivant()">Se protèger</button>`,``
        ],
        
        Dictateur: [`
            <h3>Dictateur</h3>
            <p>Veux-tu faire un coup d'état ?</p>`,``,`
            <button onclick="timeLeft()">Ne rien faire</button>
            <button onclick="btnDictateur()">Coup d'état</button>`,``
        ],              

        "Dictateur-Vote": [`
            <h3>Dictateur</h3>
            <p>Choisis une personne à éliminer.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnDictateurVote()">Exécuter</button>`,``
        ],

        Pirate: [`
            <h3>Pirate</h3>       
            <p>Choisis une personne à prendre en otage.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnPirate()">Désigner</button>`,``   
        ],             

        Corbeau: [`
            <h3>Corbeau</h3>
            <p>Choisis une personne qui aura 2 votes contre elle au prochain vote.</p>`,``,`
            <select id="list-joueur">${optionList}</select>`,`
            <button onclick="btnCorbeau()">Désigner</button>`,``
        ],

        Renard: [`
            <h3>Renard</h3>
            <p>Choisis deux personnes à renifler.</p>`,`
            <select id="list-joueur1">${optionList}</select>`,`
            <select id="list-joueur2">${optionList}</select>`,`
            <button onclick="btnRenard()">Renifler</button>`
        ],

        Vampire: [`
            <h3>Vampire</h3>         
            <p>${players.filter(player => player.role === "Vampire").map(player => player.pseudo).join(' / ')}</p>
            <p>Choisis une personne a croquer.</p>`,`
            <ul id="vampire-attaque" class="flex-column-between gap-item"></ul>`,`
            <select id="list-joueur">${optionList}</select>
            <button onclick="btnVampire()">Croquer</button>`  
        ],
    }

    

    if(!affichage[step])return;

    let element = "";

    for (let i = 0; i < affichage[step].length; i++) {
        const div = document.createElement("div");
        div.innerHTML = affichage[step][i];

        if (i === 0) {
            div.classList.add("flex-column-between", "flex-center", "gap-item"); // item 1
        } else {
            div.classList.add("flex-row", "gap-element"); // item > 1
        }
        element += div.outerHTML;
    }

    interface.innerHTML = `
    <div class="flex-column-between flex-center flex-1 gap-element">
        ${element}
    </div>`;

}



const condition = async (partie,qui) => {
    let elementPartie = {
        Win: `<h2 style="font-weight: bold;color: green">Victoire !</h2>`,
        Lose: `<h2 style="font-weight: bold;color: red">Défaite !</h2>`,
        Egalité: `<h2 style="font-weight: bold;color:darkviolet">Égalité !</h2>`
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
    
    interface.innerHTML = `
    <div class="flex-column-center flex-center flex-1 gap-element">
        ${elementPartie[partie]}
        ${elementQui[qui]}
    </div>`;
}




const phrase = async (appel) => {
    let roles = await get("game/roles");
    let local = await get("local");

    const chasseur = await getPseudobyID(roles.chasseur.mort.id[0]);
    const maire = await getPseudobyID(roles.maire.id);

    if(roles.maire.choix){
        const name = await getPseudobyID(roles.maire.id);
        document.querySelector(".maire-name").textContent = `Maire : ${name}`
        display(".maire-name",1);    
    }

    let text = {
        "Attente": `Distribution des <b>roles</b>, regardez votre carte pour connaitre votre identité...`,
        "Nuit": `La <b>Nuit</b> tombe sur le village...`,
        "Jour": `Le <b>Jour</b> se lève sur le village...`,
        "Voyante": `La <b>Voyante</b> utilise sa boule de cristal...`,
        "Garde": `Le <b>Garde</b> confectionne un bouclier...`,
        "Loup Garou": `Les <b>Loups Garous</b> cherchent leur proie...`,
        "Sorcière": `La <b>Sorcière</b> est en train de concocter une potion...`,
        "Chasseur": `Le <b> Chasseur ${chasseur} </b> décide qui il va emporter avec lui...`,
        "Cupidon": `Le <b>Cupidon</b> désigne deux âmes à unir...`,
        "Vote": `La phase des <b>Votes</b> a commencé...`,
        "Maire-Election": `L'<b>Election du Maire</b> est en cours...`,
        "Maire-Choix": `Egalité, Le <b>Maire ${maire}</b> départage les votes...`,
        "Maire-Mort": `<b>${maire}</b> choisie le nouveau Maire...`,
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
    
    interface.innerHTML = `
    <div class="flex-column-center flex-center flex-1 gap-element">
        <p>${text[appel] || ""}</p>
        ${local.death ? `<i class="fa-solid fa-skull-crossbones"></i>` : ""}
    </div>`;
}



const updateUI = async () => {
    
    let local = await get("local");
    let roles = await get("game/roles");
    let players = await get("personne");
    let appel = await get("game/program/appel");
    let camp = await get("game/program/camp");
    
        let roleForced = [
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
            "Maire-Election",
            "Maire-Choix",
            "Maire-Mort"
        ];

    


    switch(appel){
        case "Nuit":case "Voyante":case "Garde": case "Sorcière":case "Cupidon": 
        case "Pirate": case "Dictateur": case "Corbeau":case "Renard":case "Survivant":
        case "Assassin":case "Loup Garou":case "Loup Garou Noir":
            document.querySelector(".fondjour").classList.add("nuit");
            break;
    
        case "Jour":case "Chasseur":case "Maire-Election":case "Maire-Choix":case "Maire-Mort":
        case "Vote":case "Dictateur-Vote":
            document.querySelector(".fondjour").classList.remove("nuit");
            break;
    }
    
    switch(camp){//condition de victoire
          
        case "Villageois":
            switch(local.role){
                case "Villageois":
                case "Voyante":
                case "Garde": 
                case "Sorcière":
                case "Chasseur": 
                case "Cupidon": 
                case "Pirate": 
                case "Dictateur": 
                case "Corbeau":
                case "Renard":
                    condition("Win",camp);
                    return;
    
                default:
                    condition("Lose",camp);
            };
            return;
               
        case "Loup Garou":
            switch(local.role){
                case "Loup Garou":
                case "Loup Garou Noir":
                    condition("Win",camp);
                    return;
    
                default: condition("Lose",camp); 
            };
            return;
        
        case "Egalité": condition(camp,camp); return;
        
        case "Ange":
            switch(local.role){
                case "Ange": condition("Win",camp); return;
                default: condition("Lose",camp); 
            };
            return;
        
        case "Assassin":
            switch(local.role){ case "Assassin": condition("Win",camp); return;
                default: condition("Lose",camp); 
            };
            return;
        
        case "Couple":
            switch(local.id){
                case roles.cupidon.couple.id[0]:
                case roles.cupidon.couple.id[1]:
                    condition("Win",camp);
                    return;
    
                default:
                    condition("Lose",camp); 
            };
            return;

        case "Vampire":
            switch(local.role){
                case "Vampire":
                    condition("Win",camp);
                    return;
    
                default:
                    condition("Lose",camp); 
            };
            return;
    }
    
    switch(appel){//priorité au evenement d'interruption
        case "Chasseur":
            if(roles.chasseur.mort.id[0] && local.id === roles.chasseur.mort.id[0]){
                await action(appel);
                return;
            }
        break;
        case "Maire-Mort":
            if(local.id === roles.maire.id){
                await action(appel);
                return;
            }
        break;
    }
    await phrase(appel);

    if(local.death)return;
    
    switch(`${appel} ${local.role}`){
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
            await action(appel);
            return;
    }
    
    if(!local.death){
        switch(appel){
            case "Vote":
                await action(appel);
                if(roles.corbeau.choix){
                    //display(".corbeau-vote",1);
                }
                return;
            
            case "Maire-Election":
                await action(appel);
                return;
            
            case "Maire-Choix":
                if(roles.maire.id === local.id){
                    await action(appel);
                    return;
                }
            break;
        }
    }
}
    
    
    
    
    
    