async function load(config) {
    return new Promise(async (resolve, reject) => {

        // try {
        //     await fetch(`${config.apiUrl}/ping`);
        //     changePath('', true);
        //     return resolve();
        // } catch { }

        document.querySelector('.checkmark-div').style.display = 'block';

        document.querySelector('.success-message').innerHTML = config.messages.databaseError;
        setTimeout(() => {
            document.querySelector('.success-text').style.opacity = '1';
            setTimeout(() => { document.querySelector('.success-message').style.opacity = '1'; document.querySelector('.message-section-footer').style.opacity = '1' }, 1250);
        }, 2000)

        resolve();
    })
}