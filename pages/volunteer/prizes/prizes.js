// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        await setPageHeaders({
            singularName: 'Prize',
            pluralName: 'Prizes',
            model: 'prize',
            url: '/volunteer/dashboard/prizes',
        });

        await createTable();

        resolve();
    })
}

async function createTable() {
    return new Promise(async (resolve, reject) => {
        await generateTable({
            model: 'prize',
            endpoint: `${config.apiUrl}/prize`,
            event: details.activeEvent.short,
            volunteer: true,
            table: [{
                name: 'Name',
                data: 'name',
            }, {
                name: 'Contributor',
                data: 'contributor'
            }, {
                name: 'Min. Donation',
                textFunction: (value) => {
                    return `${details.currencySymbol}${value.minDonation.toFixed(2)}`
                },
            }, {
                name: 'Type',
                textFunction: (value) => {
                    return value.type.charAt(0).toUpperCase() + value.type.slice(1);
                }
            }],
            rowFunction: (value) => {
                return value.active
            },
            clickFunction: (value) => {
                return `expandRow("${value._id}")`;
            },
            subTable: [{
                name: 'Description',
                textFunction: (value) => {
                    return value.description
                },
            },
            {
                name: 'End Time',
                textFunction: (value) => {
                    return new Date(value.endTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                },
            }, {
                name: 'Number of Winners',
                textFunction: (value) => {
                    return value.numWinners
                },
            }, {
                name: 'Image',
                textFunction: (value) => {
                    return `<img class="table-prize-img" src="${value.image}"></img>`
                }

            },
            ]
        }, true)
        resolve();
    })
}