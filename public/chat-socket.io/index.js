const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Servir le fichier HTML
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Configurer Socket.IO
io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est déconnecté");
    });
});

// Démarrer le serveur
http.listen(3000, () => {
    console.log("J'écoute le port 3000");
});
