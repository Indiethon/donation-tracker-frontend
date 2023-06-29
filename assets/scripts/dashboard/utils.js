let checkedItems = [];
let itemsToDelete = [];
let timer = null;
let model;
let endpoint;

async function setPageHeaders(options) {
    return new Promise(async (resolve, reject) => {

        let mode;
        switch (options.mode) {
            case 'create': mode = 'full'; break;
            case 'view': mode = 'read'; break;
            case 'edit': mode = 'modify'; break;
            default: mode = 'access'; break;
        }
        const verify = await GET(`${config.apiUrl}/verify?model=${options.model}&action=${mode}`);
        if (verify.status === 403 && !verify.data.superuser) {
            showToast('error', 'You are not authorized to view this resource.');
            history.back()
            return;
        }
        else if (verify.status !== 200) return location.href = '/login';

        document.querySelector('.content-header-section .title').innerHTML = options.pluralName;
        document.querySelector('.dashboard-create-button').classList.remove('hidden');

        if (options.noBreadcrumb) document.querySelector('.breadcrumb').classList.add('hidden')
        else {
            let breadcrumb = document.querySelector('.breadcrumb');
            breadcrumb.classList.remove('hidden')

            let html = `<li><a href="/admin/dashboard" data-link>Home</a></li>`

            if (options.event) html += `<li><a href="/admin/dashboard/overview?event=${options.event}" data-link>${options.eventName}</a></li>`

            if (options.event) html += `<li><a href="${options.url}?event=${options.event}" data-link>${options.pluralName}</a></li>`
            else html += `<li><a href="${options.url}" data-link>${options.pluralName}</a></li>`

            if (options.mode) {
                if (options.event) html += `<li><a href="${options.url}?mode=${options.mode}&event=${options.event}${(options.id) ? `&id=${options.id}` : ''}" data-link>${options.mode.charAt(0).toUpperCase() + options.mode.slice(1)} ${options.singularName}</a></li>`
                else html += `<li><a href="${options.url}?mode=${options.mode}${(options.id) ? `&id=${options.id}` : ''}" data-link>${options.mode.charAt(0).toUpperCase() + options.mode.slice(1)} ${options.singularName}</a></li>`
                document.querySelector('.content-header-section .title').innerHTML = `${options.mode.charAt(0).toUpperCase() + options.mode.slice(1)} ${options.singularName}`;
            }

            breadcrumb.innerHTML = html;

            document.querySelector('.oengus-import-button').classList.add('hidden');
        }

        if (options.customPage) {
            document.querySelector('.content-header-section .title').innerHTML = options.name;
            document.querySelector('.dashboard-create-button').classList.add('hidden');
        }
        else

            if (options.event) document.querySelector('.dashboard-create-button').href = `${options.url}?mode=create&event=${options.event}`
            else document.querySelector('.dashboard-create-button').href = `${options.url}?mode=create`
        resolve();
    })
}

async function generateEventList(list) {
    let nav = document.querySelector('.navbar-event-section');
    nav.innerHTML = "";
    for (const event of list) {
        nav.innerHTML += `
            <li class="navbar-dropdown">
                <a onClick="showDropdownMenu('event-dropdown-menu', this)" eventId="${event.id}">
                    <span class="dropdown-event-text">${event.name}</span>
                    <span class="navbar-caret"><i class="fa-solid fa-chevron-down"></i></span>
                </a>
                <ul class="navbar-dropdown-menu" id="event-dropdown-menu" eventId="${event.id}">
                    <li><a href="/admin/dashboard/overview" eventShort="${event.short}" event-link >Overview</a></li>
                    <li><a href="/admin/dashboard/speedruns" eventShort="${event.short}" event-link >Speedruns</a></li>
                    <li><a href="/admin/dashboard/donations" eventShort="${event.short}" event-link >Donations</a></li>
                    <li><a href="/admin/dashboard/incentives" eventShort="${event.short}" event-link >Incentives</a></li>
                    <li><a href="/admin/dashboard/blurbs" eventShort="${event.short}" event-link >Blurbs</a></li>
                    <li><a href="/admin/dashboard/prizes" eventShort="${event.short}" event-link >Prizes</a></li>
                    <li><a href="/admin/dashboard/prizeRedemptions" eventShort="${event.short}" event-link >Prize Redemptions</a></li>
                </ul>
            </li>
            `
    }
}

