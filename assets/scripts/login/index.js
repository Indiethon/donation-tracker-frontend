async function mainRouterPageLoad(config) {

    let input = document.querySelector('.password')
    input.addEventListener("keypress", (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            login();
        }
    });

    const verify = await GET(`${config.apiUrl}/verify?model=login&action=view`);
    if (verify.status === 200) return redirect(verify.data);
    else document.querySelector('.fader').classList.remove('visible');
}

async function login() {
    let username = document.querySelector('.username');
    let password = document.querySelector('.password');
    let button = document.querySelector('.login');
    let errorText = document.querySelector('.invalid-text');
    const login = await GET(`${config.apiUrl}/login?username=${username.value}&password=${password.value}`)
    if (login.error) {
        errorText.style.visibility = 'visible';
        username.setCustomValidity('Invalid');
        password.setCustomValidity('Invalid');
        username.disabled = false;
        password.disabled = false;
        button.disabled = false;
        return;
    }
    await createCookie(login.data.username, login.data.id, login.data.token)
    redirect(login.data)
}

function redirect(status) {
    document.querySelector('.fader').classList.add('visible');
    if (status.admin) setTimeout(() => location.href = '/admin/dashboard', 250);
    else if (status.volunteer) setTimeout(() => location.href = '/volunteer/dashboard', 250);
    else setTimeout(() => location.href = '/login', 250);
}

function createCookie(username, id, token) {
    return new Promise((resolve, reject) => {
        document.cookie = `data=${JSON.stringify({ username: username, id: id, token: token })}; max-age=43200; path=/;`;
        resolve();
    })
}