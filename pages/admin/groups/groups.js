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
            singularName: 'Group',
            pluralName: 'Groups',
            model: 'group',
            url: '/admin/dashboard/groups',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'group',
                endpoint: `${config.apiUrl}/group`,
                table: [{
                    name: 'Name',
                    data: 'name',
                    priority: 1,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Group',
                model: 'group',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/group`,
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
                    name: 'Permissions',
                    type: 'array',
                    data: 'permissions',
                    array: [{
                        name: 'Component',
                        type: 'select',
                        data: 'model',
                        options: {
                            ad: 'Ad',
                            auditLog: 'Audit Log',
                            charity: 'Charity',
                            donation: 'Donation',
                            donor: 'Donor',
                            drawPrizes: 'Draw Prizes',
                            emailAddress: 'Email Addresses',
                            emailTemplate: 'Email Templates',
                            event: 'Event',
                            group: 'Group',
                            incentive: 'Incentive',
                            prize: 'Prize',
                            prizeRedemption: 'Prize Redemption',
                            run: 'Run',
                            runner: 'Runner',
                            sendPrizeEmails: 'Send Prize Emails',
                            user: 'User',
                            wordFilter: 'Word Filter',
                        }
                    }, {
                        name: 'Access Level',
                        type: 'select',
                        data: 'level',
                        options: {
                            none: 'None',
                            access: 'Basic',
                            read: 'Read',
                            modify: 'Modify',
                            full: 'Full',
                        }
                    }],
                    required: true,
                    submit: (value) => {
                        let fields = value.querySelectorAll('.array.childDiv');
                        let data = [];
                        for (const field of fields) {
                            let inputs = field.querySelectorAll('select');
                            data.push({
                                model: inputs[0].value,
                                level: inputs[1].value,
                            })
                        }
                        return data;
                    },
                }],
            });
        }
        resolve();
    })
}