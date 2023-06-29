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
            singularName: 'Speedrun',
            pluralName: 'Speedruns',
            model: 'run',
            url: '/admin/dashboard/speedruns',
            mode: mode,
            id: id,
            event: event,
            eventName: details.eventList.find(x => x.short === event).name,
        });

        if (!mode) {
            document.querySelector('.oengus-import-button').setAttribute('href', `/admin/dashboard/speedruns/import?event=${event}`)
            document.querySelector('.oengus-import-button').classList.remove('hidden');
            await generateTable({
                model: 'run',
                endpoint: `${config.apiUrl}/run`,
                event: event,
                populate: ['runner'],
                table: [{
                    name: 'Game',
                    data: 'game',
                    priority: 1,
                }, {
                    name: 'Category',
                    data: 'category',
                    priority: 2,
                }, {
                    name: 'Runners',
                    textFunction: (value) => {
                        let runnerList = [];
                        for (const runner of value.runners) {
                            runnerList.push(runner.name)
                        }
                        return runnerList.join(', ');
                    },
                    priority: 1,
                }, {
                    name: 'Estimate',
                    data: 'estimate',
                    priority: 3,
                }, {
                    name: 'Start Time',
                    textFunction: (eventData) => {
                        return new Date(eventData.startTime).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 3,
                }, {
                    name: 'Multiplayer',
                    data: 'multiplayer',
                    priority: 2,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Speedrun',
                model: 'run',
                type: mode,
                id: id,
                event: event,
                endpoint: `${config.apiUrl}/run`,
                populate: ['runner'],
                datalist: {
                    runnerDatalist: {
                        endpoint: `${config.apiUrl}/runner`,
                        textFunction: (value) => {
                            return value.name;
                        },
                    },
                },
                form: [{
                    name: 'Game',
                    type: 'input',
                    data: 'game',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Category',
                    type: 'input',
                    data: 'category',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Runners',
                    type: 'array',
                    data: 'runners',
                    array: [{
                        name: 'Runner',
                        type: 'input',
                        textFunction: (value) => {
                            return value.name
                        },
                        attributes: {
                            list: 'runnerDatalist',
                        }
                    }],
                    required: true,
                    submit: async (value) => {
                        let fields = value.querySelectorAll('.array.childDiv');
                        let runnerList = document.querySelectorAll('#runnerDatalist option');
                        let data = [];
                        for (const field of fields) {
                            for (const option of runnerList) {
                                if (option.getAttribute('value') === field.querySelector('input').value) data.push(option.getAttribute('dataId'));
                            }
                        }
                        return data;
                    },
                }, {
                    name: 'Description',
                    type: 'input',
                    data: 'description',
                    submit: (value) => {
                        return value;
                    },
                },
                {
                    name: 'Release Year',
                    type: 'input',
                    data: 'releaseYear',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Console',
                    type: 'input',
                    data: 'console',
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
                    name: 'Actual Start Time',
                    type: 'datetime-local',
                    data: 'actualStartTime',
                    textFunction: (eventData) => {
                        if (!eventData.actualStartTime) return;
                        let time = new Date(eventData.actualStartTime)
                        time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
                        return time.toISOString().slice(0, 16);
                    },
                    submit: (value) => {
                        let time;
                        try { time = new Date(value).toISOString() } catch { time = value }
                        return time;
                    },
                }, {
                    name: 'Estimate',
                    type: 'input',
                    data: 'estimate',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Setup Time',
                    type: 'input',
                    data: 'setupTime',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Final Time',
                    type: 'input',
                    data: 'finalTime',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Final Setup Time',
                    type: 'input',
                    data: 'finalSetupTime',
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Notes',
                    type: 'input',
                    data: 'notes',
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