// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        let mode = urlParams.get('mode');
        let id = urlParams.get('id');
        let event = urlParams.get('event')

        generateEventList(details.eventList)

        await setPageHeaders({
            singularName: 'Blurb',
            pluralName: 'Blurbs',
            model: 'blurb',
            url: '/admin/dashboard/blurbs',
            mode: mode,
            id: id,
            event: event,
            eventName: details.eventList.find(x => x.short === event).name,
        });

        if (!mode) {
            await generateTable({
                model: 'blurb',
                endpoint: `${config.apiUrl}/blurb`,
                event: event,
                table: [{
                    name: 'Name',   
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Text',
                    data: 'text',
                    priority: 5,
                }, {
                    name: 'Active',
                    data: 'active',
                    priority: 1,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Blurb',
                model: 'blurb',
                type: mode,
                id: id,
                event: event,
                endpoint: `${config.apiUrl}/blurb`,
                form: [{
                    name: 'Name',
                    type: 'input',
                    data: 'name',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Text',
                    type: 'input',
                    data: 'text',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Notes',
                    type: 'input',
                    data: 'notes',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Active',
                    type: 'checkbox',
                    data: 'active',
                    submit: (value) => {
                        return value;
                    },
                }],
                other: [{
                    data: 'eventId',
                    submit: () => {
                        return details.eventList.find(x => x.short === event).id;
                    },
                }]
            });
        }
        resolve();
    })
}