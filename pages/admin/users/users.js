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
            singularName: 'User',
            pluralName: 'Users',
            model: 'user',
            url: '/admin/dashboard/users',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'user',
                endpoint: `${config.apiUrl}/user`,
                populate: ['group'],
                table: [{
                    name: 'Username',
                    data: 'username',
                    priority: 1,
                }, {
                    name: 'Group',
                    data: 'groupId',
                    textFunction: (value) => {
                        if (value.group !== undefined && value.group !== null) return value.group.name;
                        return '';
                    },
                    priority: 4,
                }, {
                    name: 'Admin',
                    data: 'admin',
                    priority: 2,
                }, {
                    name: 'Superuser',
                    data: 'superuser',
                    priority: 2,
                }, {
                    name: 'Volunteer',
                    data: 'volunteer',
                    priority: 2,
                }, {
                    name: 'Last Login',
                    data: 'lastLogin',
                    textFunction: (value) => {
                        return new Date(value.lastLogin).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 1,
                },]
            })
        }

        else {
            await generateForm({
                name: 'User',
                model: 'user',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/user`,
                populate: ['group'],
                datalist: {
                    groupDatalist: {
                        endpoint: `${config.apiUrl}/group`,
                        textFunction: (value) => {
                            return value.name;
                        },
                    },
                },
                form: [{
                    name: 'Username',
                    type: 'input',
                    data: 'username',
                    required: true,
                    attributes: {
                        maxLength: 60,
                    },
                    submit: (value) => {
                        return value;
                    },
                },  {
                    name: 'First Name',
                    type: 'input',
                    data: 'firstName',
                    submit: (value) => {
                        return value;
                    },
                },  {
                    name: 'Last Name',
                    type: 'input',
                    data: 'lastName',
                    submit: (value) => {
                        return value;
                    },
                },  {
                    name: 'Email',
                    type: 'input',
                    data: 'email',
                    submit: (value) => {
                        return value;
                    },
                },  {
                    name: 'Group',
                    type: 'input',
                    data: 'groupId',
                    textFunction: (value) => {
                        if (value.group !== undefined && value.group !== null) return value.group.name
                        return '';
                    },
                    attributes: {
                        list: 'groupDatalist',
                    },
                    submit: async (value) => {
                        let groupList = document.querySelectorAll('#groupDatalist option');
                        for (const option of groupList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return null;
                    },
                }, {
                    name: 'Admin',
                    type: 'checkbox',
                    data: 'admin',
                    submit: (value) => {
                        return value;
                    },
                },{
                    name: 'Superuser',
                    type: 'checkbox',
                    data: 'superuser',
                    submit: (value) => {
                        return value;
                    },
                },  {
                    name: 'Volunteer',
                    type: 'checkbox',
                    data: 'volunteer',
                    submit: (value) => {
                        return value;
                    },
                }],
            });
        }
        resolve();
    })
}