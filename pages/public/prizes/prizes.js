async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        if (!window.location.pathname.includes('prize')) return reject();

        try { document.querySelector('.sweepstakes-rules-link').href = config.sweepstakesRules; } catch { }

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        await generateTable({
            event: urlParams.get('event'),
            url: `${config.apiUrl}/prize?eventId=${urlParams.get('event')}&populate=donor`,
            table: [{
                name: 'Name',
                data: 'name',
            }, {
                name: 'Contributor',
                data: 'contributor'
            }, {
                name: 'Minimum Donation',
                textFunction: (value) => {
                    return `${details.currencySymbol}${value.minDonation.toFixed(2)}`;
                }
            }, {
                name: 'Start Time',
                textFunction: (value) => {
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
                name: 'End Time',
                textFunction: (value) => {
                    return new Date(value.endTime).toLocaleString([], {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        seconds: undefined
                    })
                }
            }, {
                name: 'Type',
                textFunction: (value) => {
                    return value.type.charAt(0).toUpperCase() + value.type.slice(1);
                }
            }, {
                name: 'Winners',
                textFunction: (value) => {
                    let donorList = [];
                    for (const donor of value.winners) {
                        donorList.push(donor.alias[0])
                    }
                    return donorList.join(', ');
                }
            }],
            // clickFunction: (value) => {
            //     return `location.href = '/prizes/${event}/${value.id}'`
            // },
            rowFunction: (prize) => {
                return prize.visible
            },
        })
        return resolve();
    })
}