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
            singularName: 'Donation',
            pluralName: 'Donations',
            model: 'donation',
            url: '/admin/dashboard/donations',
            mode: mode,
            id: id,
            event: event,
            eventName: details.eventList.find(x => x.short === event).name,
        });

        if (!mode) {
            await generateTable({
                model: 'donation',
                endpoint: `${config.apiUrl}/donation`,
                event: event,
                populate: ['donor'],
                table: [{
                    name: 'Alias',
                    data: 'alias',
                    priority: 1,
                }, {
                    name: 'Email',
                    priority: 4,
                    textFunction: (value) => {
                        try { return value.donor.email; } catch {};
                    }
                }, {
                    name: 'Amount',
                    data: 'amount',
                    priority: 1,
                }, {
                    name: 'Timestamp',
                    textFunction: (value) => {
                        return new Date(value.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', seconds: undefined })
                    },
                    priority: 3,
                }, {
                    name: 'Completed',
                    data: 'completed',
                    priority: 1,
                }, {
                    name: 'Verified',
                    data: 'verified',
                    priority: 2,
                }, {
                    name: 'Visible',
                    data: 'visible',
                    priority: 2,
                }, {
                    name: 'Read',
                    data: 'read',
                    priority: 2,
                }]
            })
        }

        else {
            await generateForm({
                name: 'Donation',
                model: 'donation',
                type: mode,
                id: id,
                event: event,
                endpoint: `${config.apiUrl}/donation`,
                populate: ['donor', 'incentive'],
                datalist: {
                    donorDatalist: {
                        endpoint: `${config.apiUrl}/donor`,
                        textFunction: (value) => {
                            return value.email;
                        }
                    },
                    incentiveDatalist: {
                        endpoint: `${config.apiUrl}/incentive?eventId=${event}`,
                        textFunction: (value) => {
                            return value.name;
                        },
                    },
                },
                form: [{
                    name: 'Donor',
                    type: 'input',
                    data: 'donorId',
                    textFunction: (value) => {
                        return value.donor.email
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
                    name: 'Alias',
                    type: 'input',
                    data: 'alias',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Amount',
                    type: 'number',
                    data: 'amount',
                    required: true,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Comment',
                    type: 'textarea',
                    data: 'comment',
                    attributes: {
                        cols: "3",
                    },
                }, {
                    name: 'Incentives',
                    type: 'array',
                    data: 'incentives',
                    array: [{
                        name: 'Incentive',
                        type: 'input',
                        data: 'incentiveId',
                        required: true,
                        textFunction: (value) => {
                            return value.incentiveId.name;
                        },
                        attributes: {
                            list: 'incentiveDatalist',
                            onChange: 'setDisabled(this)',
                        }
                    }, {
                        name: 'Option',
                        type: 'input',
                        data: 'option',
                        attributes: {
                            disabled: true,
                        },
                        textFunction: async (value, input) => {
                            console.log(value)
                            if (!value.incentiveId || value.incentiveId.options.length <= 0) {
                                input.disabled = true;
                                return '';
                            }
                            input.disabled = false;
                            input.setAttribute('list', `incentiveOptions${value.incentiveId._id}`)
                            let option = value.incentiveId.options.find(x => x._id === value.option);
                            if (option) return option.name;
                            return '';


                            // console.log(input)
                            // for (let incentive of document.querySelectorAll('#incentiveDatalist option')) {
                            //     if (incentive.getAttribute('dataid') === value.incentiveId) {
                            //         let incentiveData = await GET(`incentives/${incentive.getAttribute('dataid')}`)
                            //         if (!incentiveData.data || incentiveData.data.options.length <= 0) {
                            //             input.disabled = true;
                            //             return '';
                            //         }
                            //         for (let option of incentiveData.data.options) {
                            //             if (option._id === value.option) {
                            //                 let datalist = document.createElement('datalist');
                            //                 datalist.setAttribute('id', `incentiveOptionDatalist${value.incentiveId}`);
                            //                 console.log(incentiveData.data.options)
                            //                 for (let incentiveOption of incentiveData.data.options) {
                            //                     datalist.innerHTML += `<option optionId="${incentiveOption._id}" value="${incentiveOption.name}">ID: ${incentiveOption._id}</option>`
                            //                 }
                            //                 document.body.append(datalist);
                            //                 input.setAttribute('list', `incentiveOptionDatalist${value.incentiveId}`)
                            //                 return option.name;
                            //             }
                            //         }
                            //     }
                            // }
                            // return '';
                        }
                    }, {
                        name: 'Amount',
                        type: 'number',
                        required: true,
                        attributes: {
                            min: 0.01,
                            step: 0.01
                        },
                        textFunction: (value) => {
                            return value.amount;
                        }
                    }],
                    submit: async (value) => {
                        let fields = value.querySelectorAll('.array.childDiv');
                        let data = [];
                        for (const field of fields) {
                            let inputs = field.querySelectorAll('input');
                            let incentiveData = {};
                            let incentive = incentiveDatalist.data.find(x => x.name === inputs[0].value);
                            incentiveData.incentiveId = incentive._id;
                            if (incentive.options.length > 0) {
                                let option = incentive.options.find(x => x.name === inputs[1].value);
                                incentiveData.option = option._id;
                            }
                            incentiveData.amount = inputs[2].value;
                            data.push(incentiveData);
                        }
                        return data;
                    },
                }, {
                    name: 'Timestamp',
                    type: 'datetime-local',
                    data: 'startTime',
                    textFunction: (value) => {
                        let time = new Date(value.timestamp)
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
                    name: 'Paypal Status',
                    type: 'input',
                    data: 'paypalStatus',
                    required: false,
                    textFunction: (value) => {
                        if (!value.paypalStatus) return 'Unknown';
                        return value.paypalStatus;
                    },
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Completed',
                    type: 'checkbox',
                    data: 'completed',
                    required: false,
                    submit: (value) => {
                        return value;
                    },
                }, {
                    name: 'Verified',
                    type: 'checkbox',
                    data: 'verified',
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
                    name: 'Read',
                    type: 'checkbox',
                    data: 'read',
                    required: false,
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