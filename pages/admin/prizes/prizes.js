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
            singularName: 'Prize',
            pluralName: 'Prizes',
            model: 'prize',
            url: '/admin/dashboard/prizes',
            mode: mode,
            id: id,
            event: event,
            eventName: details.eventList.find(x => x.short === event).name,
        });

        if (!mode) {
            await generateTable({
                model: 'prize',
                endpoint: `${config.apiUrl}/prize`,
                event: event,
                table: [{
                    name: 'Name',   
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Type',
                    data: 'type',
                    priority: 3,
                }, {
                    name: 'Min Donation',
                    data: 'minDonation',
                    priority: 3,
                }, {
                    name: 'Start Time',
                    textFunction: (eventData) => {
                        return new Date(eventData.startTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 4,
                }, {
                    name: 'End Time',
                    textFunction: (eventData) => {
                        return new Date(eventData.endTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 4,
                }, {
                    name: 'Number of Winners',
                    data: 'numWinners',
                    priority: 3,
                }, {
                    name: 'Visible',
                    data: 'visible',
                    priority: 2,
                }, {
                    name: 'Active',
                    data: 'active',
                    priority: 1,
                }, {
                    name: 'Drawn',
                    data: 'drawn',
                    priority: 2,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Prize',
                model: 'prize',
                type: mode,
                id: id,
                event: event,
                endpoint: `${config.apiUrl}/prize`,
                populate: ['donor'],
                datalist: {
                    donorDatalist: {
                        endpoint: `${config.apiUrl}/donor`,
                        textFunction: (value) => {
                            return `${value.alias[0]} (${value.email})`
                        },
                    },
                },
                form: [{
                    name: 'Name',
                    type: 'input',
                    data: 'name',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Description',
                    type: 'input',
                    data: 'description',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Type',
                    type: 'select',
                    data: 'type',
                    required: true,
                    options: {
                        digital: 'Digital',
                        physical: 'Physical',
                    },
                    attributes: {
                        onClick: 'updatePrizeType()',
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Minimum Donation',
                    type: 'number',
                    data: 'minDonation',
                    required: true,
                    attributes: {
                        min: 0.01,
                        step: 0.01,
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Number Of Winners',
                    type: 'number',
                    data: 'numWinners',
                    required: true,
                    attributes: {
                        min: 1,
                        step: 1,
                        onChange: 'updateNumWinners(this.value)',
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Value',
                    type: 'number',
                    data: 'value',
                    required: true,
                    attributes: {
                        min: 0.01,
                        step: 0.01,
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Start Time',
                    type: 'datetime-local',
                    data: 'startTime',
                    textFunction: (eventData) => {
                        let time = new Date(eventData.startTime)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16);
                    },
                    required: true,
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = value }
                        return time;
                    },
                }, {
                    name: 'End Time',
                    type: 'datetime-local',
                    data: 'endTime',
                    textFunction: (value) => {
                        let time = new Date(value.endTime)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16);
                    },
                    required: true,
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = value }
                        return time;
                    },
                }, {
                    name: 'Image',
                    type: 'input',
                    data: 'image',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Alt Image',
                    type: 'input',
                    data: 'altImage',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Contributor',
                    type: 'input',
                    data: 'contributor',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Winners',
                    type: 'array',
                    data: 'winners',
                    array: [{
                        name: 'Winner',
                        type: 'input',
                        textFunction: (value) => {
                            return value.alias[0]
                        },
                        attributes: {
                            list: 'donorDatalist',
                        }
                    }],
                    required: false,
                    submit: async (value) => {
                        let fields = value.querySelectorAll('.array.childDiv');
                        let donorList = document.querySelectorAll('#donorDatalist option');
                        let data = [];
                        for (const field of fields) {
                            for (const option of donorList) {
                                if (option.getAttribute('value') === field.querySelector('input').value) data.push(option.getAttribute('dataId'));
                            }
                        }
                        return data;
                    },
                }, {
                    name: 'Redemption Codes',
                    type: 'array',
                    data: 'redemptionCode',
                    array: [{
                        name: 'Redemption Code',
                        type: 'input',
                        textFunction: (value) => {
                            return value
                        },
                    }],
                    required: false,
                    submit: (value) => {
                        let fields = value.querySelectorAll('.array.childDiv');
                        let data = [];
                        for (const field of fields) {
                            data.push(field.querySelector('input').value)
                        }
                        return data;
                    },
                }, {
                    name: 'Visible',
                    type: 'checkbox',
                    data: 'visible',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Active',
                    type: 'checkbox',
                    data: 'active',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Drawn',
                    type: 'checkbox',
                    data: 'drawn',
                    submit: (value) => {
                        return value;
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