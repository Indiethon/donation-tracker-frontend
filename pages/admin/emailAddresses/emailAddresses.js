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
            singularName: 'Email Address',
            pluralName: 'Email Addresses',
            model: 'emailAddress',
            url: '/admin/dashboard/emailAddresses',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'emailAddress',
                endpoint: `${config.apiUrl}/emailAddress`,
                table: [{
                    name: 'Name',
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Email',
                    data: 'email',
                    priority: 1,
                }, {
                    name: 'Host',
                    data: 'host',
                    priority: 2,
                }, {
                    name: 'Port',
                    data: 'port',
                    priority: 2,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Email Address',
                model: 'emailAddress',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/emailAddress`,
                form: [{
                    name: 'Name',
                    type: 'input',
                    data: 'name',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Email',
                    type: 'input',
                    data: 'email',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'SMTP Host',
                    type: 'input',
                    data: 'host',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'SMTP Port',
                    type: 'number',
                    data: 'port',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'SMTP Username',
                    type: 'input',
                    data: 'username',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'SMTP Password',
                    type: 'password',
                    data: 'password',
                    required: true,
                    submit: (value) => {
                        return value;
                    }
                }]
            });
        }
        resolve();
    })
}