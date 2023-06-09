// loadContent()

// load(false, { model: 'emailTemplate', level: 'access' });

async function load(config, details) {
    return new Promise(async (resolve, reject) => {

        await setPageHeaders({
            customPage: true,
            pluralName: 'Change Password',
        });

        resolve();
    })
}

async function changePassword() {

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
    options.oldPassword = document.querySelector('#current-password input').value;
    options.newPassword = document.querySelector('#new-password input').value;
    options.confirmPassword = document.querySelector('#confirm-password input').value;

    // Send form data.
    let save = await POST(`${config.apiUrl}/updatePassword`, options);

    console.log(save)
    // If API sent no errors.
    if (!save.error) {
        showToast('success', 'Successfully changed password.')
        changePath('/volunteer/dashboard')
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