// Page Generators
async function generateTable(options) {
    return new Promise(async (funcResolve, funcReject) => {

        model = options.model;
        endpoint = options.endpoint;

        // Create table.
        let table = document.createElement('table');
        table.setAttribute('class', 'table');

        // Get data from API
        let queryObject = {};
        if (options.populate) queryObject.populate = `${options.populate.join(',')}`
        if (options.event) queryObject.eventId = options.event;
        const queryString = new URLSearchParams(queryObject);
        let data = await GET(`${options.endpoint}?${queryString.toString()}`);

        // Generate table rows.
        table.append(await createHeader());
        table.append(await createBody());

        // Append to page.
        document.querySelector('.content-section').append(table);

        // Show content when generation is complete.
        //showContent();

        funcResolve();

        // Helper functions.
        async function createHeader() {
            let thead = document.createElement('thead');
            let tr = document.createElement('tr');
            return new Promise((resolve, reject) => {
                let checkbox = document.createElement('th');
                checkbox.innerHTML = `
                <label class="checkbox-container">
                    <input type="checkbox" onClick="selectRows(this.checked)">
                    <span class="checkbox-checkmark"></span>
                </label>`
                tr.append(checkbox)
                for (const option of options.table) {
                    let header = document.createElement('th');
                    header.setAttribute('priority', (option.priority) ? `${option.priority}` : '1')
                    header.innerHTML = option.name;
                    tr.append(header)
                }
                let dropdown = document.createElement('th');
                dropdown.innerHTML = '';
                tr.append(dropdown)
                thead.append(tr);
                resolve(thead);
            })
        }

        async function createBody() {
            let tbody = document.createElement('tbody');
            return new Promise(async (resolve, reject) => {
                for (const element of data.data) {
                    let create = (options.rowFunction !== undefined) ? await options.rowFunction(element) : true;
                    if (create) {
                        let row = document.createElement('tr');
                        if (options.rowAttribute !== undefined) {
                            row.setAttribute('rowAttr', options.rowAttribute(element))
                        }
                        row.insertCell().innerHTML = `
                        <label class="checkbox-container">
                            <input type="checkbox" item="${element._id}" onClick="selectRows(this.checked, '${element._id}')">
                            <span class="checkbox-checkmark"></span>
                        </label>`
                        // row.insertCell().innerHTML = `<input type="checkbox" class="table-checkbox" onClick="selectRows(this)" item="${element._id}"</input>`;
                        for (const option of options.table) {
                            let cell = row.insertCell();
                            cell.setAttribute('priority', (option.priority) ? `${option.priority}` : '1')
                            if (option.textFunction !== undefined) cell.innerHTML = option.textFunction(element);
                            else {
                                switch (element[option.data]) {
                                    case true: cell.innerHTML = `<div class="table-boolean">Yes</div>`; cell.classList.add('table-boolean'); break;
                                    case false: cell.innerHTML = `<div class="table-boolean">No</div>`; cell.classList.add('table-boolean'); break;
                                    default: cell.innerHTML = element[option.data]; break;
                                }
                            }
                        }
                        if (options.volunteer) {
                            // This needs to be changed.
                            row.insertCell().innerHTML = `
                <div class="tableDropdown">
            <button class="tableButton noDropdown" onClick="volunteerSwitchPage('${options.model}', '${element._id}')"><span class="material-icons-outlined">
                    info
                </span></button>
            `;
                        }
                        else if (options.model !== 'auditLog') {
                            row.insertCell().innerHTML = `
                            <div class="table-dropdown">
                                <button class="table-dropdown-menu-button"><i class="fa-solid fa-ellipsis"></i></button>
                                <div class="table-dropdown-content">
                                    <button class="table-dropdown-button" onClick="changeMode('view', '${element._id}', '${options.event}')"><i class="fa-solid fa-display"></i>&nbsp;View</button>
                                    <button class="table-dropdown-button" onClick="changeMode('edit', '${element._id}', '${options.event}')"><i class="fa-solid fa-pen-to-square"></i>&nbsp;Edit</button>
                                    <button class="table-dropdown-button delete" onClick="deleteItem('${element._id}', false)"><i class="fa-regular fa-trash-can"></i>&nbsp;Delete</button>
                                </div>
                            </div>`;
                        }
                        tbody.append(row);
                    }
                }
                resolve(tbody);
            })
        }
    })
}

