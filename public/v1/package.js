export const gameContent = {
    "1": {
        "name": "Zoreka",

        "module": "./game1.js",

        "theme": [
            "Pays & Ville", "Monument", "Région", "Montagne", "Plage", "Fruit & Légume", "Boisson & Alcool", "Plat & Desert", "Série & Film", "Musique & Dance", "Dessin Animé", "Réseaux Sociaux", "Jeu Vidéo", "Animal", "Métier", "Chanteur / Chanteuse", "Acteur / Actrice", "Célébrité", "Vêtement", "Smartphone & Appareil", "Vacance", "Matière à l'école", "Travail", "Science", "Sexe", "Politique", "Famille & Amis"],

        "home": `
            <div class="fx-col gap-10">
                <div class="fx-col gap-10">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div id="code"></div>
                    </div>
                    <div class="fx-row jc-evenly ai-center">
                        <div id="round"></div>
                        <div id="theme"></div>
                    </div>
                </div>
                <hr>
            </div>
            <ul id="player1" class="fx-col gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col ai-center gap-20">
                    <div class="fx-col gap-20 w-300">
                        <div class="fx-col gap-20">
                            <div class="fx-col ai-center wrap">
                                <input id="question" type="text" placeholder="Posez une question sur le thême..." autocomplete="off">
                            </div>
                        </div>
                        <div id="status"></div>  
                        <div id="menu" class="fx-row jc-around gap-10 wrap">
                            <button id="quit">Quitter</button>
                            <button id="submit">Poser</button>
                        </div>
                    </div>
                </div>
            </div>`,

        "form": `
            <div class="fx-col gap-20">
                <div class="fx-col gap-10">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div> <em id="count"></em></div>
                        <div id="code"></div>
                    </div>
                </div>
                <hr>
            </div>
            <ul id="form" class="fx-col jc-between ai-center gap-40"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player2" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="status"></div>
                    <div id="wait1" class="fx-row jc-center">
                        <button id="send">Envoyer</button>
                    </div>
                </div>
            </div>`,

        "correct":`      
            <div class="fx-col gap-10">
                <div class="fx-col gap-10">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div id="code"></div>
                    </div>
                    <div class="fx-row jc-evenly ai-center">
                        <div id="round"></div>
                        <div id="theme"></div>
                    </div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col w-250">
                    <ul id="result" class="fx-col gap-20"></ul>
                </div>
            </div>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player3" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="wait2" class="fx-row jc-evenly">
                        <button id="quit">Quitter</button>
                        <button id="next">Suivant</button>
                    </div>
                </div>
            </div>`,

        "score": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col form-w4">
                    <ul id="tab" class="fx-col gap-20"></ul>
                </div>
            </div>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <div class="fx-row jc-evenly">
                        <button id="finish">Terminer</button>
                    </div>
                </div>
            </div>`},

    "2": {
        "name": "Zomera",

        "module": "./game2.js",

        "theme": [
            "Pop", "Hip-Hop", "Rap", "R&B", "Rock", "Funk", "Disco", "Electro House", "Chanson Française", "Variété Française", "Année 80", "Année 90", "Année 2000", "Année 2010", "Année 2020", "Cette année"],

        "home": `
            <div class="fx-col gap-20">
                <div class="fx-col gap-20">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div id="code"></div>
                    </div>
                    <div class="fx-row jc-between ai-center">
                        <div></div>
                        <div id="round"></div>
                        <div id="theme"></div>
                        <div></div>
                    </div>
                </div>
                <hr>
            </div>
            <ul id="player1" class="fx-col gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-row jc-center gap-20">
                    <div class="fx-col w-300 gap-20">
                        <div class="fx-col gap-20">
                            <div class="fx-col ai-center wrap">
                                <input id="title" type="text" placeholder="Un titre de musique avec son chanteur..." autocomplete="off">
                            </div>
                            <div class="fx-row jc-center">
                                <select id="predict"></select>
                            </div>
                        </div>
                        <div id="status"></div>  
                        <div id="menu" class="fx-row jc-evenly gap-10 wrap">
                            <button id="quit">Quitter</button>
                            <button id="submit">Poser</button>
                        </div>
                    </div>
                </div>
            </div>`,

        "form": `
            <div class="fx-col gap-20">
                <div class="fx-col gap-10">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div><em id="count"></em></div>
                        <div id="code"></div>
                    </div>
                </div>
                <hr>
            </div>
            <ul id="form" class="fx-col jc-between ai-center gap-40"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player2" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="status"></div>
                    <div id="waitting1" class="fx-row jc-center">
                        <button id="send">Envoyer</button>
                    </div>
                </div>
            </div>`,

        "result": `
            <div class="fx-col gap-20">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col form-w4">
                    <ul id="result" class="fx-col gap-20"></ul>
                </div>
            </div>
            <ul id="result-score" class="fx-col gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player3" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="waitting2" class="fx-row jc-evenly">
                        <button id="quit">Quitter</button>
                        <button id="next">Suivant</button>
                    </div>
                </div>
            </div>`
        },

    "3": {
        "name": "Zoneba",

        "module": "./game3.js",

        "theme": [
            "Prénom", "Ville", "Pays", "Fruit Légume", "Animal", "Objet", "Vêtement", "Sport", "Métier",  "Marque", "Célébrité", "Film & Série", "Livre / Auteur", "Chanson", "Jeu Vidéo", "Partie du corps", "Nourriture", "Arbre / Fleur", "Transport", "Monument", "Magasin", "Outil / Instrument", "Informatique", "Animé", "Ecole", "Adjectif / Verbe"
        ],

        "check": [true, true, true, true, true, true, true, true, true, true],

        "letter": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"],

        "home": `
            <div class="fx-col gap-10">
                <div class="fx-col gap-20">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div id="code"></div>
                    </div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div id="msg" class="fx-col">
                    <div class="fx-col w-300">
                        <div class="fx-row jc-evenly">
                            <ul id="theme" class="fx-row gd-row jc-between gap-20 wrap"></ul>
                        </div>    
                    </div>
                </div>        
            </div>
            
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player1" class="fx-row jc-evenly gap-20 wrap"></ul>
                    <div id="status"></div>  
                    <div class="fx-row jc-center">
                        <div class="fx-col w-300">
                            <div id="menu" class="fx-row jc-evenly gap-20">
                                <button id="quit">Quitter</button>
                            </div>    
                        </div>        
                    </div>
                </div>
            </div>`,

        "form": `
            <div class="fx-col gap-10">
                <div class="fx-col gap-10">
                    <div class="fx-row jc-between ai-center">
                        <h3 id="name"></h3>
                        <div><em id="count"></em></div>
                        <div id="code"></div>
                    </div>
                    <div class="fx-row jc-evenly ai-center">
                        <div id="round"></div>
                        <div id="letter"></div>
                    </div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <ul id="form" class="fx-col jc-between gap-30"></ul>
            </div>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player2" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="status"></div>
                    <div id="waitting1" class="fx-row jc-center">
                        <button id="send">Envoyer</button>
                    </div>
                </div>
            </div>`,

        "correct": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col w-300">
                    <ul id="word" class="fx-col gap-40"></ul>
                </div>
            </div>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player3" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="waitting2" class="fx-row jc-evenly">
                        <button id="quit">Quitter</button>
                        <button id="next">Suivant</button>
                    </div>
                </div>
            </div>`,

        "score": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col form-w4">
                    <ul id="result" class="fx-col gap-20"></ul>
                </div>
            </div>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <div class="fx-row jc-evenly">
                        <button id="finish">Terminer</button>
                    </div>
                </div>
            </div>`}     
}