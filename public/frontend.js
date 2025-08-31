// Initialisation
const WEB_LINK = "https://zogames.onrender.com";
const code = localStorage.getItem("code")

// Authentification
document.getElementById("signup").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${WEB_LINK}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  alert(JSON.stringify(data))
  document.getElementById("status").textContent = JSON.stringify(data);
};

document.getElementById("login").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${WEB_LINK}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.idToken) {
    localStorage.setItem("token", data.idToken);
    document.getElementById("status").textContent = "Connecté";
  } else {
    document.getElementById("status").textContent = "Erreur login";
  }
};








// jeu

const updatePlayer = async (players) => {
    const labelCode = document.getElementById("code")
    if (labelCode){
    labelCode.innerHTML = code
    }

    const list = document.getElementById("player")
    if (list){
        list.innerHTML = players.map(p => `<li>${p.pseudo}</li>`).join("")
    }
}

const updateQuestion = async(players) => {
    const list = document.getElementById("form")
    if (list){
        list.innerHTML = players.map(p => `
            <li id="${p.uid}">
                <div>${p.question}</div>
                <input type="text"  placeholder="${p.question}">
            </li>`).join("")
        }
}

const updateReponse = async (players) => {
    const list = document.getElementById("result")
    if (list){
        list.innerHTML = players.map(p => `
            <li>
                <div><em><strong>${p.pseudo}</strong></em> : ${p.question}</div>
                <ul>${players.map(q => `<li>${q.reponse[p.uid]}</li>`).join("")}</ul>
            </li>`).join("")
        }
}

const sendQuestion = async () => {
    const question = document.getElementById("question").value
    if (!question){
        alert("Veuillez saisir une question");
        return;
    }
    
    await fetch(WEB_LINK + "/sendQuestion", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ question })
    });
}

const sendReponse = async () => {
    let data = {}
    const ul = document.querySelectorAll("#form li");
    for (let li of ul) {
        let input = li.querySelector("input");
        if (input && input.value && li.id) {
            data[li.id] = input.value;
        }
    }
    await backend("/sendReponse", data)
}

async function joinGame() {
    const name = document.getElementById('name').value;
    
    loadPlayers();
}

async function loadPlayers() {
    const res = await fetch('http://localhost:3000/players');
    const data = await res.json();
}




window.valider = async () =>{await sendQuestion()}
window.envoyer = async () =>{await sendReponse()}






const programme = async () => {
  try {
    const res = await fetch('./data.json');
    const data = await res.json();

    console.log(data);

    await updatePlayer(data);
    await updateQuestion(data);
    await updateReponse(data);
  } catch (err) {
    console.error(err);
  }
}

programme();

const backend = async (message, data) =>{
    await fetch(WEB_LINK + message, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ code, data })
    });
}