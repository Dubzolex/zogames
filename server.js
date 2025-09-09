import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import path from "path";
import { readFileSync } from "fs";
import http from "http";
import fetch from "node-fetch";
import { Server } from "socket.io";

const WEB_PROD = "https://zogames.web.app";
const WEB_DEV = "http://localhost:5500";
const WEB_LINK = WEB_PROD;



// ==== Config Express/CORS ====
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: WEB_LINK,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// === Config Socket.io ===
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: WEB_LINK,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ==== Firebase Admin ====
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ==== API KEY ====
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyAxzMqlfPiXqH65fN4A_ZQ8g4yAhNZK6NA"; // sécurise en .env

// ==== Routes API ====
app.get("/", (req, res) => {
  res.send("Backend is running!");
});


// ---------- Authentication ----------


// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body || {};

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: "Email invalide !" });
  }
  if ((password || "").length < 8) {
    return res.status(400)
      .json({ success: false, message: "Mot de passe trop court !" });
  }

  let user;
  try{
    // Crée l'utilisateur Firebase
    user = await admin.auth().createUser({ email, password });
  } catch(error){
    console.error("Erreur FirebaseAuth:", error);

    // Formater l'erreur pour le frontend
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé."});
    }
    return res.status(500).json({ success: false, message: "Erreur serveur Firebase", details: error.message });
  }

  // Ajoute l'utilisateur dans Firestore
  try {
    await db.collection("users").doc(user.uid).set({
      email,
      pseudo: email.split("@")[0],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur Firestore:", error);
    return res.status(500).json({ success: false, message: "Erreur Firestore !" });
  }

  // Récupère un ID Token via REST API
  let idToken;
  try {
    idToken = await getIdTokenFromEmailPassword(email, password);
  } catch (error) {
    console.error("Erreur récupération token:", error);
    return res.status(500).json({ success: false, message: "Impossible de récupérer le token." });
  }
  // Réponse finale
  return res.status(201).json({ success: true, message: "Votre compte est créé !",
    token: idToken });
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const idToken = await getIdTokenFromEmailPassword(email, password);

    return res.status(200).json({
      success: true,
      message: "Connecté avec succès !",
      token: idToken, // Le client le garde pour chaque requête suivante
    });
  } catch (e) {
    console.error(e);

    // Gestion plus propre des erreurs
    return res.status(401).json({
      success: false,
      message: "Identifiants ou mot de passe invalides !",
      details: e.message
    });
  }
});

//Gestion du idToken
const getIdTokenFromEmailPassword = async (email, password) => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.idToken;
}

