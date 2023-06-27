// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        generateEventList(details.eventList)

        await setPageHeaders({
            customPage: true,
            name: 'Home',
            noBreadcrumb: true,
        });

        resolve();
    })
}