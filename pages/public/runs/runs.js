async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        if (!window.location.pathname.includes('run')) return reject();

        const timezone = new window.Intl.DateTimeFormat().resolvedOptions().timeZone;
        try { document.querySelector('.timezone-text.bottom').innerHTML = `Detected Timezone: ${timezone}`; } catch {}

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        await generateTable({
            event: urlParams.get('event'),
            url: `${config.apiUrl}/run?eventId=${urlParams.get('event')}&populate=runner`,
            dateMode: true,
            dateData: 'startTime',
            table: [{
                name: 'Game',
                data: 'game',
            }, {
                name: 'Category',
                data: 'category',
            }, {
                name: 'Players',
                textFunction: (value) => {
                    let runnerList = [];
                    for (const runner of value.runners) {
                        runnerList.push(runner.name)
                    }
                    return runnerList.join(', ');
                }
            }, {
                name: 'Start Time',
                textFunction: (value) => {
                    if (value.actualStartTime) return new Date(value.actualStartTime).toLocaleString([], {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        seconds: undefined
                    })
                    return new Date(value.startTime).toLocaleString([], {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        seconds: undefined
                    })
                }
            }, {
                name: 'Estimate',
                data: 'estimate',
            }, {
                name: 'Final Time',
                textFunction: (value) => {

                    if (value.finalTime && value.finalTime.length > 0) return value.finalTime;
                    return '';
                }
            }],
            // clickFunction: (value) => {
            //     return `location.href = '/runs/${value.id}'`
            // },
            rowAttribute: [{
                name: 'runId',
                data: '_id'
            }]
        })
        return resolve();
    })
}

async function showCurrentRunInfo() {
    
}