async function selectRows(checked, element) {
    if (!element) {
        const checkboxes = document.querySelectorAll('.checkbox-container input');
        checkedItems = [];
        for (let checkbox of checkboxes) {
            checkbox.checked = checked;
            if (!checkbox.getAttribute('item')) continue;
            if (checked) checkedItems.push(checkbox.getAttribute('item'));
            else checkedItems = [];
        }
    }
    else if (checked && checkedItems.indexOf(element) === -1) checkedItems.push(element);
    else checkedItems.splice(checkedItems.indexOf(element), 1);
    if (checkedItems.length > 0) {
        document.querySelector('.dashboard-create-button').classList.add('hidden');
        document.querySelector('.delete-all-button').classList.remove('hidden');
        document.querySelector('.delete-all-button-item-count').innerHTML = checkedItems.length;
    }
    else {
        document.querySelector('.dashboard-create-button').classList.remove('hidden');
        document.querySelector('.delete-all-button').classList.add('hidden');
    }
}

async function generateForm(options) {
    return new Promise(async (funcResolve, funcReject) => {

        //showBody();

        // Set page title.
        // switch (options.type) {
        //     case 'create': document.querySelector('.title').innerHTML = `Create ${options.name}`; break;
        //     case 'edit': document.querySelector('.title').innerHTML = `Edit ${options.name}`; break;
        //     case 'view': document.querySelector('.title').innerHTML = `View ${options.name}`; break;
        //     default: document.querySelector('.title').innerHTML = `View ${options.name}`; break;
        // }

        // Generate datalists (if needed).
        if (options.datalist) {
            for (const key of Object.keys(options.datalist)) {
                await fetchDatalist(options.datalist[key], key)
                // let datalist = document.createElement('datalist');
                // datalist.setAttribute('id', key)
                // let datalistData = await GET(options.datalist[key].endpoint);
                // for (const item of datalistData.data) {
                //     datalist.innerHTML += `<option dataId="${item._id}" value="${options.datalist[key].textFunction(item)}">ID: ${item._id}</option>`
                // }
                // document.querySelector('.content-section').append(datalist);
            }
        }

        // Create form.
        let form = document.createElement('form');

        // Get data from API.
        let queryObject = {};
        if (options.type !== 'create') queryObject._id = options.id;
        if (options.populate) queryObject.populate = `${options.populate.join(',')}`
        if (options.event) queryObject.eventId = options.event;
        const queryString = new URLSearchParams(queryObject);
        if (options.type !== 'create') data = await GET(`${options.endpoint}?${queryString.toString()}`);

        // Add ID field to form.
        if (options.type !== 'create') {
            let idDiv = document.createElement('div');
            idDiv.setAttribute('id', 'id');
            idDiv.setAttribute('class', 'inputDiv');
            idDiv.innerHTML = `
        <label class="label">ID</label>
        <input class="input" value="${data.data[0]._id}" disabled></input>
        <span class="errorText"></span>`
            form.append(idDiv);
        }

        // Generate form data.
        await createFields();

        // Create submit button.
        if (options.type !== 'view') {
            let button = document.createElement('button');
            button.setAttribute('type', 'button')
            button.classList.add('dashboard-button');
            button.classList.add('submit-button');
            button.onclick = function () { submit(options) };
            button.innerHTML = (options.type === 'create') ? 'Create' : 'Submit'
            form.append(button);
        }

        // Append to page.
        document.querySelector('.content-section').append(form);

        // Setup help button.
        if (options.help !== undefined) document.querySelector('.helpButton').setAttribute('onClick', `window.open('${options.help}', '_blank')`)
        else try { document.querySelector('.helpButton').style.display = 'none'; } catch { }

        // Show content.
        //showContent();
        funcResolve();

        // Helper functions.
        async function createFields() {
            return new Promise(async (resolve, reject) => {
                for (const field of options.form) {
                    let div = document.createElement('div');
                    div.setAttribute('id', field.data);
                    if (field.type === 'array') div.setAttribute('class', 'arrayInputDiv');
                    else div.setAttribute('class', 'inputDiv');

                    let label = document.createElement('label');
                    label.setAttribute('class', 'label');
                    label.innerHTML = field.name;

                    if (field.required) label.innerHTML += `<span class="required"> ✱</span>`

                    let input;
                    if (field.type === 'select') {
                        input = document.createElement('select');
                        for (const option of Object.keys(field.options)) {
                            let optionElement = document.createElement('option');
                            optionElement.setAttribute('value', option);
                            optionElement.innerHTML = field.options[option];
                            input.append(optionElement);
                        }
                        input.selectedIndex = "0";
                    }
                    else if (field.type === 'array') input = await createArrayFields(field);
                    else if (field.type === 'textarea') input = document.createElement('textarea');
                    else {
                        input = document.createElement('input');
                        input.setAttribute('class', 'input');
                        input.setAttribute('type', field.type);
                    }

                    if (field.attributes !== undefined) {
                        for (const attribute of Object.keys(field.attributes)) {
                            if (attribute === 'innerHTML') input.innerHTML = field.attributes[attribute];
                            else input.setAttribute(attribute, field.attributes[attribute]);
                        };
                    }

                    let span = document.createElement('span');
                    span.setAttribute('class', 'errorText');

                    if (options.type !== 'create' && field.type !== 'array') {
                        if (field.textFunction !== undefined) input[(field.type === 'checkbox') ? 'checked' : 'value'] = field.textFunction(data.data[0]);
                        else input[(field.type === 'checkbox') ? 'checked' : 'value'] = data.data[0][field.data];
                    }

                    if (options.type === 'view' && field.type !== 'array') input.disabled = true;

                    div.append(label, input, span);
                    form.append(div);
                }
                resolve();
            })
        }

        async function createArrayFields(field) {
            let containerDiv = document.createElement('div');
            containerDiv.setAttribute('class', 'array container');

            let mainDiv = document.createElement('div');
            mainDiv.setAttribute('class', 'array div');

            if (options.type !== 'create') {
                let count = 0;
                for (const array of field.array) {
                    try {
                        for (const fieldData of data.data[0][field.data]) {
                            if (options.type !== 'create' && data.data[0][field.data][count] !== undefined) mainDiv.append(await addArrayElement(field, fieldData)) //data.data[field.data][count]
                            else if (options.type === 'create') mainDiv.append(await addArrayElement(field))
                            count++;
                        }
                    } catch { }
                }
            }

            containerDiv.append(mainDiv);

            if (options.type !== 'view') {
                let addButton = document.createElement('button');
                addButton.setAttribute('type', 'button');
                addButton.setAttribute('class', 'array addButton');
                addButton.onclick = function () { addToArray(field) };
                addButton.innerHTML = '<i class="fa-solid fa-plus"></i>&nbsp;New Item';
                containerDiv.append(addButton)
            }

            return containerDiv;
        }

        async function addArrayElement(field, fieldData) {

            return new Promise(async (resolve, reject) => {
                let div = document.createElement('div');
                div.setAttribute('class', 'array childDiv');

                for (const arrayField of field.array) {
                    let inputDiv = document.createElement('div');

                    let label = document.createElement('label');
                    label.setAttribute('class', 'label');
                    label.innerHTML = arrayField.name;

                    if (arrayField.required) label.innerHTML += `<span class="required"> ✱</span>`

                    let input;
                    if (arrayField.type === 'select') {
                        input = document.createElement('select');
                        for (const option of Object.keys(arrayField.options)) {
                            let optionElement = document.createElement('option');
                            optionElement.setAttribute('value', option);
                            optionElement.innerHTML = arrayField.options[option];
                            input.append(optionElement);
                        }
                        input.selectedIndex = "0";
                    }
                    else input = document.createElement('input');
                    input.setAttribute('class', 'input');
                    input.setAttribute('type', arrayField.type);

                    if (arrayField.attributes !== undefined) {
                        for (const attribute of Object.keys(arrayField.attributes)) {
                            if (attribute === 'innerHTML') input.innerHTML = arrayField.attributes[attribute];
                            else input.setAttribute(attribute, arrayField.attributes[attribute]);
                        };
                    }

                    if (options.type !== 'create' && fieldData !== undefined) {
                        if (arrayField.data === undefined && arrayField.textFunction !== undefined) input[(arrayField.type === 'checkbox') ? 'checked' : 'value'] = await arrayField.textFunction(fieldData, input);
                        else if (arrayField.textFunction !== undefined) input[(arrayField.type === 'checkbox') ? 'checked' : 'value'] = await arrayField.textFunction(fieldData, input);
                        else if (arrayField.data === undefined) input[(arrayField.type === 'checkbox') ? 'checked' : 'value'] = fieldData;
                        else input[(arrayField.type === 'checkbox') ? 'checked' : 'value'] = fieldData[arrayField.data];
                    }

                    if (options.type === 'view') input.disabled = true;

                    inputDiv.append(label, input)
                    div.append(inputDiv);
                }

                if (options.type !== 'view') {
                    let button = document.createElement('button');
                    button.setAttribute('type', 'button');
                    button.setAttribute('class', 'array deleteButton');
                    button.setAttribute('onClick', 'this.parentNode.remove()');
                    button.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    div.append(button);
                }

                resolve(div);
            })
        }

        async function addToArray(field) {
            document.querySelector(`#${field.data} .array.div`).append(await addArrayElement(field))
        }

        async function fetchDatalist(list, key) {
            return new Promise(async (resolve, reject) => {
                let datalist = document.createElement('datalist');
                datalist.setAttribute('id', key)
                let datalistData = await GET(list.endpoint);
                for (const item of datalistData.data) {
                    datalist.innerHTML += `<option dataId="${item._id}" value="${list.textFunction(item)}">ID: ${item._id}</option>`
                }
                document.querySelector('.content-section').append(datalist);
                resolve();
            })
        }
    })
}

