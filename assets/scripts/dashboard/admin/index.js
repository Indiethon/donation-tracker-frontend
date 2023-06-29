let match;
let loading;
let routes;
let details;
let admin;

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const adminRouter = async () => {

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path)),
            event: event,
        };
    });

    try { document.querySelector('#navbar-toggle').checked = false } catch { };
    const path = window.location.pathname.replace(/\/$/, "");
    match = potentialMatches.find(potentialMatch => potentialMatch.route.path === path);

    // if (admin) {
    //     const verify = await GET(`${config.apiUrl}/verify?model=${match.route.model}&action=access`);
    //     if (verify.status !== 200) return;
    // }

    let head = document.querySelector('head');
    let main = document.querySelector('.content-section');

    //document.querySelector('#navbar-toggle').checked = false
    document.title = `${match.route.name} | Admin Dashboard`

    // let fade = new Promise((resolve) => {
    //     document.querySelector('.fader').classList.add('visible');
    //     setTimeout(() => resolve(), 1000)
    // })

    document.querySelector('.loading-content-section').classList.remove('hidden');
    document.querySelector('.content-section').classList.add('hidden');


    loading = true;

    // let link;
    let script;

    let jsPromise = new Promise(async (jsResolve) => {
        if (!match.route.javascript) return jsResolve();
        script = document.createElement('script');
        script.setAttribute('src', `/pages/admin/${match.route.javascript}`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    await Promise.all([jsPromise])

    // let cssPromise = new Promise(async (cssResolve) => {
    //     if (!match.route.stylesheet) return cssResolve();
    //     link = document.createElement('link');
    //     link.setAttribute('rel', 'stylesheet');
    //     link.setAttribute('href', `/pages/admin/${match.route.stylesheet}`);
    //     link.setAttribute('import', '')
    //     link.onload = () => cssResolve();
    //     head.appendChild(link);
    // })

    // await Promise.all([cssPromise])

    main.innerHTML = '';
    if (match.route.html) {
        let res = await fetch(`/pages/admin/${match.route.html}`);
        let text = await res.text();
        main.innerHTML = text;
    }
    document.querySelectorAll('[route]').forEach(x => x.remove());
    if (script) script.setAttribute('route', '')
    document.querySelector('.page-container').scrollTo(0, 0);
    try {
        await load(config, details)
    } catch { }
    try {
        document.querySelector('.fader').classList.remove('visible');
        document.querySelector('.loading-content-section').classList.add('hidden');
        document.querySelector('.content-section').classList.remove('hidden');
    } catch (e) { console.error(e) }
    loading = false;
}

window.addEventListener("popstate", adminRouter);

// document.addEventListener("DOMContentLoaded", async () => {

async function mainRouterPageLoad(_config, _admin) {

    admin = _admin;
    config = _config;
    routes = config.adminPages;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) switchTheme();

    document.body.addEventListener("click", e => {

        if (e.target.nodeName !== 'A') return;

        queryString = window.location.search;
        urlParams = new URLSearchParams(queryString);

        // if (window.location.pathname === '/databaseError') document.querySelector('.fader').classList.add('visible');

        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            let href = e.target.href;
            history.pushState(null, null, href);
            adminRouter();
        }
        else if (e.target.matches("[event-link]")) {
            e.preventDefault();
            let href = `${e.target.href}?event=${e.target.getAttribute('eventShort')}`
            history.pushState(null, null, href);
            adminRouter();
        }
        else if (e.target.matches("[pagination-link]")) {
            e.preventDefault();
            let value = document.querySelector('.pagination-page-input').value;
            let href = window.location.pathname
            adminRouter();
        }
    });

    const verify = await GET(`${config.apiUrl}/verify?model=null&action=view`);
    if (verify.status !== 200) return location.href = '/login';
    if (!verify.data.admin) location.href = '/volunteer/dashboard'

    if (window.location.pathname !== '/databaseError') {
        let error = await checkDatabase();

        details = await (await fetch(`${config.apiUrl}/details`)).json();

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);

        // let eventList = document.querySelector('#event-dropdown-menu');
        // details.eventList.forEach((event, index) => {
        //     eventList.innerHTML += `<li><a event="${event.short}" event-link>${event.name}</a></li>`
        //     if (urlParams.get('event') === event.short) document.querySelector('.dropdown-event-text').innerHTML = event.name;
        //     else if (!urlParams.get('event') && index >= details.eventList.length - 1) {
        //         document.querySelector('.dropdown-event-text').innerHTML = details.eventList[0].name;
        //         history.pushState(null, null, `${window.location.pathname}?event=${details.eventList[0].short}`);
        //     }
        // })

        // document.querySelector('.navbar-logo a').href = config.website;
        // document.querySelector('.website-link').href = config.website;
        // document.querySelector('.privacy-policy-link').href = config.privacyPolicy;
        // document.querySelector('.sweepstakes-rules-link').href = config.sweepstakesRules;
        // document.querySelector('.copyright-date').innerHTML = new Date().getFullYear();
        // document.querySelector('.copyright-company').innerHTML = config.copyrightCompany;

        // if (!details.activeEvent) document.querySelector('header .donate-button').style.display = 'none'
    }

    /* Temporary dark mode switch */
    // const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    // toggleSwitch.addEventListener('change', switchTheme, false);
    /* End */

    adminRouter();
}
//});

function changePath(path, fromError) {
    let href = path;
    history.pushState(null, null, href);
    return adminRouter(fromError);
}

function checkDatabase() {
    return new Promise(async (resolve, reject) => {
        fetch(`${config.apiUrl}/ping`).then((res) => res.json()).then((json) => {
            switch (json.status) {
                case 200: return resolve(false); break;
                default: {
                    if (window.location.pathname === '/databaseError') return resolve(true);
                    changePath(`/databaseError`); reject(true);
                }
            }
        }).catch(() => {
            if (window.location.pathname === '/databaseError') return resolve(true);
            changePath(`/databaseError`);
            reject();
        })
    })
}

function switchTheme() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.setAttribute('data-theme', 'dark');
}