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
            singularName: 'Incentive',
            pluralName: 'Incentives',
            model: 'incentive',
            url: '/admin/dashboard/incentives',
            mode: mode,
            id: id,
            event: event,
            eventName: details.eventList.find(x => x.short === event).name,
        });

        if (!mode) {
            await generateTable({
                model: 'incentive',
                endpoint: `${config.apiUrl}/incentive`,
                event: event,
                populate: ['run'],
                table: [{
                    name: 'Name',   
                    data: 'name',
                    priority: 1,
                }, {
                    name: 'Run',
                    textFunction: (value) => {
                        if (value.run !== undefined && value.run !== null) return value.run.game + ' ' + value.run.category;
                        else return '';
                    },
                    priority: 4,
                }, {
                    name: 'Type',
                    data: 'type',
                    priority: 3,
                }, {
                    name: 'Start Time',
                    textFunction: (eventData) => {
                        return new Date(eventData.startTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 5,
                }, {
                    name: 'End Time',
                    textFunction: (eventData) => {
                        return new Date(eventData.endTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 5,
                }, {
                    name: 'Visible',
                    data: 'visible',
                    priority: 2,
                }, {
                    name: 'Active',
                    data: 'active',
                    priority: 2,
                }, {
                    name: 'Completed',
                    data: 'completed',
                    priority: 1,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Incentive',
                model: 'incentive',
                type: mode,
                id: id,
                event: event,
                endpoint: `${config.apiUrl}/incentive`,
                populate: ['run'],
                datalist: {
                    runDatalist: {
                        endpoint: `${config.apiUrl}/run?event=${event}`,
                        textFunction: (value) => {
                            return value.game + ' ' + value.category;
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
                    name: 'Speedrun',
                    type: 'input',
                    data: 'runId',
                    required: true,
                    attributes: {
                        list: 'runDatalist',
                    },
                    textFunction: (value) => {
                        if (value.run !== null) return value.run.game + ' ' + value.run.category;
                        else return '';
                    },
                    submit: async (value) => {
                        let runList = document.querySelectorAll('#runDatalist option');
                        for (const option of runList) {
                            if (option.getAttribute('value') === value) return option.getAttribute('dataId');
                        }
                        return null;
                    },
                }, {
                    name: 'Type',
                    type: 'select',
                    data: 'type',
                    required: true,
                    options: {
                        target: 'Target',
                        bidwar: 'Bidwar',
                    },
                    attributes: {
                        onClick: 'changeType()',
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Options',
                    type: 'array',
                    data: 'options',
                    array: [{
                        name: 'Option',
                        type: 'input',
                        textFunction: (value, element) => {
                            element.setAttribute('dataId', value._id)
                            return value.name;
                        },
                    }],
                    submit: (value) => {
                        if (document.querySelector('#type select').value === 'target') return;
                        let fields = value.querySelectorAll('.array.childDiv');
                        let data = [];
                        for (const field of fields) {
                            if (field.querySelector('input').getAttribute('dataId') !== null) data.push({ _id: field.querySelector('input').getAttribute('dataId'), name: field.querySelector('input').value });
                            else data.push({ name: field.querySelector('input').value });
                        }
                        return data;
                    },
                }, {
                    name: 'Allow User Options',
                    type: 'checkbox',
                    data: 'allowUserOptions',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'User Option Max Length',
                    type: 'number',
                    data: 'userOptionMaxLength',
                    attributes: {
                        min: 1,
                        step: 1,
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Goal',
                    type: 'number',
                    data: 'goal',
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
                    name: 'Notes',
                    type: 'input',
                    data: 'notes',
                    submit: (value) => {
                        return value;
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
                    name: 'Completed',
                    type: 'checkbox',
                    data: 'completed',
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