async function deleteItem(id, multi) {
    const verify = await GET(`${config.apiUrl}/verify?model=${model}&action=full`);
    if (verify.status === 403 && !verify.data.superuser) { return showToast('error', 'You are not authorized to delete this resource.') }
    if (multi) {
        itemsToDelete = checkedItems;
        document.querySelector('.delete-popup-number-text').innerHTML = 'these items'
    }
    else {
        itemsToDelete.push(id)
        document.querySelector('.delete-popup-number-text').innerHTML = 'this item'
    }
    document.querySelector('.delete-popup-background').classList.add('show');
    document.querySelector('.delete-popup-div').classList.add('show');
}

async function closeDeletePopup(action) {
    document.querySelector('.delete-popup-background').classList.remove('show');
    document.querySelector('.delete-popup-div').classList.remove('show');
    if (action) {
        let deleteQueryString = `?_id=${itemsToDelete.join('&_id=')}`;
        itemsToDelete = [];
        let deleteData = await DELETE(`${endpoint}${deleteQueryString}`)
        selectRows(false);
        changePath(window.location.pathname + window.location.search);
        showToast('success', 'Item deleted successfully.')
    }
}

function showDropdownMenu(element, button) {
    let allDivs = document.querySelectorAll('.navbar-menu a.pressed');
    for (const div of allDivs) {
        div.parentElement.querySelector('.navbar-dropdown-menu').classList.remove('visible')
        div.classList.remove('pressed');
    }
    let div = document.querySelector(`#${element}`);
    if (button.getAttribute('eventId')) div = document.querySelector(`.navbar-dropdown-menu[eventId='${button.getAttribute('eventId')}']`);
    if (!div.classList.contains('visible')) {
        div.classList.add('visible')
        button.classList.add('pressed')
        return;
    }
    div.classList.remove('visible')
    button.classList.remove('pressed')
}

