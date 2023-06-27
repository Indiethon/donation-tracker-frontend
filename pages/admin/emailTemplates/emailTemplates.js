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
            singularName: 'Email Template',
            pluralName: 'Email Templates',
            model: 'emailTemplate',
            url: '/admin/dashboard/emailTemplates',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'emailTemplate',
                endpoint: `${config.apiUrl}/emailTemplate`,
                table: [{
                    name: 'Name',
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Subject',
                    data: 'subject',
                    priority: 1,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Email Template',
                model: 'emailTemplate',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/emailTemplate`,
                form: [{
                    name: 'Name',
                    type: 'input',
                    data: 'name',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Subject',
                    type: 'input',
                    data: 'subject',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Content Type',
                    type: 'select',
                    data: 'contentType',
                    required: true,
                    options: {
                        text: 'Text',
                        html: 'HTML',
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Content',
                    type: 'textarea',
                    data: 'content',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Email Carbon Copy (CC)',
                    type: 'input',
                    data: 'carbonCopy',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }],
            });
        }
        resolve();
    })
}