// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        await setPageHeaders({
            singularName: 'Blurb',
            pluralName: 'Blurbs',
            model: 'blurb',
            url: '/volunteer/dashboard/blurbs',
        });

        await createTable();

        resolve();
    })
}

async function createTable() {
    return new Promise(async (resolve, reject) => {
        await generateTable({
            model: 'blurb',
            endpoint: `${config.apiUrl}/blurb`,
            event: details.activeEvent.short,
            volunteer: true,
            table: [{
                name: 'Name',
                data: 'name',
            }],
            subTable: [{
                name: 'Text',
                data: 'text'
            }, {
                name: 'Notes',
                data: 'notes'
            }],
            clickFunction: (value) => {
                return `expandRow("${value._id}")`;
            },
        }, true)
        resolve();
    })
}