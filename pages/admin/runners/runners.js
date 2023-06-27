// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        let mode = urlParams.get('mode');
        let id = urlParams.get('id');

        await setPageHeaders({
            singularName: 'Runner',
            pluralName: 'Runners',
            model: 'runner',
            url: '/admin/dashboard/runners',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'runner',
                endpoint: `${config.apiUrl}/runner`,
                table: [{
                    name: 'Name',
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Email',
                    data: 'email',
                    priority: 2,
                }, {
                    name: 'Pronouns',
                    data: 'pronouns',
                    priority: 1,
                }, {
                    name: 'Discord',
                    data: 'discord',
                    priority: 3,
                }, {
                    name: 'Twitch',
                    data: 'twitch',
                    priority: 3,
                }, {
                    name: 'Twitter',
                    data: 'twitter',
                    priority: 3,
                },]
            })
        }

        else {
            await generateForm({
                name: 'Runner',
                model: 'runner',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/runner`,
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
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Pronouns',
                    type: 'input',
                    data: 'pronouns',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Discord',
                    type: 'input',
                    data: 'discord',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Twitch',
                    type: 'input',
                    data: 'twitch',
                    submit: (value) => {
                        return value;
                    },
                },{
                    name: 'Twitter',
                    type: 'input',
                    data: 'twitter',
                    submit: (value) => {
                        return value;
                    },
                },{
                    name: 'YouTube',
                    type: 'input',
                    data: 'youtube',
                    submit: (value) => {
                        return value;
                    },
                },{
                    name: 'Notes',
                    type: 'input',
                    data: 'notes',
                    submit: (value) => {
                        return value;
                    },
                }],
            });
        }
        resolve();
    })
}