// Changer son pseudo
app.post("/pseudo", async (req, res) => {
  try {
    const { pseudo, token } = req.body;

    if (!pseudo) {
      return res.status(400).json({ success: false, message: "Pseudo manquant !" });
    }

    // Appel de la fonction utilitaire (si erreur → catch principal)
    const uid = await getUidByToken(token);

    // Mise à jour du pseudo
    await db.collection("users").doc(uid).update({
      pseudo,
      updatedAt: new Date().toISOString()
    });
    return res.status(200).json({ success: true, message: "Pseudo modifié" });

  } catch (e) {
    console.error("Erreur modification pseudo:", e);
    if (e.status === 401) {
      return res.status(401).json({ success: false, message: e.message });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// Fonction utilitaire
const getUidByToken = async (token) => {
  if (!token) {
    throw new Error("Token manquant");
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.uid) {
      throw new Error("UID introuvable");
    }
    return decoded.uid;
  } catch (er) {
    if (er.code === "auth/id-token-expired") {
      // On peut lancer une erreur personnalisée pour la gérer différemment dans le main
      const error = new Error("Votre session a expiré");
      error.status = 401;
      throw error;
    }
    throw er; // On relance l'erreur pour qu'elle remonte
  }
}


const getPseudoById = async (uid) => {
  try {
    const snap = await db.collection("users").doc(uid).get();
    if (snap.exists) {
      const data = snap.data();
      return data?.pseudo ?? null;
    }
    return null;
  } catch (e) {
    console.error("Erreur getPseudoById:", e);
    return null;
  }
}


// -------- Création et Rejoindre une partie

// Créer une partie
app.post("/createGame", async (req, res) => {
  try {
    const { game, token } = req.body;

    const uid = await getUidByToken(token);
    
    if (!["game1", "game2"].includes(game)){
      return res.json({ success: false, message: "Partie introuvable" });
    }
      
    //Générer un code à 4 chiffre
    let code;
    let snap;
    do{
      code = String(Math.floor(Math.random() * 9000) + 1000);
      snap = await db.collection(game).doc(code).get();
    }while(snap.exists)

    await db.collection(game).doc(code).set({ step: 0, createdAt: new Date().toISOString() });
    await db.collection(game).doc(code).collection("players").doc(uid).set({ 
      joinedAt: new Date().toISOString(),
      id: String(Math.floor(Math.random() * 900000) + 100000)
     });

    return res.json({ success: true, game, code });
  } catch (e) {
    console.error(e);
    if(e.status === 401){
      return res.json({ success: false, message: e.message });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
})

app.post("/joinGame", async (req, res) => {
  try {
    const { game, code, token } = req.body;
    const uid = await getUidByToken(token);

    if (!["game1", "game2"].includes(game))
      return res.json({ success: false, message: "Partie introuvable" });
    
    const snap = await db.collection(game).doc(code).get();
    if (!snap.exists)
      return res.json({ success: false, message: "Partie introuvable" });
    const data = snap.data() || {};
    if ((data.step ?? 0) !== 0)
      return res.json({ success: false, message: "Partie déjà en cours" });

    db.collection(game).doc(code).collection("players").doc(uid).set({
      joinedAt: new Date().toISOString(),
      id: String(Math.floor(Math.random() * 900000) + 100000)
    });


    return res.json({ success: true, game, code });
  } catch (e) {
    if(e.status === 401){
      return res.json({ success: false, message: e.message });
    }
    return res.json({ success: false, message: "Erreur serveur" })
  }
})


// ---------- Gestion du jeu & Socket.IO ----------

// Charger l'état de la partie (html)
const getGameData = async (game, code) => {
  const docRef = db.collection(game).doc(code);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  const step = docSnap.data()?.step ?? 0;
  const html = htmlContent[game]?.[step] ?? htmlContent["error"];
  return html
};

// Charger les players l'état (question,réponse)
const getPlayerData = async (game, code) => {
  const snap = await db.collection(game).doc(code).collection("players").get();
  return await Promise.all(
    snap.docs.map(async (doc) => ({
      id: doc.data()?.id ?? null,
      question: doc.data()?.question ?? null,
      reponse: doc.data()?.reponse ?? null,
      pseudo: await getPseudoById(doc.id)
    }))
  );
};


const loadGame = async (socket, game, code, token) => {
  try {
    if (!game || !code || !token) {
      return socket.disconnect(true);
    }

    const uid = await getUidByToken(token);

    const playerDoc = await db.collection(game).doc(code).collection("players").doc(uid).get();
    const id = playerDoc.data()?.id;
    const html = await getGameData(game, code);
    const players = await getPlayerData(game, code);

    if (!players.map(p => p.id).includes(id)) {
      socket.emit("loadGame", { game, code, html: htmlContent["error"], token });
      return socket.disconnect(true);
    }

    // Envoie uniquement aux joueurs de cette partie
    io.to(`${game}-${code}`).emit("loadGame", { game, code, token, html, players });

  } catch (e) {
    console.error("Erreur Socket.IO loadGame:", e);
    if(e.status === 401){
      socket.emit("error", { message: e.message });
      socket.disconnect(true);
      return;
    }
    socket.emit("error", { message: "Erreur serveur" });
    socket.disconnect(true);
  }
};

const updateGame = async (socket, game, code, token) => {
  try {
    if (!game || !code || !token) {
      return socket.disconnect(true);
    }
    const uid = await getUidByToken(token);
    const playerDoc = await db.collection(game).doc(code).collection("players").doc(uid).get();
    const id = playerDoc.data()?.id;

    const players = await getPlayerData(game, code);
    if (!players.map(p => p.id).includes(id)) {
      //io.emit("error", {game, code, token, message: "" });
      return socket.disconnect(true);
    }

    // Envoie uniquement aux joueurs de cette partie
    io.to(`${game}-${code}`).emit("updateGame", { game, code, token, players });

  } catch (e) {
    console.error("Erreur Socket.IO updateGame:", e);
    if(e.status === 401){
      socket.emit("error", { message: e.message });
      socket.disconnect(true)
      return;
    }
    socket.emit("error", { message: "Erreur serveur" });
    socket.disconnect(true);
  }
};

const saveQuestion = async (socket, game, code, token, question) => {
  try {
    if (!game || !code || !token) {
      return socket.disconnect(true);
    }

    const uid = await getUidByToken(token);

    db.collection(game).doc(code).collection("players").doc(uid).update({ question });

  } catch (e) {
    console.error("Erreur Socket.IO saveQuestion:", e);
    if(e.status === 401){
      socket.emit("error", { message: e.message });
      socket.disconnect(true)
      return;
    }
    socket.emit("error", { message: "Erreur serveur" });
    socket.disconnect(true);
  }
};

const saveReponse = async (socket, game, code, token, reponse) => {
  try {
    if (!game || !code || !token) {
      return socket.disconnect(true);
    }

    const uid = await getUidByToken(token);

    await db.collection(game).doc(code).collection("players").doc(uid).update({ reponse });

    const players = await getPlayerData(game, code);
    const playerSend = players.filter(p => (p.reponse && Object.keys(p.reponse).length === players.length))
    if(playerSend.length === players.length){
      await db.collection(game).doc(code).update({ step: 2 });
    }

  } catch (e) {
    console.error("Erreur Socket.IO saveReponse:", e);
    if(e.status === 401){
      socket.emit("error", { message: e.message });
      socket.disconnect(true)
      return;
    }
    socket.emit("error", { message: "Erreur serveur" });
    socket.disconnect(true);
  }
};

const startGame = async (socket, game, code) => {
  try {
    if (!game || !code) {
      return socket.disconnect(true);
    }

    const players = await getPlayerData(game, code);

    // On récupère les questions valides (non nulles et non vides)
    const questions = players
      .map(p => p.question)
      .filter(q => q && q.trim() !== "");

    // Vérifier si tous les joueurs ont une question
    if (questions.length !== players.length) {
      socket.emit("error", { message: "Il manque des questions" });
      return socket.disconnect(true);
    }

    await db.collection(game).doc(code).update({ step: 1 });

  } catch (e) {
    console.error("Erreur Socket.IO startGame:", e);
    socket.emit("error", { message: "Erreur serveur lors du démarrage du jeu" });
    socket.disconnect(true);
  }
};


io.on("connection", async (socket) => {
  const { game, code, token } = socket.handshake.query;

  if (game && code) {
    socket.join(`${game}-${code}`);
  }

  await loadGame(socket, game, code, token);

  socket.on("loadGameToken", async ({ game, code, token }) => {
    await loadGame(socket, game, code, token);
  });

  socket.on("updatePlayerToken", async ({ game, code, token }) => {
    await updateGame(socket, game, code, token);
  });

  socket.on("saveQuestion", async ({ game, code, token, question }) => {
    await saveQuestion(socket, game, code, token, question);
  });

  socket.on("saveReponse", async ({ game, code, token, reponse }) => {
    await saveReponse(socket, game, code, token, reponse);
  });
  socket.on("startGame", async ({ game, code }) => {
    await startGame(socket, game, code);
  });
});


// Écoute game1 et game2
["game1", "game2"].forEach((gameName) => {
  db.collection(gameName).onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docId = change.doc.id;
      const data = change.doc.data();

      //if (["added", "modified", "removed"].includes(change.type)){
        io.to(`${gameName}-${docId}`).emit('newGameData', { game: gameName, code: docId, });
      //}
    });
  });
});

// Écoute tous les players (collectionGroup)
db.collectionGroup("players").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const fullPath = change.doc.ref.path; // ex: "game1/1234/players/playerId"
    const [game, code, playerCollection, playerId] = fullPath.split("/");

    io.to(`${game}-${code}`).emit('newPlayerData', { game, code });
  });
});


