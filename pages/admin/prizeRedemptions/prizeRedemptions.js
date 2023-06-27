// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        let mode = urlParams.get('mode');
        let id = urlParams.get('id');
        let event = urlParams.get('event')

        generateEventList(details.eventList)

        await setPageHeaders({
            singularName: 'Prize Redemption',
            pluralName: 'Prize Redemptions',
            model: 'prizeRedemption',
            url: '/admin/dashboard/prizeRedemptions',
            mode: mode,
            id: id,
            event: event,
            eventName: details.eventList.find(x => x.short === event).name,
        });

        if (!mode) {
            await generateTable({
                model: 'prizeRedemption',
                endpoint: `${config.apiUrl}/prizeRedemption`,
                event: event,
                populate: ['donor', 'prize'],
                table: [{
                    name: 'Prize Name',
                    textFunction: (data) => {
                       return data.prize.name;
                    },
                    priority: 1
                }, {
                    name: 'Winner',
                    textFunction: (data) => {
                       return data.donor.alias[0]
                    },
                    priority: 1
                }, {
                    name: 'Status',
                    data: 'status',
                    priority: 1,
                }, {
                    name: 'Expiry Time',
                    textFunction: (data) => {
                        if (data.expiryTimestamp === undefined) return '';
                        return new Date(data.expiryTimestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 2,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Prize Redemption',
                model: 'prizeRedemption',
                type: mode,
                id: id,
                event: event,
                endpoint: `${config.apiUrl}/prizeRedemption`,
                populate: ['donor'],
                datalist: {
                    donorDatalist: {
                        endpoint: `${config.apiUrl}/donor`,
                        textFunction: (value) => {
                            return `${value.alias[0]} (${value.email})`
                        },
                    },
                    prizeDatalist: {
                        endpoint: `${config.apiUrl}/prize?event=${event}`,
                        textFunction: (value) => {
                            return value.name
                        },
                    },
                    emailTemplateDatalist: {
                        endpoint: `${config.apiUrl}/emailTemplate`,
                        textFunction: (value) => {
                            return value.name
                        },
                    },
                    emailAddressDatalist: {
                        endpoint: `${config.apiUrl}/emailAddress`,
                        textFunction: (value) => {
                            return value.name
                        },
                    },
                },
                form: [{
                    name: 'Prize',
                    type: 'input',
                    textFunction: (data) => {
                        return data.prize.name
                    },
                    required: true,
                    attributes: {
                        list: 'prizeDatalist',
                    },
                    submit: async (value) => {
                        let prizeList = document.querySelectorAll('#prizeDatalist option');
                        for (const option of prizeList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return undefined;
                    },
                }, {
                    name: 'Winner',
                    type: 'input',
                    textFunction: (data) => {
                        return data.donor.alias[0]
                    },
                    required: true,
                    attributes: {
                        list: 'donorDatalist',
                    },
                    submit: async (value) => {
                        let donorList = document.querySelectorAll('#donorDatalist option');
                        for (const option of donorList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return undefined;
                    },
                }, {
                    name: 'Claim Email Template',
                    type: 'input',
                    textFunction: (data) => {
                        return data.emailTemplate.name
                    },
                    attributes: {
                        list: 'emailTemplateDatalist',
                    },
                    submit: async (value) => {
                        let emailTemplateList = document.querySelectorAll('#emailTemplateDatalist option');
                        for (const option of emailTemplateList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return undefined;
                    },
                }, {
                    name: 'Claim Email Address',
                    type: 'input',
                    textFunction: (data) => {
                        return data.emailAddress.name
                    },
                    attributes: {
                        list: 'emailAddressDatalist',
                    },
                    submit: async (value) => {
                        let emailAddressList = document.querySelectorAll('#emailAddressDatalist option');
                        for (const option of emailAddressList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return undefined;
                    },
                }, {
                    name: 'Status',
                    type: 'select',
                    data: 'status',
                    required: true,
                    options: {
                        pending: 'Pending',
                        claimed: 'Claimed',
                        forfeited: 'Forfeited',
                        expired: 'Expired'
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Email Timestamp',
                    type: 'datetime-local',
                    data: 'emailTimestamp',
                    textFunction: (eventData) => {
                        try {
                        let time = new Date(eventData.emailTimestamp)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16); } catch { return '' }
                    },
                    required: true,
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = value }
                        return time;
                    },
                }, {
                    name: 'Response Timestamp',
                    type: 'datetime-local',
                    data: 'responseTimestamp',
                    textFunction: (eventData) => {
                        try { let time = new Date(eventData.responseTimestamp)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16);
                        } catch { return '' }
                    },
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = value }
                        return time;
                    },
                }, {
                    name: 'Expiry Timestamp',
                    type: 'datetime-local',
                    data: 'expiryTimestamp',
                    textFunction: (eventData) => {
                        let time = new Date(eventData.expiryTimestamp)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16);
                    },
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = value }
                        return time;
                    },
                }],
                other: [{
                    data: 'eventId',
                    submit: () => {
                        return details.eventList.find(x => x.short === event).id;
                    },
                }]
            });
        }
        resolve();
    })
}