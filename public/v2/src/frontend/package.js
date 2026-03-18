export const DEV = false

export const TEMPLATE = {
    "1": {
        "name": "Zomera",

        "themes": [
            "Pays & Ville", "Monument", "Région", "Montagne", "Plage", 
            "Fruit & Légume", "Boisson & Alcool", "Plat & Desert", "Série & Film", "Musique & Dance", 
            "Dessin Animé", "Réseaux Sociaux", "Jeu Vidéo", "Animal", "Métier", 
            "Chanteur(e)", "Acteur(e)", "Célébrité", "Vêtement", "Smartphone & Appareil",
            "Vacance", "Matière à l'école", "Travail", "Science", "Sexe", 
            "Politique", "Famille & Amis"],

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
                        <div class="fx-col ai-center wrap">
                            <input id="question" type="text" placeholder="Posez une question sur le thême..." autocomplete="off">
                        </div>
                    </div>
                </div>
                <div id="status"></div>  
                <div id="menu" class="fx-row jc-evenly gap-10 wrap">
                    <button id="quit">Quitter</button>
                    <button id="submit">Poser</button>
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
                    <div class="fx-row jc-evenly ai-center">
                        <div id="round"></div>
                        <div id="theme"></div>
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
                        <div> <em id="count"></em></div>
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
                <div class="fx-col w-300">
                    <ul id="correct" class="fx-col gap-40"></ul>
                </div>
            </div>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player3" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="wait2" class="fx-row jc-evenly">
                        <button id="next">Suivant</button>
                    </div>
                </div>
            </div>`,

        "result": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col w-400">
                    <div id="tab" class="fx-col gap-20"></div>
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
        "name": "Zoreka",

        "themes": [
            //ce qui se mange
            "Fruit", "Légume", 
            "Repas", "Plat du monde",
            "Viande", "Poisson",
            "Fromage", "Produit laitier",
            "Dessert", "Pâtisserie", "Yaourt", "Glace", 
            "Gâteau", "Biscuit","Bonbon", "Confiture", "Chocolat",
            "Sauce", "Épice", 

            //ce qui se boit
            "Boisson",  "Boisson chaude", 
            "Alcool", "Cocktail",

            //vegetal
            "Arbre", "Plante", "Fleur", "Couleur", "Parfum",
            "Animal", "Animal marin", "Animal volant", "Animal domestique", "Insecte", "Animal d'afrique", 
            "Couleur", "Parfum",

            //sport
            "Sport", "Sport extrème", "Sport collectif", "Sport individuel", "Sport avec balle", "Équipe sportive",
            "Sport olympique", "Sport de combat", "Club sportif", "Athlète célèbre",
            
            //technologie
            "Application mobile", "Application inutile",  "Réseau Social", "Site web",
            "Jeu de société", 
            "Console de jeu", "Jeux vidéos", "Jeux mobile",
            "Objet technologique", "Objet indispensable", "Objet connecté",

            //musique
            "Musique", "Musique de rap", "Musique année 80", "Musique de rock", "Musique pop", "Musique électro", "DJ célebre", "Musique classique",
            "Instrument de musique",  "Style musical", "Groupe de musique",

            "Danse", "Style de danse",

            //tv
            "Film", "Film humoriste", "Film de science fiction", "Film d'animation", "Film policier", "Film d'horreur", "Film culte", "Personnage de film",
            "Série TV", "Réplique de film",
            "Emission TV",

            //enfant
            "Livre", "Personnage", "Super-Héros", "Bande dessinée",
            "Dessin animé", "Héros de dessin animé", "Disney", "Jouet",

            //personne
            "Acteur", "Actrice",
            "Chanteur", "Chanteuse", "Groupe de musique", "Manequin",
            "Youtubeur", "Streamer", "Humoriste", "Magicien", "Présentateur TV", 
            "Ecrivain", "Footballeur","Peintre", "Photographe",
            "Miss France",

            //monde
            "Pays à visiter", "Ville à visiter", "Monument historique", "Capitale à visiter",
            "Parc d'attraction",

            //marque
            "Marque de vêtement", "Marque de voiture", "Marque de chaussure", "Marque de luxe",
            "Accessoire de mode", "Bijou",

            //autre
            "Voiture de rêve",
            
            "Matière à l'école",
            
            "Métier", "Métier de rêve", "Outil de bricolage"
            
        ],

        "home": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <div class="fx-row jc-evenly ai-center">
                    <div id="round"></div>
                    <div id="theme"></div>
                </div>
                <hr>
            </div>
            <ul id="player1" class="fx-col gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <div class="fx-row jc-center gap-20">
                        <div class="fx-col w-300 gap-20">
                            <input id="favorite" type="text" placeholder="Votre préférence..." autocomplete="off">
                        </div>
                    </div>
                    <div class="fx-row jc-center">
                        <select id="predict"></select>
                    </div>
                    <div id="status"></div>  
                    <div id="menu" class="fx-row jc-evenly gap-10 wrap">
                        <button id="quit">Quitter</button>
                        <button id="submit">Poser</button>
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

        "result": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div> <em id="count"></em></div>
                    <div id="code"></div>
                </div>
                <div class="fx-row jc-center ai-center">
                    <div id="round"></div>
                </div>
                <hr>
            </div>
            <div class="fx-row jc-center">
                <div class="fx-col w-300">
                    <ul id="result" class="fx-col gap-20"></ul>
                </div>
            </div>
            <ul id="result-score" class="fx-col gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <ul id="player3" class="fx-row jc-around wrap gap-20"></ul>
                    <div id="wait2" class="fx-row jc-evenly">
                        <button id="next">Suivant</button>
                    </div>
                </div>
            </div>`
        },

    "3": {
        "name": "Zoniba",

        "themes": [
            "Prénom", "Ville", "Pays", "Fruit Légume", "Animal", "Objet", "Vêtement", "Sport", "Métier",  "Marque", "Célébrité", "Série Film", "Livre Auteur", "Chanson", "Jeu Vidéo", "Partie du corps", "Nourriture", "Arbre Fleur", "Transport", "Monument", "Magasin", "Outil Instrument", "Informatique", "Animé", "Ecole", "Adjectif Verbe"
        ],

        "check": [true, true],

        "letters": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"],

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
            <ul id="player1" class="fx-col ai-center jc-evenly gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <div class="fx-col ai-center">
                        <div class="fx-row jc-evenly w-300">
                            <ul id="theme" class="gd-row gap-20"></ul>
                        </div>    
                    </div>        
                    <div id="status"></div>  
                    <div id="menu" class="fx-row jc-evenly wrap">
                        <button id="quit">Quitter</button>      
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
                    <div id="wait1" class="fx-row jc-center">
                        <button id="send">Envoyer</button>
                    </div>
                </div>
            </div>`,

        "correct": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div> <em id="count"></em></div>
                    <div id="code"></div>
                </div>
                <div class="fx-row jc-evenly ai-center">
                    <div id="round"></div>
                    <div id="letter"></div>
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
                    <div id="wait2" class="fx-row jc-evenly">
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
                <div class="fx-col w-400">
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
            </div>`
    },

    "4": {
        "name": "Zosida",

        "sentences": [

            //amour
"tomber amoureux de sa voisine",
"tomber amoureux après un eye contact de 2 secondes", 
"tomber amoureux de quelqu’un déjà en couple", 
"embrasser quelqu’un juste pour gagner un pari", 
"tomber amoureux du meilleur ami", 
"se mettre en couple avec sa meilleur ami",

            //drague
"sortir une disquette à une fille dans la rue",
"stalker un profil d'une fille", 
"se faire friendzoner direct", 
"essayer de pécho dans un mariage", 
"draguer deux personnes dans la même pièce",
"draguer quelqu’un déjà en couple", 
"draguer maladroitement le/la pote du crush.", 
"espérer croiser son crush par hasard", 

            //date
"parler de mariage au premier date", 
"se remettre en couple 3 jours après une rupture", 
"faire un date uniquement pour manger gratuit", 
"se tromper de prénom en plein date",
"parler de son ex au premier date",

            //soiree
"se teindre les cheveux en bleu", 
"s’incruster dans une soirée inconnue",
"oublier le thème d’une soirée costumée", 
"flirter avec le serveur pour avoir une réduction", 
"se faire virer d’un bar", 
"se filmer en soirée et regretter le lendemain",
"répondre merci toi aussi au serveur qui dit bon appétit", 

            //alcool
"dire je bois plus jamais tous les week-ends", 
"d'arrêt l'alcool cette année",
"finir bourré avec 2 verres", 
"dire 5 fois c’est ma dernière bière ", 
"proposer un after alors que tout le monde veut dormir",
"faire semblant d’être bourré", 

            //evenement
"faire un marathon sans entraînement",
"organiser une fête surprise",
"arriver en retard à son propre anniversaire", 
"partir en voyage à l'étranger sur un coup de tête sans valise",
"oublier le prénom d'un ami de très longue date en le présentant",
"se tromper de jour pour un entretien d'embauche important",
"adopter un animal de compagnie sans prévenir personne",
"rater son avion car il a confondu l'heure de l'embarquement",
"devenir une star des réseaux sociaux par pur accident",
"gagner au loto et perdre le ticket dans la foulée",
"se retrouver enfermé dehors en pyjama à 3h du matin",
"commander le plat le plus épicé de la carte et ne pas pouvoir le finir",
"monter une tente de camping entièrement à l'envers",
"passer une nuit blanche à regarder des documentaires sur les pingouins",
"acheter un objet totalement inutile lors d'une vente aux enchères",
"réussir un gâteau immangeable",
"faire un discours improvisé à un mariage d'inconnus",

            //sport
"porter un maillot de Paris dans les rues de Marseille",
"porter un maillot de Marseille dans les rues de Paris",
"se remettre a sport le mois prochain",
"acheter une tenue de sport complète juste pour une photo Instagram",
"s'inscrire à la salle de sport",
"se blesser en faisant un simple échauffement",
"simuler une crampe pour arrêter de courir",
"regarder un match de curling avec passion",
"pleurer devant une finale de Coupe du Monde",
"s'endormir devant un match de tennis",
"se perdre pendant un footing en forêt",
"tricher lors d'une partie de pétanque",
"manger un burger géant juste après une séance de sport intense",
"expliquer les règles d'un sport alors qu'il n'y comprend rien",
"se filmer en train de faire des pompes",
"finir dernier d'un marathon mais avec le plus grand sourire",
"insulter l'arbitre à travers son écran de télévision",
"inventer une excuse bidon pour sécher l'entraînement",


            //politique
"voter LFI aux prochaines élections",
"voter RN aux prochaines élections",
"voter Macron aux prochaines élections",
"confondre la droite et la gauche",
"lancer un débat politique",
"quitter un groupe WhatsApp après un débat politique", 
"quitter la pièce quand ça parle élections", 
"changer d’opinion après un débat télé", 

            //devenir
"devenir végétalien", 
"devenir végan",
"devenir végétarien",
"devenir coach sportif sans diplôme",
"devenir célèbre par accident",
"devenir candidat dans une émission de télé-réalité",
"devenir influenceur spécialisé dans les objets inutiles",
"devenir président d'un club de pétanque",

            //perdre
"se perdre dans sa propre ville",
"perdre son portefeuille",
"se perdre dans un centre commercial", 
"perdre son téléphone en l’ayant dans la main", 
"perdre ses clés",
"se perdre avec un gps",
 "perdre son téléphone en l’utilisant comme lampe", 
"chercher ses lunettes alors qu'elles sont sur son nez",

            //oublier
"oublier les clés à l’intérieur de sa voiture",
"oublier le prénom de sa belle mère",
"oublier où il a garé la voiture",
"oublier le prénom de quelqu’un",
"oublier son téléphone chez un amis", 

            //faire
"faire un discours improvisé",
"faire croire à tout le monde qu’il sait cuisiner", 
"finir un puzzle de 1000 pièces", 
"faire un karaoké devant 200 personnes",
"faire un discours dramatique en soirée", 
"faire un prank qui finit mal", 

            //croire
"faire croire que c’est l’autre le problème", 
"croire qu’on parle de lui dans chaque conversation",

            //improbable
"survivre à une semaine sans téléphone",
"s’inscrire à Koh-Lanta",
"cuisiner un plat gastronomique avec 3 ingrédients",
"adopter un lama sur un coup de tête",
"partir en road trip sans destination",
"s’inscrire à une téléréalité",
"adopter un singe",

            //conversation
"supprimer un message après l’avoir envoyé et paniquer", 
"envoyer un message ultra romantique et regretter", 
"répondre à une story avec un emoji amoureux mal placé", 
"envoyer un ? après 2 minutes sans réponse", 
"envoyer un message bourré plein de fautes", 
"envoyer un tu dors ? à 3h du matin", 
"envoyer un snap ambigu pour tester", 
"envoyer un message vocal sans rien dire",
"réécrire un message 10 fois avant d’envoyer",
"envoyer un 'salut, ça va ?' comme première approche", 
 "faire des captures des conversations",
 "regretter un message mais ne pas le supprimer", 
"envoyer une image au mauvais groupe",
 "mettre 3 heures à écrire un message de 2 lignes", 
 "répondre ok à un message de 10 lignes",
"envoyer un message bourré plein de fautes", 
"envoyer un vocal de 3 minutes pour se tromper de destinataire", 

            //malaise
"faire une blague au mauvais moment",
"faire une blague déplacée au pire moment",
"casser quelque chose chez quelqu’un.",
"faire un compliment maladroit",
"faire une photo et l’envoyer à la mauvaise personne",
"casser un objet chez quelqu’un",
"envoyer un nude au mauvais contact", 
"se prendre un vent monumental en public", 
"faire une blague pas drôle",
"rire à ses propres blague",
"se prendre un vent et ne pas réagir", 
"rire dans un moment super sérieux", 
"réécrire un texto 12 fois", 
"envoyer un cœur par erreur sur une story", 
"faire un compliment ultra maladroit", 
"saluer quelqu’un qui ne le saluait pas", 
"faire la bise alors que l’autre tend la main", 
"se tromper de prénom en présentant quelqu’un", 
"rigoler à un moment super sérieux", 
"entrer dans une mauvaise salle en pleine réunion", 
"ouvrir une porte alors que le toilette est occupé",
"se tromper de groupe WhatsApp", 
"s’asseoir à côté de la mauvaise personne", 

            //autre
"parler à un inconnu", 
"se faire un ami dans une file d’attente", 
"devenir influenceur du jour au lendemain", 
"se lancer dans le stand-up", 
"chanter dans la rue",
"s’endormir pendant un film d’action",
"finir une série en 24h", 
"être choisi comme chef d’équipe par hasard", 
"devenir expert d’un sujet en une semaine", 
"envoyer un message gênant au mauvais groupe", 
"dire j’arrive alors qu’il est encore sous la douche",
"envoyer un vocal de 2 minutes pour rien dire",    
"tomber en panne d’essence parce qu’il restait un peu",           
"mettre 3 filtres et dire c’est naturel", 
"raconter sa vie à un chauffeur Uber",       
"se prendre pour le psy du groupe après 2 shots",            
"croire qu’il peut battre tout le monde au bras de fer",         
"s’incruster dans une photo sans être invité",    
"mettre “vu” sans répondre pendant 3 jours",   
"danser comme s’il était seul",        
"inventer une excuse absurde pour annuler",      
"croire qu’un signe astrologique explique tout",      
"regarder le téléphone de son crush discrètement",
"mentir sur son salaire",  
"poster une story juste pour une personne", 
"dire je t’appelle et ne jamais appeler",
"raconter sa rupture à tout le monde", 
"mentir sur le nombre de partenaires", 
"liker exprès pour relancer la conversation", 
"faire semblant de dormir pour éviter une discussion",   
"poster une photo pour rendre jaloux", 
"s’attacher à quelqu’un qui ne répond jamais",     
"faire une jalousie", 
"regarder une story 2 secondes après sa publication",      
"désinstaller un jeu après une défaite",
"acheter un truc inutile", 
"dire “je suis discret(e)” en étant le plus bruyant", 
"mentir sur sa taille",
"s'énerver avec une panne de réseau",
"poster une photo juste pour une personne", 
"se comparer à l’ex sans raison", 
"faire semblant d’être occupé(e)", 
"changer d’avis 5 fois en 1 heure",      
"dire bonjour à 22h",   
"se tromper de conversation et répondre hors sujet",   
"se prendre une porte vitrée", 
"faire tomber un verre en plein silence", 
"se faire surprendre en train de stalker un profil", 
"hurler devant la télé comme si le joueur entendait",
"s’énerver pour une faute lors d'un match", 
        ],

        "home": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <ul id="player1" class="fx-col gap-20"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-20">
                    <div id="status"></div>  
                    <div id="menu" class="fx-row jc-evenly gap-10 wrap">
                        <button id="quit">Quitter</button>
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

        "result": `
            <div class="fx-col gap-10">
                <div class="fx-row jc-between ai-center">
                    <h3 id="name"></h3>
                    <div> <em id="count"></em></div>
                    <div id="code"></div>
                </div>
                <hr>
            </div>
            <ul id="result" class="fx-col gap-60"></ul>
            <div class="fx-col gap-20">
                <hr>
                <div class="fx-col gap-40">
                <div></div>
                    <div class="fx-row jc-evenly">
                        <button id="next">Terminer</button>
                    </div>
                </div>
            </div>`
    }
}