const htmlContent = {
  game1: [`
    <div class="fx-col jc-between grow gap-40">
        <div class="fx-col gap-20 ai-center">
            <div class="fx-col text-center">
                <h3>Trouver une question pour vos amis !</h3>
            </div>
            <div id="code"></div>
        </div>
        <div class="fx-col ai-center">
            <ul class="fc-col gap-20" id="player"></ul>
        </div>
        <div class="fx-col gap-40">
            <div class="fx-row jc-evenly gap-20">
                <div class="fx-row ai-center">Votre question :</div>
                <input type="text" id="question">
            </div>
            <div class="fx-row jc-evenly gap-20 wrap">
                <button id="quit">Quitter</button>
                <button id="validate">Valider</button>
                <button id="start">Lancer</button>
            </div>
        </div>
    </div>
    `,`
    <div class="fx-col jc-between grow gap-40">
        <div class="fx-col gap-20 ai-center">
            <div class="fx-col text-center">
                <h3>Répondez aux questions des autres joueurs !</h3>
            </div>
        </div>
        <div class="fx-col">
            <ul class="fx-col gap-30" id="form"></ul>
        </div>
        <div class="fx-col gap-20">
          <div class="fx-row jc-evenly gap-20 wrap">
              <button id="send">Envoyer</button>
          </div>
          <div class="fx-col">
              <div class="text-center" id="liste"></div>
          </div>
        </div>
    </div>
    `,`
    <div class="fx-col jc-between grow gap-40">
        <div class="fx-col">
            <div class="fx-col text-center">
              <h3>Résultats du jeu !</h3>
            </div>
        </div>
        <div class="fx-col">
            <ul class="fx-col gap-30" id="result"></ul>
        </div>
        <div class="fx-col gap-20">
          <div class="fx-row jc-evenly gap-20 wrap">
              <button id="next">Terminer</button>
          </div>
        </div>
    </div>
    `],
  game2: ['<div>j\'adore le jeu numéro 2</div>'],
  error: '<div>Partie introuvable</div>',
};











// ==== Démarrage serveur ====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server + Socket.IO running on ${WEB_LINK}`)
);
