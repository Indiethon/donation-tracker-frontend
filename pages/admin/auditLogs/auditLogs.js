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
            singularName: 'Audit Log',
            pluralName: 'Audit Logs',
            model: 'auditLog',
            url: '/admin/dashboard/auditLogs',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'auditLog',
                endpoint: `${config.apiUrl}/auditLog`,
                table: [{
                    name: 'Timestamp',
                    textFunction: (value) => {
                        return new Date(value.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    }
                }, {
                    name: 'User',
                    textFunction: (value) => {
                        if (value.userId) return value.userId;
                        else return 'API Token'
                    }
                }, {
                    name: 'Model',
                    data: 'modelName',
                },  {
                    name: 'Resource',
                    textFunction: (value) => {
                        return value.resourceId;
                    }
                }, {
                    name: 'Action',
                    data: 'action',
                }]
            })
        }

        else {
            await generateForm({
                name: 'Audit Log',
                model: 'auditLog',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/auditLog`,
            });
        }
        resolve();
    })
}