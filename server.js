import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// __dirname dans ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS : autoriser ton frontend Firebase Hosting
app.use(cors({
  origin: "https://zogames.web.app",
  methods: ["GET", "POST"],
  credentials: true 
}));

app.use(express.json());

// === Firebase Admin ===
// ⚠️ Pour production, utilise un fichier de service account JSON
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firebaseConfig = {
  apiKey: "AIzaSyAxzMqlfPiXqH65fN4A_ZQ8g4yAhNZK6NA",
  authDomain: "enzo-projet.firebaseapp.com",
  projectId: "enzo-projet",
  storageBucket: "enzo-projet.firebasestorage.app",
  messagingSenderId: "509431405679",
  appId: "1:509431405679:web:a3623be821a74149bb819a",
  measurementId: "G-WHNMXCK889"
};
admin.initializeApp({ firebaseConfig });

// === Routes API ===

// Route test serveur
app.get("/", (req, res) => {
  res.send("✅ Server is running on Render!");
});

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    // const user = await admin.auth().createUser({ email, password });
    // const customToken = await admin.auth().createCustomToken(user.uid);
    res.json({ message: `${email} et ${password} reçu du backend` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login via Firebase REST API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const API_KEY = firebaseConfig.apiKey;
    const resp = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    const idToken = resp.data.idToken;
    res.json({ idToken });
  } catch (err) {
    res.status(401).json({ error: "Email ou mot de passe invalide" });
  }
});

// Route protégée
app.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token manquant" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ uid: decoded.uid, email: decoded.email });
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
});

// === Servir frontend React/Vue si build présent ===
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  // Si le fichier index.html existe dans build, on le sert
  res.sendFile(path.join(buildPath, "index.html"), err => {
    if (err) res.status(404).send("Page non trouvée");
  });
});

// === Démarrage serveur ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
