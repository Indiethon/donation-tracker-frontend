// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        await setPageHeaders({
            singularName: 'Incentive',
            pluralName: 'Incentives',
            model: 'incentive',
            url: '/volunteer/dashboard/incentives',
            buttons: ['Active', 'Completed', 'All']
        });

        connectToWebsocket();
        await createTable();
        setRowVisibility(1);

        resolve();
    })
}

async function connectToWebsocket() {
    let firstMessage = false;
    GET(`${config.apiUrl}/websocket/start`)

    let websocketUrl;
    if (config.apiUrl.includes('https://')) websocketUrl = config.apiUrl.replace('https://', 'wss://')
    else websocketUrl = config.apiUrl.replace('http://', 'ws://')

    const ws = new WebSocket(`${websocketUrl}/websocket/data`);

    ws.onopen = () => {
        console.log('Connected to websocket!')
        showToast('success', `Connected to donation websocket!`)
    }

    ws.onmessage = (event) => {
        if (!firstMessage) return firstMessage = true;
        createTable();
    };
    ws.onclose = () => {
        console.error('Websocket connection closed. Attemping to reconnect...');
        showToast('error', `Disconnected from donation websocket. Attempting to reconnect...`)
        setTimeout(() => {
            connectToWebsocket();
        }, 1000);
    }
}

async function createTable() {
    return new Promise(async (resolve, reject) => {
        await generateTable({
            model: 'incentive',
            endpoint: `${config.apiUrl}/incentive/stats`,
            event: details.activeEvent.short,
            populate: ['run'],
            volunteer: true,
            table: [{
                name: 'Name',
                data: 'name',
            }, {
                name: 'Run',
                textFunction: (value) => {
                    return value.run.game;
                }
            }, {
                name: 'Total Raised',
                textFunction: (value) => {
                    return `${details.currencySymbol}${value.stats.total.toFixed(2)}`
                },
            }, {
                name: 'Goal',
                textFunction: (value) => {
                    if (value.type === 'bidwar') return '(None)';
                    return `${details.currencySymbol}${value.goal.toFixed(2)}`
                }
            }],
            rowAttribute: (value) => {
                return !(!value.completed && value.active);
            },
            rowFunction: (value) => {
                if (value.active || value.completed) return true;
                return false;
            },
            clickFunction: (value) => {
                return `expandRow("${value._id}")`;
            },
            subTable: [{
                name: 'Type',
                textFunction: (value) => {
                    if (value.type === 'bidwar') return 'Bidwar';
                    return 'Target'
                }

            }, {
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
            },{
                name: 'Options',
                textFunction: (value) => {
                    let incentiveHtml = '';
                    for (let i = 0; i < value.options.length; i++) {
                        console.log(value)
                        incentiveHtml += `
                        <b>Name:</b> ${value.options[i].name}<br>
                        <b>Total:</b> ${details.currencySymbol}${value.stats.options[value.options[i]._id].toFixed(2)}<br>
                        <b>User Option:</b> ${(value.options[i].userOption) ? 'Yes' : 'No'}<br>
                        `;
                        if (i < value.options.length - 1) incentiveHtml += `<br>`
                    }
                    return incentiveHtml;
                },
            },{
                name: 'User Options',
                textFunction: (value) => {
                    return `
                    <b>Allowed: </b>${(value.allowUserOptions) ? 'Yes' : 'No'}</br>
                    <b>Max Length: </b>${(value.allowUserOptions) ? value.userOptionMaxLength : 'Not Applicable'}
                    `
                },
            },{
                name: 'Status',
                textFunction: (value) => {
                    console.log(value)
                    if (value.active) return 'Open';
                    return 'Closed'
                }

            },
            ],
            subTableButtons: [{
                name: 'Close Incentive',
                actionFunction: (value) => {
                    return `setIncentiveActiveStatus('${value._id}', false)`
                }
            }, {
                name: 'Open Incentive',
                actionFunction: (value) => {
                    return `setIncentiveActiveStatus('${value._id}', true)`
                }
            }]
        }, true)
        resolve();
    })
}

function setRowVisibility(element, reset) {
    if (!reset) {
        let buttons = document.querySelectorAll('.content-header-section .dashboard-button');
        for (let button of buttons) {
            button.classList.add('outline');
        }
        document.querySelector(`.table-button-${element}`).classList.remove('outline');
    }
    else {
        if (!document.querySelector(`.table-button-1`).classList.contains('outlune')) element = 1;
        else if (!document.querySelector(`.table-button-2`).classList.contains('outlune')) element = 2;
        else if (!document.querySelector(`.table-button-3`).classList.contains('outlune')) element = 3;
    }

    let subTableRows = document.querySelectorAll('.subTableRow.active');
    for (let subTableRow of subTableRows) {
        subTableRow.classList.remove('active');
    }

    let rows = document.querySelectorAll('table tbody tr');
    for (let row of rows) {
        if (element === 1) {
            if (row.getAttribute('rowAttr') === 'false') row.style.display = 'table-row';
            else row.style.display = 'none';
        }
        else if (element === 2) {
            if (row.getAttribute('rowAttr') === 'true') row.style.display = 'table-row';
            else row.style.display = 'none';
        }
        else {
            row.style.display = 'table-row'
        }
    }
}