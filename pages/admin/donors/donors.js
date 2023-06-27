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
            singularName: 'Donor',
            pluralName: 'Donors',
            model: 'donor',
            url: '/admin/dashboard/donors',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'donor',
                endpoint: `${config.apiUrl}/donor`,
                table: [{
                    name: 'Email',
                    data: 'email',
                    priority: 1,
                }, {
                    name: 'Alias',
                    data: 'alias',
                    priority: 1,
                    textFunction: (value) => {
                        return value.alias[0];
                    },
                }]
            })
        }

        else {
            await generateForm({
                name: 'Donor',
                model: 'donor',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/donor`,
                form: [{
                    name: 'Email',
                    type: 'input',
                    data: 'email',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Aliases',
                    type: 'array',
                    data: 'alias',
                    array: [{
                        name: 'Alias',
                        type: 'input',
                    }],
                    required: true,
                    submit: (value) => {
                        let fields = value.querySelectorAll('.array.childDiv');
                        let data = [];
                        for (const field of fields) {
                            data.push(field.querySelector('input').value)
                        }
                        return data;
                    },
                }],
            });
        }
        resolve();
    })
}