async function changeMode(mode, id, event) {
    if (event !== 'undefined') changePath(`${window.location.pathname}?id=${id}&mode=${mode}&event=${event}`)
    else changePath(`${window.location.pathname}?id=${id}&mode=${mode}`)
}

// Submit data.
async function submit(options) {

    // Hide page content while validating.
    document.querySelector('.loading-content-section').classList.remove('hidden');
    document.querySelector('.content-section').classList.add('hidden');

    // Clear any errors.
    let elementList = document.querySelectorAll('.content-section .inputDiv');
    [...elementList].forEach(element => {
        let el = document.querySelector(`#${element.id} .errorText`)
        try {
            el.innerHTML = '';
            el.style.visibility = 'none';
        } catch { };
    });

    // Generate form data.
    let data = {};
    for (const field of options.form) {
        if (field.submit === undefined) test = '1'
        else if (field.type === 'array') data[field.data] = await field.submit(document.querySelector(`form #${field.data}`));
        else if (field.type === 'select') data[field.data] = await field.submit(document.querySelector(`form #${field.data} select`).value)
        else if (field.type === 'textarea') data[field.data] = await field.submit(document.querySelector(`form #${field.data} textarea`).value)
        else data[field.data] = await field.submit(document.querySelector(`form #${field.data} input`)[(field.type === 'checkbox') ? 'checked' : 'value'])
    };

    if (options.other) {
        for (const field of options.other) {
            data[field.data] = await field.submit()
        }
    }

    // Send form data.
    let endpoint = (options.id) ? options.endpoint + `?_id=${options.id}` : options.endpoint;
    let save = await POST(endpoint, data);

    // If API sent no errors.
    if (!save.error) {
        showToast('success', `${options.name} updated successfully.`)
        if (options.model === 'event') generateEventList(list)
        // if (options.model === 'events') refreshNav();
        // if (options.volunteer) return switchPage(`/content/pages/dashboard/volunteer/${options.model}/${options.model}.html`)
        // if (options.event !== undefined) return switchPage(`/content/pages/dashboard/admin/${options.model}/${options.model}.html?event=${options.event}`)
        if (options.event) changePath(`${window.location.pathname}?event=${options.event}`)
        else changePath(`${window.location.pathname}`)
    }

    // If errors, show errors on page.
    else {
        document.querySelector('.loading-content-section').classList.add('hidden');
        document.querySelector('.content-section').classList.remove('hidden');
        if (save.data.error === 'Invalid input.') {
            showToast('error', `Validation errors found, please resolve them.`)
            save.data.errorCodes.forEach(error => {
                console.error(error)
                let element = document.querySelector(`.content-section #${error.item} .errorText`);
                element.innerHTML = error.code;
                element.style.visibility = 'inherit';
            })
        }
        else showToast('error', save.data.error)
    }

    return;
}

