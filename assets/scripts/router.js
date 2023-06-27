let config;

startMainRouter();

async function startMainRouter() {

    config = await (await fetch('/config.json')).json();

    if (window.location.pathname.includes('/login')) loadLoginPage();
    else if (window.location.pathname.includes('/admin/dashboard')) loadAdminDashboard();
    else if (window.location.pathname.includes('/volunteer/dashboard')) loadVolunteerDashboard();
    else loadPublicPage();
}

async function loadLoginPage() {
    let head = document.querySelector('head');
    let data = await (await fetch(`/pages/login/login.html`)).text();
    document.querySelector('.page-body').innerHTML = data;

    let indexJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/login/index.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let utilsJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/dashboard/utils.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let stylesheetPromise = new Promise(async (cssResolve) => {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/assets/stylesheets/login/stylesheet.css`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    await Promise.all([indexJs, utilsJs, stylesheetPromise])

    mainRouterPageLoad(config);
}

async function loadAdminDashboard() {
    let head = document.querySelector('head');
    let data = await (await fetch(`/pages/admin/index.html`)).text();
    document.querySelector('.page-body').innerHTML = data;

    let indexJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/dashboard/admin/index.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let utilsJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/dashboard/utils.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let stylesheetPromise = new Promise(async (cssResolve) => {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/assets/stylesheets/dashboard/stylesheet.css`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    let variablePromise = new Promise(async (cssResolve) => {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/assets/stylesheets/dashboard/variables.css`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    await Promise.all([indexJs, utilsJs, stylesheetPromise, variablePromise])
    mainRouterPageLoad(config, true);
}

async function loadVolunteerDashboard() {
    let head = document.querySelector('head');
    let data = await (await fetch(`/pages/volunteer/index.html`)).text();
    document.querySelector('.page-body').innerHTML = data;

    let indexJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/dashboard/volunteer/index.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let utilsJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/dashboard/volunteer/utils.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let stylesheetPromise = new Promise(async (cssResolve) => {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/assets/stylesheets/dashboard/stylesheet.css`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    let variablePromise = new Promise(async (cssResolve) => {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/assets/stylesheets/dashboard/variables.css`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    await Promise.all([indexJs, utilsJs, stylesheetPromise, variablePromise])

    mainRouterPageLoad(config, false);
}

async function loadPublicPage() {
    let head = document.querySelector('head');
    let data = await (await fetch(`/pages/public/index.html`)).text();
    document.querySelector('.page-body').innerHTML = data;

    let indexJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/public/index.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let utilsJs = new Promise(async (jsResolve) => {
        script = document.createElement('script');
        script.setAttribute('src', `/assets/scripts/public/utils.js`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    let stylesheetPromise = new Promise(async (cssResolve) => {
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/assets/stylesheets/public/stylesheet.css`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    await Promise.all([indexJs, utilsJs, stylesheetPromise])

    mainRouterPageLoad(config);
}