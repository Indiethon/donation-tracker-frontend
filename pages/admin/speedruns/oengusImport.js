
async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        generateEventList(details.eventList)

        await setPageHeaders({
            customPage: true,
            name: 'Oengus Import',
            pluralName: 'Oengus Import'
        });

        resolve();
    })
}

async function oengusImport() {

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let event = urlParams.get('event')


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

    let options = {};
    options.short = document.querySelector('#short input').value;
    options.schedule = document.querySelector('#schedule input').checked;

    // Send form data.
    showToast('working', 'Importing runs for Oengus... Please do not reload the page.')
    let save = await POST(`${config.apiUrl}/run/import?event=${event}`, options);

    console.log(save)
    // If API sent no errors.
    if (!save.error) {
        showToast('success', 'Successfully imported speedruns from Oengus.')
        changePath(`/admin/dashboard/speedruns?event=${event}`)
    }

    // If errors, show errors on page.
    else {
        document.querySelector('.loading-content-section').classList.add('hidden');
        document.querySelector('.content-section').classList.remove('hidden');
        if (save.data.error === 'Invalid input.') {
            showToast('error', `Validation errors found, please resolve them.`)
            save.data.errorCodes.forEach(error => {
                let element = document.querySelector(`.content-section #${error.item} .errorText`);
                element.innerHTML = error.code;
                element.style.visibility = 'inherit';
            })
        }
        else showToast('error', save.data.error)
    }
}
