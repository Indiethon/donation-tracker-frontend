async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        if (!window.location.pathname.includes('incentive')) return reject();

        const timezone = new window.Intl.DateTimeFormat().resolvedOptions().timeZone;
        try { document.querySelector('.timezone-text.bottom').innerHTML = `Detected Timezone: ${timezone}`; } catch { }

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        await generateTable({
            event: urlParams.get('event'),
            url: `${config.apiUrl}/incentive/stats?eventId=${urlParams.get('event')}&populate=run`,
            table: [{
                name: 'Name',
                textFunction: (value) => {
                    if (value.type === 'target') return value.name;
                    return `${value.name}<br>
                        <button class="tableOptionsButton" incentiveid=${value._id} onClick="showOptionsSubtable(this)">Show Options</button>
                    `
                }
            }, {
                name: 'Run',
                textFunction: (value) => { return value.run.game; }
            }, {
                name: 'Description',
                data: 'description'
            }, {
                name: 'Total',
                textFunction: (value) => {
                    return `${details.currencySymbol}${value.stats.total.toFixed(2)}`
                }
            }, {
                name: 'Goal',
                textFunction: (value) => {
                    if (value.type === 'bidwar') return '(None)';
                    return `${details.currencySymbol}${value.goal.toFixed(2)}`
                }
            }],
            // clickFunction: (value) => {
            //     return `location.href = '/incentives/${event}/${value.id}'`
            // },
            subTableData: 'options',
            subTableFunction: (value) => {
                if (value.type === 'bidwar') return true;
                return false;
            },
            subTable: [{
                name: 'Option',
                data: 'name',
            }, {
                name: 'Amount',
                textFunction: (tableData, value) => {
                    return `${details.currencySymbol}${tableData.stats.options[value._id].toFixed(2)}`
                }
            }, {
                name: 'User Option',
                textFunction: (tableData, value) => {
                    if (value.userOption) return 'Yes';
                    return 'No';
                }
            }],
            rowFunction: (incentive) => {
                return incentive.visible
            }
        })
        return resolve();
    })
}