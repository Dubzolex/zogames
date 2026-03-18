/*
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Fonction Cloud pour créer un utilisateur avec un pseudo par défaut
exports.createUser = functions.https.onCall(async (data, context) => {
    const { email, password } = data;

    // Vérifie que l'utilisateur est authentifié pour appeler cette fonction
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'L’utilisateur doit être authentifié.');
    }

    try {
        // Crée un utilisateur Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Génère un pseudo aléatoire
        let pseudo = `Guest${Math.floor(Math.random() * 9000) + 1000}`;

        // Enregistre l'utilisateur dans Firestore
        await db.collection("users").doc(userRecord.uid).set({
            email: userRecord.email,
            createDate: new Date(),
            pseudo: pseudo,
            admin: false,
        });

        return { message: "Inscription réussie !", userId: userRecord.uid };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Erreur lors de la création de l’utilisateur', error);
    }
});

// Fonction Cloud pour mettre à jour le pseudo de l'utilisateur
exports.updateUserPseudo = functions.https.onCall(async (data, context) => {
    const { pseudo } = data;

    // Vérifie que l'utilisateur est authentifié
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'L’utilisateur doit être connecté');
    }

    const userId = context.auth.uid;

    // Vérifie si le pseudo est déjà utilisé
    const usersSnapshot = await db.collection("users").where("pseudo", "==", pseudo).get();
    if (!usersSnapshot.empty) {
        throw new functions.https.HttpsError('already-exists', 'Ce pseudo est déjà utilisé.');
    }

    // Met à jour le pseudo de l'utilisateur
    await db.collection("users").doc(userId).update({ pseudo: pseudo });
    return { message: "Pseudo mis à jour avec succès" };
});
*/