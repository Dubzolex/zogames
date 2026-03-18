import { status } from "/v2/src/tools/script.js"

import { Game, Player } from "/v2/src/api/game.js"


// ===================== BUTTON =====================
document.getElementById("create1").addEventListener("click", async () => {
    const g = new Game("status-c1")
    await g.create("1")
    const p = new Player()
    await p.join(g.getId())
})

document.getElementById("create2").addEventListener("click", async () => {
    const g = new Game("status-c2")
    await g.create("2")
    const p = new Player()
    await p.join(g.getId())
})

document.getElementById("create3").addEventListener("click", async () => {
    const g = new Game("status-c3")
    await g.create("3")
    const p = new Player()
    await p.join(g.getId())
})

document.getElementById("create4").addEventListener("click", async () => {
    const g = new Game("status-c4")
    await g.create("4")
    const p = new Player()
    await p.join(g.getId())
})

document.getElementById("join").addEventListener("click", async () => {
    const code = document.getElementById("code")
    const p = new Player("status-j")
    await p.join(code)
})