function showToast(type, message) {
    let toast = document.querySelector('.toast-container');
    if (timer !== null) {
        clearTimeout(timer);
        toast.classList.remove("showToast");
        setTimeout(() => setToastState(type), 750)
    }
    else setToastState(type);

    function setToastState(type) {
        let toastContent = document.querySelector('.toast-content');
        switch (type) {
            case 'success':
                document.querySelector('.toast-header').style.backgroundColor = '#42A086';
                toastContent.style.backgroundColor = '#8EF3C5';
                break;
            case 'error':
                document.querySelector('.toast-header').style.backgroundColor = '#FF4567';
                toastContent.style.backgroundColor = '#FFA5B5';
                break;
            case 'working':
                document.querySelector('.toast-header').style.backgroundColor = '#A08A42';
                toastContent.style.backgroundColor = '#F3D18E';
                break;
        }
        toastContent.innerHTML = message;
        toast.classList.add('showToast');
        timer = setTimeout(() => {
            toast.classList.remove("showToast");
            timer = null;
        }, 5000);
    }
}

async function createAPIHeader() {
    return new Promise((resolve, reject) => {
        let headers = { 'Content-Type': 'application/json' };
        let cookies = document.cookie.split('; ').find((x) => x.startsWith('data='))?.split('=')[1];
        if (cookies) headers["Authorization"] = `Bearer ${JSON.parse(cookies).token}`;
        resolve(headers);
    })
}

async function GET(endpoint) {
    let response = await fetch(endpoint, { method: 'GET', headers: await createAPIHeader() });
    let data = await response.json();
    switch (response.status) {
        case 200: return { error: false, status: response.status, data: data }; break;
        default: apiError(response, data); return { error: true, status: response.status, data: data }; break;
    }
}

async function POST(endpoint, body) {
    let response = await fetch(endpoint, { method: 'POST', headers: await createAPIHeader(), body: JSON.stringify(body) });
    let data = await response.json();
    switch (response.status) {
        case 200: return { error: false, status: response.status, data: data }; break;
        default: apiError(response, data); return { error: true, status: response.status, data: data }; break;
    }
}

async function PUT(endpoint, body) {
    let response = await fetch(endpoint, { method: 'PUT', headers: await createAPIHeader(), body: JSON.stringify(body) });
    let data = await response.json();
    switch (response.status) {
        case 200: return { error: false, status: response.status, data: data }; break;
        default: apiError(response, data); return { error: true, status: response.status, data: data }; break;
    }
}

async function DELETE(endpoint, body) {
    let response = await fetch(endpoint, { method: 'DELETE', headers: await createAPIHeader(), body: JSON.stringify(body) });
    let data = await response.json();
    switch (response.status) {
        case 200: return { error: false, status: response.status, data: data }; break;
        default: apiError(response, data); return { error: true, status: response.status, data: data }; break;
    }
}

async function apiError(error, body) {
    if (window.location.pathname === '/login') return;
    if (error.status === 401) return location.href = '/login';
    else if (error.status !== 409) showToast('error', `An API error has occured. Please check the browser console for more details.`)
    if (error.status !== 401 && error.status !== 409 && error.status !== 403) console.error('Error while making API request.\n\n', `Status:`, error.status, `\nStatus Text:`, body, `\nRequested Endpoint:`, error.url, `\n\nIf this issue persists, please open an issue in the Github repository https://github.com/Indiethon/donation-tracker/issues`);
}

async function logout() {
    let logout = await GET(`${config.apiUrl}/logout`);
    document.cookie = `data=; max-age=0; path=/`;
    location.href = '/login';
    return;
}