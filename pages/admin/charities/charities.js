// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        let mode = urlParams.get('mode');
        let id = urlParams.get('id');

        generateEventList(details.eventList)

        await setPageHeaders({
            singularName: 'Charity',
            pluralName: 'Charities',
            model: 'charity',
            url: '/admin/dashboard/charities',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'charity',
                endpoint: `${config.apiUrl}/charity`,
                table: [{
                    name: 'Name',
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Payee',
                    data: 'payee',
                    priority: 2,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Charity',
                model: 'charity',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/charity`,
                form: [{
                    name: 'Name',
                    type: 'input',
                    data: 'name',
                    required: true,
                    attributes: {
                        maxLength: 60,
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Description',
                    type: 'input',
                    data: 'description',
                    submit: (value) => {
                        return value;
                    },
                },{
                    name: 'Payee',
                    type: 'input',
                    data: 'payee',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Logo URL',
                    type: 'input',
                    data: 'logoUrl',
                    submit: (value) => {
                        return value;
                    },
                }],
            });
        }
        resolve();
    })
}