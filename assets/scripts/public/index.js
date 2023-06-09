let match;
let loading;
let routes;
let details;

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const publicRouter = async () => {

    let error = await checkDatabase();
    if (window.location.pathname === '/databaseError' && !error) window.location.pathname = ''

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path)),
            event: event,
        };
    });

    const path = window.location.pathname.replace(/\/$/, "");
    match = potentialMatches.find(potentialMatch => potentialMatch.route.path === path);

    let head = document.querySelector('head');
    let main = document.querySelector('main');

    document.querySelector('#navbar-toggle').checked = false
    document.title = `${match.route.name} - ${config.name}`

    let fade = new Promise((resolve) => {
        document.querySelector('.fader').classList.add('visible');
        setTimeout(() => resolve(), 1000)
    })

    loading = true;

    let res = await fetch(`/pages/public/${match.route.html}`);
    let text = await res.text();

    let link;
    let script;

    let jsPromise = new Promise(async (jsResolve) => {
        if (!match.route.javascript) return jsResolve();
        script = document.createElement('script');
        script.setAttribute('src', `/pages/public/${match.route.javascript}`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    await Promise.all([fade, jsPromise])

    let cssPromise = new Promise(async (cssResolve) => {
        if (!match.route.stylesheet) return cssResolve();
        link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `/pages/public/${match.route.stylesheet}`);
        link.setAttribute('import', '')
        link.onload = () => cssResolve();
        head.appendChild(link);
    })

    await Promise.all([cssPromise])

    document.querySelectorAll('[route]').forEach(x => x.remove());
    main.innerHTML = text;
    if (link) link.setAttribute('route', '')
    if (script) script.setAttribute('route', '')
    document.querySelector('.page-container').scrollTo(0, 0);
    document.querySelector('main').scrollTo(0, 0);
    try {
        await load(config, details)
    } catch { }
    setTimeout(() => { try { visible(config) } catch { } }, 1000);
    document.querySelector('.fader').classList.remove('visible');
    loading = false;
}

window.addEventListener("popstate", publicRouter);

// document.addEventListener("DOMContentLoaded", async () => {

async function mainRouterPageLoad(_config) {

    config = _config;
    routes = config.publicPages;

    if (config.googleAnalytics && config.googleAnalytics.measurmentId) attatchAnalytics(config.googleAnalytics.measurmentId);
    else if (config.googleAnalytics) console.warn('Google Analytics missing measurment id in the config file. Google Analytics is disabled.')

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) switchTheme();

    document.body.addEventListener("click", e => {

        if (e.target.nodeName !== 'A') return;

        queryString = window.location.search;
        urlParams = new URLSearchParams(queryString);

        if (window.location.pathname === '/databaseError') document.querySelector('.fader').classList.add('visible');

        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            let href = `${e.target.href}${(urlParams.get('event')) ? "?event=" + urlParams.get('event') : ''}`;
            history.pushState(null, null, href);
            publicRouter();
        }
        else if (e.target.matches("[event-link]")) {
            e.preventDefault();
            let href = `${window.location.pathname}?event=${e.target.getAttribute('event')}`;
            history.pushState(null, null, href);
            publicRouter();
            setTimeout(() => document.querySelector('.dropdown-event-text').innerHTML = details.eventList.find(x => x.short === e.target.getAttribute('event')).name, 500);
        }
        else if (e.target.matches("[pagination-link]")) {
            e.preventDefault();
            let value = document.querySelector('.pagination-page-input').value;
            let href = `${window.location.pathname}?event=${urlParams.get('event')}&page=${(value > parseInt(document.querySelector('.pagination-page-total').innerHTML)) ? document.querySelector('.pagination-page-total').innerHTML : value}`;
            history.pushState(null, null, href);
            publicRouter();
        }
    });

    if (window.location.pathname !== '/databaseError') {
        let error = await checkDatabase();

        details = await (await fetch(`${config.apiUrl}/details`)).json();

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);

        let eventList = document.querySelector('#event-dropdown-menu');
        details.eventList.forEach((event, index) => {
            eventList.innerHTML += `<li><a event="${event.short}" event-link>${event.name}</a></li>`
            if (urlParams.get('event') === event.short) document.querySelector('.dropdown-event-text').innerHTML = event.name;
            else if (!urlParams.get('event') && index >= details.eventList.length - 1) {
                document.querySelector('.dropdown-event-text').innerHTML = details.eventList[0].name;
                history.pushState(null, null, `${window.location.pathname}?event=${details.eventList[0].short}`);
            }
        })

        document.querySelector('.navbar-logo a').href = config.website;
        document.querySelector('.website-link').href = config.website;
        document.querySelector('.privacy-policy-link').href = config.privacyPolicy;
        document.querySelector('.sweepstakes-rules-link').href = config.sweepstakesRules;
        document.querySelector('.copyright-date').innerHTML = new Date().getFullYear();
        document.querySelector('.copyright-company').innerHTML = config.copyrightCompany;

        if (!details.activeEvent) document.querySelector('header .donate-button').style.display = 'none'
    }

    publicRouter();
}
//});

function attatchAnalytics(measurmentId) {
    let script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurmentId}`;

    let script2 = document.createElement('script');
    script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());

        gtag('config', '${measurmentId}');
        `

    document.querySelector('head').appendChild(script1)
    document.querySelector('head').appendChild(script2)
}

function changePath(path, fromError) {
    let href = path;
    history.pushState(null, null, href);
    return publicRouter(fromError);
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
    // if (document.documentElement.getAttribute('data-theme') === 'dark') document.documentElement.setAttribute('data-theme', 'light');
    // else document.documentElement.setAttribute('data-theme', 'dark');
}