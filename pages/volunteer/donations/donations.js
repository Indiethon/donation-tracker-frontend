// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        await setPageHeaders({
            singularName: 'Donation',
            pluralName: 'Donations',
            model: 'donation',
            url: '/volunteer/dashboard/donations',
            buttons: ['Unread', 'Read', 'All']
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
            model: 'donation',
            endpoint: `${config.apiUrl}/donation`,
            event: details.activeEvent.short,
            populate: ['donor', 'incentive'],
            volunteer: true,
            table: [{
                name: 'Timestamp',
                textFunction: (value) => {
                    return new Date(value.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                },
                priority: 3,
            }, {
                name: 'Alias',
                data: 'alias',
                priority: 1,
            }, {
                name: 'Amount',
                textFunction: (value) => {
                    return `${details.currencySymbol}${value.amount.toFixed(2)}`
                },
                priority: 1,
            }, {
                name: 'Comment',
                textFunction: (value) => {
                    if (value.comment.length > 0) return 'Yes';
                    return 'No';
                },
                priority: 1,
            }, {
                name: 'Incentives',
                textFunction: (value) => {
                    if (value.incentives.length > 0) return 'Yes';
                    return 'No';
                },
                priority: 1,
            }],
            rowAttribute: (value) => {
                if (value.read || !value.visible) return true;
                return false;
            },
            rowFunction: (value) => {
                return value.completed;
            },
            clickFunction: (value) => {
                return `expandRow("${value._id}")`;
            },
            subTable: [{
                name: 'Comment',
                textFunction: (value) => {
                    if (value.comment.length > 0) return value.comment;
                    return 'No comment.'
                },
            }, {
                name: 'Incentives',
                textFunction: (value) => {
                    let incentiveHtml = '';
                    for (let i = 0; i < value.incentives.length; i++) {
                        console.log(value)
                        incentiveHtml += `
                        <b>Incentive ${i + 1}</b><br>
                        <b>Name:</b> ${value.incentives[i].incentiveId.name}<br>
                        <b>Amount:</b> ${value.incentives[i].amount}<br>
                        `;
                        if (value.incentives[i].option) {
                            let optionName = value.incentives[i].incentiveId.options.find(x => x._id === value.incentives[i].option)
                            incentiveHtml += `
                            <b>Option:</b> ${optionName.name}<br>
                            `
                        }
                        if (i < value.incentives.length - 1) incentiveHtml += `<br>`
                    }
                    return incentiveHtml;
                },
            },
            ],
            subTableButtons: [{
                name: 'Mark as Read',
                actionFunction: (value) => {
                    return `markDonationAsRead('${value._id}')`
                }
            }, {
                name: 'Hide from Tracker',
                actionFunction: (value) => {
                    return `hideDonation('${value._id}')`
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