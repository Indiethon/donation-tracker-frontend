let match;
let loading;
let routes;
let details;
let volunteer;

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const volunteerRouter = async () => {

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

    let head = document.querySelector('head');
    let main = document.querySelector('.content-section');

    document.title = `${match.route.name} | Volunteer Dashboard`

    document.querySelector('.loading-content-section').classList.remove('hidden');
    document.querySelector('.content-section').classList.add('hidden');


    loading = true;

    let script;

    let jsPromise = new Promise(async (jsResolve) => {
        if (!match.route.javascript) return jsResolve();
        script = document.createElement('script');
        script.setAttribute('src', `/pages/volunteer/${match.route.javascript}`);
        script.setAttribute('import', '')
        script.onload = () => jsResolve();
        head.appendChild(script);
    })

    await Promise.all([jsPromise])

    main.innerHTML = '';
    if (match.route.html) {
        let res = await fetch(`/pages/volunteer/${match.route.html}`);
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

window.addEventListener("popstate", volunteerRouter);

async function mainRouterPageLoad(_config, _volunteer) {

    volunteer = _volunteer;
    config = _config;
    routes = config.volunteerPages;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) switchTheme();

    document.body.addEventListener("click", e => {

        if (e.target.nodeName !== 'A') return;

        queryString = window.location.search;
        urlParams = new URLSearchParams(queryString);

        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            let href = e.target.href;
            history.pushState(null, null, href);
            volunteerRouter();
        }
    });

    const verify = await GET(`${config.apiUrl}/verify?model=null&action=null`);
    if (verify.status !== 200) return location.href = '/login';

    if (!verify.data.admin) document.querySelector('.switch-dashboard-button').remove();

    details = await (await fetch(`${config.apiUrl}/details`)).json();

    volunteerRouter();
}

function changePath(path, fromError) {
    let href = path;
    history.pushState(null, null, href);
    return volunteerRouter(fromError);
}

function switchTheme() {
    if (document.documentElement.getAttribute('data-theme') === 'dark') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.setAttribute('data-theme', 'dark');
}