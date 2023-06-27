async function load(config) {
    return new Promise(async (resolve, reject) => {
        document.querySelector('.checkmark-div').style.display = 'block';

        document.querySelector('.success-message').innerHTML = config.messages.donationError;
        setTimeout(() => {
            document.querySelector('.success-text').style.opacity = '1';
            setTimeout(() => { document.querySelector('.success-message').style.opacity = '1'; document.querySelector('.message-section-footer').style.opacity = '1' }, 1250);
        }, 2000)

        resolve();
    })
}