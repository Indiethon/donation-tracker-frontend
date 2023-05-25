async function generateTable(options, details) {
    return new Promise(async (funcResolve, funcReject) => {

        // Return if page is all.
        if (!options.event) funcReject();

        // Create table.
        let table = document.createElement('table');
        table.setAttribute('class', 'table');

        // Get data from API
        let data = await GET(options.url);
        if (options.donationData) data = data.data;

        // Generate table rows.
        table.append(await createHeader());
        table.append(await createBody());

        // Append to page.
        let section = document.querySelector('.table-section');
        section.append(table);
        return funcResolve(data);

        // Helper functions.
        async function createHeader() {
            return new Promise(async (resolve, reject) => {
                let thead = document.createElement('thead');
                let tr = document.createElement('tr');
                for (const option of options.table) {
                    let header = document.createElement('th');
                    header.innerHTML = option.name;
                    tr.append(header);
                }
                thead.append(tr);
                return resolve(thead);
            })
        }

        async function createDateRow(tbody, rowData) {
            return new Promise(async (resolve, reject) => {
                let date = new Date(rowData[options.dateData]).toLocaleString(window.navigator.language, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
                let row = tbody.insertRow();
                row.classList.add('dateRow');
                let cell = row.insertCell();
                cell.innerHTML = date;
                cell.setAttribute('colSpan', 100)
                tbody.append(row);
                return resolve();
            })
        }

        async function createBody() {
            return new Promise(async (resolve, reject) => {
                let tbody = document.createElement('tbody');
                let counter = 0;
                if (data.data.length < 1) return resolve(tbody);
                if (options.dateMode) await createDateRow(tbody, data.data[0]);
                for (let index = 0; index < data.data.length; index++) {
                    let create = (options.rowFunction !== undefined) ? await options.rowFunction(data.data[index]) : true;
                    if (!create) continue;
                    if (options.dateMode && index > 0) {
                        let date1 = new Date(data.data[index - 1][options.dateData]);
                        let date2 = new Date(data.data[index][options.dateData]);
                        if (date1.toLocaleDateString() !== date2.toLocaleDateString()) await createDateRow(tbody, data.data[index]);
                    }
                    let row = tbody.insertRow();
                    row.classList.add((counter % 2 === 0) ? 'even' : 'odd');
                    for (const option of options.table) {
                        if (option.textFunction) row.insertCell().innerHTML = option.textFunction(data.data[index], details);
                        else row.insertCell().innerHTML = data.data[index][option.data];
                    }
                    if (options.clickFunction) row.setAttribute('onClick', options.clickFunction(data.data[index]));
                    tbody.append(row);

                    counter++;

                    if (options.subTable && options.subTableFunction(data.data[index])) {
                        let subTableRow = document.createElement('tr');
                        subTableRow.classList.add('subTableRow');
                        subTableRow.setAttribute('dataid', data.data[index]._id);
                        let cell = subTableRow.insertCell();
                        cell.setAttribute('colSpan', 100)
                        cell.classList.add('subTableTd')
                        cell.append(await generateSubTable(options.subTable, data.data[index], data.data[index][options.subTableData]));

                        let invisibleRow = document.createElement('tr');
                        invisibleRow.style.display = 'none';

                        tbody.append(subTableRow);
                        tbody.append(invisibleRow);
                    }

                    if (index >= data.data.length - 1) return resolve(tbody);
                }
            })


            // let tbody = document.createElement('tbody');
            // return new Promise(async (resolve, reject) => {
            //     for (const element of data.data) {
            //         let create = (options.rowFunction !== undefined) ? await options.rowFunction(element) : true;
            //         if (create) {
            //             let row = document.createElement('tr');
            //             for (const option of options.table) {
            //                 if (option.textFunction !== undefined) row.insertCell().innerHTML = option.textFunction(element, details);
            //                 else row.insertCell().innerHTML = element[option.data];
            //             }

            //             // Temporarily disabled until the page is made!
            //             if (options.clickFunction) row.setAttribute('onClick', options.clickFunction(element));

            //             // Create sub table.
            //             tbody.append(row);

            //             if (options.subTable !== undefined && options.subTableFunction(element)) {
            //                 let subTableRow = document.createElement('tr');
            //                 subTableRow.classList.add('subTableRow');
            //                 subTableRow.setAttribute('dataid', element._id);
            //                 let cell = subTableRow.insertCell();
            //                 cell.setAttribute('colSpan', 6)
            //                 cell.append(await generateSubTable(options.subTable, element[options.subTableData]));

            //                 let invisibleRow = document.createElement('tr');
            //                 invisibleRow.style.display = 'none';

            //                 tbody.append(subTableRow);
            //                 tbody.append(invisibleRow);
            //             }
            //         }
            //     }
            //     resolve(tbody);
            //})
        }
    })
}

async function generateSubTable(options, tableData, subTableData) {
    return new Promise(async (resolve, reject) => {
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');
        let tr = document.createElement('tr');
        await new Promise((resolve, reject) => {
            for (const option of options) {
                let header = document.createElement('th');
                header.innerHTML = option.name;
                tr.append(header);
            }
            thead.append(tr);
            table.append(thead);
            resolve();
        })

        await new Promise(async (resolve, reject) => {
            for (const element of subTableData) {
                let row = document.createElement('tr');
                for (const option of options) {
                    if (option.textFunction) row.insertCell().innerHTML = option.textFunction(tableData, element, details);
                    else row.insertCell().innerHTML = element[option.data];
                }
                tbody.append(row);
            }
            table.append(tbody);
            resolve();
        })

        resolve(table);
    });
}

function showOptionsSubtable(button) {
    let subtables = document.querySelectorAll('.subTableRow');
    for (let subtable of subtables) {
        if (subtable.getAttribute('dataid') === button.getAttribute('incentiveid')) {
            if (button.classList.contains('active')) {
                button.classList.remove('active');
                button.innerHTML = 'Show Options';
                subtable.classList.remove('active');
            }
            else {
                button.classList.add('active');
                button.innerHTML = 'Hide Options';
                subtable.classList.add('active');
            }
        }
        else {
            let button = document.querySelector(`.tableOptionsButton[incentiveid='${subtable.getAttribute('dataid')}']`)
            button.classList.remove('active');
            button.innerHTML = 'Show Options'
            subtable.classList.remove('active');
        }
    }
}

async function GET(endpoint) {
    let headers = { 'Content-Type': 'application/json' };
    let response = await fetch(endpoint, { method: 'GET', headers: headers });
    let data = await response.json();
    switch (response.status) {
        case 200: return { error: false, status: response.status, data: data }; break;
        default: apiError(response, data); return { error: true, status: response.status, data: data }; break;
    }
}

async function apiError(error, body) {
    console.error('Error while making API request.\n\n', `Status:`, error.status, `\nStatus Text:`, body, `\nRequested Endpoint:`, error.url, `\n\nIf this issue persists, please open an issue in the Github repository https://github.com/Indiethon/donation-tracker/issues`);
}