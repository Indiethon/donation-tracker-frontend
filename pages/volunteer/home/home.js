async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        await setPageHeaders({
            singularName: 'Home',
            pluralName: 'Home',
            model: '',
            url: '/volunteer/dashboard',
            customPage: true,
        });

        resolve();
    })
}