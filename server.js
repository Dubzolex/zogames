import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import axios from "axios";

const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

const firebaseConfig = {
  "apiKey": "AIzaSyAxzMqlfPiXqH65fN4A_ZQ8g4yAhNZK6NA",
  "authDomain": "enzo-projet.firebaseapp.com",
  "projectId": "enzo-projet",
  "storageBucket": "enzo-projet.firebasestorage.app",
  "messagingSenderId": "509431405679",
  "appId": "1:509431405679:web:a3623be821a74149bb819a",
  "measurementId": "G-WHNMXCK889"
}

admin.initializeApp({firebaseConfig});

// SIGNUP (création utilisateur)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    // Crée un custom token pour cet utilisateur
    const customToken = await admin.auth().createCustomToken(user.uid);
    res.json({ customToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN (vérifier via REST Firebase pour éviter apiKey côté client)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Utilisation de l'API REST de Firebase pour vérifier email/password
    const API_KEY = firebaseConfig.apiKey; // ⚠️ Stocké côté serveur uniquement
    const resp = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    const idToken = resp.data.idToken;
    res.json({ idToken }); // Tu peux aussi générer un custom token à la place
  } catch (err) {
    res.status(401).json({ error: "Email ou mot de passe invalide" });
  }
});

// ✅ Route protégée
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));
