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
            singularName: 'Event',
            pluralName: 'Events',
            model: 'event',
            url: '/admin/dashboard/events',
            mode: mode,
            id: id
        });

        if (!mode) {
            await generateTable({
                model: 'event',
                endpoint: `${config.apiUrl}/event`,
                populate: ['charity'],
                table: [{
                    name: 'Name',
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Short',
                    data: 'short',
                    priority: 2,
                }, {
                    name: 'Charity',
                    textFunction: (eventData) => {
                        return eventData.charity.name
                    },
                    priority: 3,
                }, {
                    name: 'Target',
                    data: 'targetAmount',
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
                    name: 'Visible',
                    data: 'visible',
                    priority: 2,
                }, {
                    name: 'Active',
                    data: 'active',
                    priority: 1,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Event',
                model: 'event',
                type: mode,
                id: id,
                endpoint: `${config.apiUrl}/event`,
                populate: ['charity'],
                datalist: {
                    charityDatalist: {
                        endpoint: `${config.apiUrl}/charity`,
                        textFunction: (charityData) => {
                            return charityData.name;
                        },
                    },
                },
                form: [{
                    name: 'Name',
                    type: 'input',
                    data: 'name',
                    required: true,
                    attributes: {
                        maxLength: 60,
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Short',
                    type: 'input',
                    data: 'short',
                    required: true,
                    attributes: {
                        maxLength: 10,
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Description',
                    type: 'input',
                    data: 'description',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                },
                {
                    name: 'Hashtag',
                    type: 'input',
                    data: 'hashtag',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Charity',
                    type: 'input',
                    data: 'charityId',
                    textFunction: (eventData) => {
                        return eventData.charity.name
                    },
                    required: true,
                    attributes: {
                        list: 'charityDatalist',
                    },
                    submit: async (value) => {
                        let charityList = document.querySelectorAll('#charityDatalist option');
                        for (const option of charityList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return undefined;
                    },
                }, {
                    name: 'Target',
                    type: 'number',
                    data: 'targetAmount',
                    required: true,
                    attributes: {
                        min: 0.01,
                        step: 0.01
                    },
                    submit: (value) => {
                        return +parseFloat(value).toFixed(2);
                    },
                }, {
                    name: 'Minimum Donation',
                    type: 'number',
                    data: 'minDonation',
                    required: true,
                    attributes: {
                        min: 0.01,
                        step: 0.01
                    },
                    submit: (value) => {
                        return +parseFloat(value).toFixed(2);
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
                    textFunction: (eventData) => {
                        let time = new Date(eventData.endTime)
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
                    name: 'Prize Draw Time',
                    type: 'datetime-local',
                    data: 'prizeTime',
                    textFunction: (eventData) => {
                        let time = new Date(eventData.prizeTime)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16);
                    },
                    required: false,
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = "" }
                        return time;
                    },
                },
                // {
                //     name: 'Custom Data',
                //     type: 'array',
                //     data: [],
                //     reqired: false,
                // }, {
                {
                    name: 'Donation Auto Screen',
                    type: 'checkbox',
                    data: 'autoScreen',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Visible',
                    type: 'checkbox',
                    data: 'visible',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Active',
                    type: 'checkbox',
                    data: 'active',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }],
                submit: () => {
                    return 'submitted!';
                },
            });
        }
        resolve();
    })
}