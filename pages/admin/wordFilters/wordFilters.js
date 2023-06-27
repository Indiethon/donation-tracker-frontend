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
            singularName: 'Word Filter',
            pluralName: 'Word Filters',
            model: 'wordFilter',
            url: '/admin/dashboard/wordFilters',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'wordFilter',
                endpoint: `${config.apiUrl}/wordFilter`,
                table: [{
                    name: 'Word',
                    data: 'word',
                }, {
                    name: 'Allowed',
                    data: 'allowed'
                }, {
                    name: 'Blocked',
                    data: 'blocked'
                }]
            })
        }

        else {
            await generateForm({
                name: 'Word Filter',
                model: 'wordFilter',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/wordFilter`,
                form: [{
                    name: 'Word Or Phrase',
                    type: 'input',
                    data: 'word',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Allowed',
                    type: 'checkbox',
                    data: 'allowed',
                    submit: (value) => {
                        return value;
                    },
                },{
                    name: 'Blocked',
                    type: 'checkbox',
                    data: 'blocked',
                    submit: (value) => {
                        return value;
                    },
                }],
            });
        }
        resolve();
    })
}