async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        if (!window.location.pathname.includes('donation')) return reject();

        const timezone = new window.Intl.DateTimeFormat().resolvedOptions().timeZone;
        try { document.querySelector('.timezone-text.bottom').innerHTML = `Detected Timezone: ${timezone}`; } catch {}

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const data = await generateTable({
            event: urlParams.get('event'),
            url: `${config.apiUrl}/donation/paginate?eventId=${urlParams.get('event')}&completed=true&visible=true&verified=true&page=${(urlParams.get('page') ? urlParams.get('page') : '1')}`,
            donationData: true,
            table: [{
                name: 'Alias',
                data: 'alias',
            }, {
                name: 'Time Received',
                textFunction: (value) => {
                    return new Date(value.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                }
            }, {
                name: 'Amount',
                textFunction: (value) => {
                    return `${details.currencySymbol}${value.amount.toFixed(2)}`;
                }
            }, {
                name: 'Comment',
                textFunction: (value) => {
                    if (value.comment.length > 0) return 'Yes';
                    return 'No';
                }
            }],
            // clickFunction: (value) => {
            //     return `location.href = '/donations?id=${value.id}'`
            // }

        })

        if (urlParams.get('page') && parseInt(urlParams.get('page')) > data.totalPages) {
            changePath(`/donations?event=${urlParams.get('event')}&page=${data.totalPages}`)
            return reject();
        }

        document.querySelector('.pagination-num-start').innerHTML = data.indexStart + 1;
        document.querySelector('.pagination-num-end').innerHTML = data.indexEnd;
        document.querySelector('.pagination-num-total').innerHTML = data.total;
        document.querySelector('.pagination-page-input').value = (urlParams.get('page') ? urlParams.get('page') : 1);
        document.querySelector('.pagination-page-input').max = data.totalPages;
        document.querySelector('.pagination-page-total').innerHTML = data.totalPages;

        let donationStats = await GET(`${config.apiUrl}/event/stats?short=${urlParams.get('event')}`);
        document.querySelector('.donation-total').innerHTML = `${details.currencySymbol}${donationStats.data[0].stats.total}`
        document.querySelector('.donation-count').innerHTML = `${donationStats.data[0].stats.count}`
        document.querySelector('.donation-max').innerHTML = `${details.currencySymbol}${donationStats.data[0].stats.max}`
        document.querySelector('.donation-average').innerHTML = `${details.currencySymbol}${donationStats.data[0].stats.avg}`
        document.querySelector('.donation-median').innerHTML = `${details.currencySymbol}${donationStats.data[0].stats.median}`
        return resolve();
    })
}