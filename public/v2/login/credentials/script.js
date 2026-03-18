import { Authenticator } from "/v2/src/api/login.js"


document.getElementById("save")?.addEventListener("click", async () => {
    const pseudo = document.getElementById("pseudo")

    const auth = new Authenticator()
    if(await auth.updateUserPseudo(pseudo.value)) {
        auth.account()
    }
    
})