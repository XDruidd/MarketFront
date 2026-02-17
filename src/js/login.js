document.addEventListener("DOMContentLoaded", async () => {
    let registerLogin = document.querySelector('.registerLogin');
    let login = document.querySelector('.login');

    registerLogin.addEventListener('click', (e) => {
        if (e.target === registerLogin) {
            registerLogin.style.display = 'none';
        }
    })

    login.addEventListener('click', function(){
        registerLogin.style.display = 'flex';
    })

})