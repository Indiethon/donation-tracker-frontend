// let donationData = {
//     alias: 'Anonymous',
//     email: null,
//     amount: null,
//     comment: '',
//     incentives: [],
//     custom: {},
// };

// let selectedIncentive = {};

// let donationDetails = {};

try {
    delete textareaPlaceholderArray;
    delete formStatus;
    delete incentives;
    delete selectedIncentives;
    delete scrollPosition;
} catch { }

var textareaPlaceholderArray = [
    'cheeky comment',
    'weird fact',
    'interesting fact',
    'surprising fact',
    'embarrasing fact',
    'silly comment',
    'funny comment',
    'emotional story',
    'heartwarming story'
]

var formStatus = { amount: false, email: false }
var incentives;
var selectedIncentives = [];
var scrollPosition;


async function load() {
    return new Promise(async (resolve, reject) => {

        if (!window.location.pathname.includes('donate')) return reject();

        console.log(config)
        console.log(details)

        if (!details.activeEvent) return changePath('/')

        console.log(!details.activeEvent.charity)
        while (!details || !details.activeEvent || !details.activeEvent.charity) {
            console.log('api error')
            let newData = await GET(`${config.apiUrl}/details`);
            details = newData;
            console.log(!details)
            console.log(!details.activeEvent)
            console.log(!details.activeEvent.charity)
        }

        document.querySelector('header h1').innerHTML = `Donate to ${details.activeEvent.charity.name}`;
        document.querySelector('.charity-subtext').innerHTML = `All money raised during ${details.activeEvent.name} goes directly to ${details.activeEvent.charity.name}. Thank you for your generosity in supporting this amazing charity!`;
        document.querySelector('.privacy-policy-link').href = config.privacyPolicy;
        document.querySelector('.sweepstakes-rules-link').href = config.sweepstakesRules;
        document.querySelector('.currency-symbol').innerHTML = details.currencySymbol;
        document.querySelector('.incentive-amount .currency-symbol').innerHTML = details.currencySymbol;
        document.querySelector('.minimum-donation-text').innerHTML = details.currencySymbol + details.activeEvent.minDonation.toFixed(2);
        document.querySelector('textarea').setAttribute('placeholder', `Don't know what to write? Try a ${textareaPlaceholderArray[Math.floor(Math.random() * textareaPlaceholderArray.length)]}!`)

        fetchIncentives();
        fetchPrizes();

        return resolve();
    })
}

function updateInputCount(element) {
    try { element.parentElement.querySelector('.input-count-current').innerHTML = element.value.length } catch { };
}

function checkStatus(element) {
    switch (element.getAttribute('property')) {
        case 'email-address': {
            if (element.value.includes('@') && element.value.includes('.') && !element.value.includes(' ') && element.value.length > 0) {
                formStatus.email = true;
                element.parentElement.querySelector(`.error-text`).style.visibility = 'hidden';
            }
            else {
                formStatus.email = false;
                element.parentElement.querySelector(`.error-text`).style.visibility = 'visible';
            }
            break;
        }
        case 'amount': {
            if (element.value < details.activeEvent.minDonation) {
                element.parentElement.querySelector(`.error-text`).style.visibility = 'visible';
                document.querySelector('.add-incentive').disabled = true;
                document.querySelector('.donate-button-amount').innerHTML = '';
                formStatus.amount = false;
            }
            else {
                element.parentElement.querySelector(`.error-text`).style.visibility = 'hidden';
                document.querySelector('.add-incentive').disabled = false;
                formStatus.amount = true;
                try { document.querySelector('.donate-button-amount').innerHTML = `&nbsp${details.currencySymbol}${parseFloat(element.value).toFixed(2)}` } catch { }
                element.value = parseFloat(element.value).toFixed(2);
                break;
            }
        }
        case 'incentive-amount': {
            let maxAmount = document.querySelector('.amount input').value - selectedIncentives.reduce((a, b) => { return a + b.amount }, 0);
            if (element.value > maxAmount) element.value = maxAmount;
            element.value = parseFloat(element.value).toFixed(2);
            break;
        }
        case 'incentive-custom-option': {

        }
    }
    checkFormStatus();
}

function checkFormStatus() {
    if (formStatus.email && formStatus.amount) {
        document.querySelector('form .donate-button').disabled = false;
        document.querySelector('.warning-text').classList.add('hidden')
    }
    else {
        document.querySelector('form .donate-button').disabled = true;
        document.querySelector('.warning-text').classList.remove('hidden')

    }
}

async function fetchIncentives() {
    incentives = await GET(`${config.apiUrl}/incentive/stats?eventId=${details.activeEvent.short}&active=true&visible=true&populate=run`);
    if (incentives.data.length <= 0) return document.querySelector('.incentives-div').style.display = 'none'
    let incentiveList = document.querySelector('.incentive-list');
    for (const incentive of incentives.data) {
        if (incentive.completed) continue;
        let div = `
        <div class="incentive-list-element" incentiveId="${incentive._id}" ${(incentive.type === 'bidwar' ? 'bidwar' : '')} onClick="showIncentiveInfo(this)">
            <div class="incentive-list-game">${incentive.run.game}</div>
            <div class="incentive-list-name">${incentive.name}</div>
        </div>`
        incentiveList.innerHTML += div;
    }
}

function showIncentiveMenu(button) {
    button.classList.add('hidden');
    document.querySelector('.incentive-details-div').classList.add('hidden');
    document.querySelector('.incentive-list-div').classList.remove('hidden');
    document.querySelector('.general-warning').classList.add('hidden');
    document.querySelector('.incentive-warning').classList.remove('hidden');
    document.querySelector('.warning-text').classList.remove('hidden');
    scrollPosition = document.documentElement.scrollTop
}

function showIncentiveInfo(element) {
    try { document.querySelector('.incentive-list-element.selected').classList.remove('selected'); } catch { };
    document.querySelector('.incentive-details-div').classList.remove('hidden');
    element.classList.add('selected');
    const incentive = incentives.data.find(x => x._id === element.getAttribute('incentiveId'));
    document.querySelector('.incentive-details-game').innerHTML = incentive.run.game;
    document.querySelector('.incentive-details-name').innerHTML = incentive.name;
    document.querySelector('.incentive-details-description').innerHTML = incentive.description;
    let maxAmount = document.querySelector('.amount input').value - selectedIncentives.reduce((a, b) => { return a + b.amount }, 0);
    document.querySelector('.incentive-amount-remaining-text').innerHTML = `${details.currencySymbol}${maxAmount.toFixed(2)}`;
    document.querySelector('.incentive-amount input').value = maxAmount.toFixed(2);
    document.querySelector('.incentive-amount input').setAttribute('max', maxAmount);

    if (incentive.type === 'target') {
        document.querySelector('.incentive-options-container').classList.add('hidden');
        document.querySelector('.incentive-details-total').classList.remove('hidden');
        document.querySelector('.incentive-total-progress-bar').style.width = `${(((100 * incentive.stats.total) / incentive.goal) > 100) ? 100 : (100 * incentive.stats.total) / incentive.goal}%`;
        document.querySelector('.incentive-total-text').innerHTML = `Current Raised Amount: ${details.currencySymbol}${incentive.stats.total.toFixed(2)} /  ${details.currencySymbol}${incentive.goal.toFixed(2)}`;
        document.querySelector('.incentive-list-add-button').disabled = false;
    }

    else if (incentive.type === 'bidwar') {
        document.querySelector('.incentive-options-container').classList.remove('hidden');
        document.querySelector('.incentive-details-total').classList.add('hidden');
        document.querySelector('.incentive-custom-option input.input').disabled = true;
        document.querySelector('.incentive-list-add-button').disabled = true;
        let div = '';
        for (const option of incentive.options) {
            div += `
            <div class="incentive-option-checkbox-div" optionId="${option._id}" onClick="updateIncentiveCheckbox(this, false)">
                <div class="incentive-option-checkbox-div-left">
                    <input type="checkbox" class="incentive-option-checkbox">
                    <div class="incentive-option-checkbox-text">${option.name}</div>
                </div>
                <div>
                    <div class="incentive-option-amount">${details.currencySymbol}${incentive.stats.options[option._id].toFixed(2)}</div>
                </div>
            </div>
            `
        }
        document.querySelector('.incentive-options-div').innerHTML = div;
        try {
            document.querySelector('.incentive-option-checkbox-div.selected input[type="checkbox"]').checked = false;
            document.querySelector('.incentive-option-checkbox-div.selected').classList.remove('selected');
        } catch { };
        if (!incentive.allowUserOptions) return document.querySelector('.incentive-custom-option').classList.add('hidden');
        document.querySelector('.incentive-custom-option').classList.remove('hidden');
        document.querySelector('.incentive-custom-option-input-container input').setAttribute('maxLength', incentive.userOptionMaxLength)
        document.querySelector('.incentive-custom-option-input-container .input-count-max').innerHTML = incentive.userOptionMaxLength;
        document.querySelector('.incentive-custom-option input.input').value = '';
        document.querySelector('.incentive-custom-option input.input').disabled = true;
    }
}

function updateIncentiveCheckbox(element, customOption) {
    if (customOption) document.querySelector('.incentive-custom-option-input-container input').disabled = false;
    else {
        document.querySelector('.incentive-custom-option-input-container input').disabled = true;
        document.querySelector('.incentive-custom-option-input-container input').value = '';
    }
    try {
        document.querySelector('.incentive-option-checkbox-div.selected input[type="checkbox"]').checked = false;
        document.querySelector('.incentive-option-checkbox-div.selected').classList.remove('selected');
    } catch { };
    element.querySelector('input[type="checkbox"]').checked = true;
    element.classList.add('selected');
    document.querySelector('.incentive-list-add-button').disabled = false;
}

function addIncentive() {
    let incentiveData = incentives.data.find(x => x._id === document.querySelector('.incentive-list-element.selected').getAttribute('incentiveId'))
    let arrayData = {
        id: incentiveData._id,
        game: incentiveData.run.game,
        name: incentiveData.name,
        amount: parseFloat(document.querySelector('.incentive-amount input').value),
        option: null,
        userOption: null,
    }
    if (document.querySelector('.incentive-list-element.selected').hasAttribute('bidwar')) {
        let optionId = document.querySelector('.incentive-options-container .incentive-option-checkbox-div.selected').getAttribute('optionId');
        arrayData.option = optionId;
        if (optionId === 'customOption') arrayData.userOption = arrayData.option = document.querySelector('.incentive-custom-option-input-container input').value;
    }
    let index = selectedIncentives.findIndex(x => x.id === document.querySelector('.incentive-list-element.selected').getAttribute('incentiveId'));
    if (index < 0) selectedIncentives.push(arrayData)
    selectedIncentives[index] = arrayData;
    document.querySelector('.incentive-list-element.selected').classList.remove('selected');
    document.querySelector('.incentive-list-div').classList.add('hidden');
    document.querySelector('.general-warning').classList.remove('hidden');
    document.querySelector('.incentive-warning').classList.add('hidden');
    document.querySelector('.warning-text').classList.add('hidden');
    document.documentElement.scrollTop = scrollPosition;
    checkFormStatus();
    updateSelectedIncentiveList();
}

function updateSelectedIncentiveList() {
    let div = '';
    for (const incentive of selectedIncentives) {
        div += `
        <div class="selected-incentives-info-div">
            <div class="selected-incentives-info-left">
                <div class="selected-incentives-game">${incentive.game}</div>
                <div class="selected-incentives-name">${incentive.name}</div>
                ${(incentive.option) ? `<div class="selected-incentives-option">Option: ${incentive.option}</div>` : ''}
            </div>
            <div class="selected-incentives-info-right">
                <div class="selected-incentives-amount">${details.currencySymbol}${incentive.amount.toFixed(2)}</div>
                <button type="button" class="remove-incentive-button" onClick="removeIncentive('${incentive.id}')">Remove</button>
            </div>
        </div>
        `
    }
    document.querySelector('.selected-incentives').innerHTML = div;
    let maxAmount = selectedIncentives.reduce((a, b) => { return a + b.amount }, 0);
    if (maxAmount >= document.querySelector('.amount input').value) document.querySelector('.add-incentive').classList.add('hidden');
    else document.querySelector('.add-incentive').classList.remove('hidden')
    document.querySelector('.incentive-list-div').classList.add('hidden')
}

function removeIncentive(id) {
    let index = selectedIncentives.findIndex(x => x.id === id);
    selectedIncentives.splice(index, 1);
    updateSelectedIncentiveList();
}

async function fetchPrizes() {
    prizes = await GET(`${config.apiUrl}/prize?eventId=${details.activeEvent.short}&active=true&visible=true`);
    if (prizes.data.length <= 0) return document.querySelector('.prizes-div').style.display = 'none'
    let list = '';
    for (const prize of prizes.data) {
        //if (prize.drawn) continue;
        list += `
        <div class="prize-list-element" prizeId="${prize._id}" onClick="showPrize(this)">
            <div class="prize-list-name">${prize.name}</div>
            <div class="prize-list-donation">${details.currencySymbol}${prize.minDonation.toFixed(2)} Minimum Donation</div>
        </div>`
    }
    document.querySelector('.prize-list').innerHTML = list;
}

async function showPrize(element) {
    const prize = await GET(`${config.apiUrl}/prize?_id=${element.getAttribute('prizeId')}`);
    document.querySelector('.prize-popup-img').style.display = (prize.data[0].image) ? 'block' : 'none'
    document.querySelector('.prize-popup-name').innerHTML = prize.data[0].name;
    document.querySelector('.prize-popup-img').src = prize.data[0].image;
    document.querySelector('.prize-popup-description').innerHTML = prize.data[0].description;
    document.querySelector('.prize-popup-type-text').innerHTML = (prize.data[0].type === 'physical') ? 'Physical' : 'Digital';
    document.querySelector('.prize-popup-min-donation-text').innerHTML = `${details.currencySymbol}${parseFloat(prize.data[0].minDonation).toFixed(2)}`
    document.querySelector('.prize-popup-value-text').innerHTML = `${details.currencySymbol}${parseFloat(prize.data[0].value).toFixed(2)}`
    document.querySelector('.prize-popup-contributor-text').innerHTML = prize.data[0].contributor;
    document.querySelector('.prize-popup-background').classList.add('show');
    document.querySelector('.prize-popup-div').classList.add('show');
    document.body.classList.add('noScroll');
}

function hidePrize() {
    document.querySelector('.prize-popup-background').classList.remove('show');
    document.querySelector('.prize-popup-div').classList.remove('show');
    document.body.classList.remove('noScroll');
}

async function donateForm(donateButton) {

    let donateButtonText = donateButton.innerHTML;

    donateButton.setAttribute('disabled', 'true');
    donateButton.innerHTML = 'Redirecting, please wait...'

    setTimeout(() => {
        donateButton.setAttribute('disabled', 'false');
        donateButton.innerHTML = donateButtonText
    }, 5000)

    console.log('pressed')

    let res = await fetch(`${config.apiUrl}/donation/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            alias: (document.querySelector('.alias input').value.length > 0) ? document.querySelector('.alias input').value : 'Anonymous',
            email: document.querySelector('.email-address input').value,
            amount: parseFloat(document.querySelector('.amount input').value),
            comment: document.querySelector('.comment textarea').value,
            incentives: selectedIncentives,
            custom: {},
        }),
    })

    console.log(res.status)
    let donationInfo = await res.json();
    if (res.status !== 200) return console.error(donationInfo);

    document.body.insertAdjacentHTML("beforeend", `
        <form class="paypal-donate-form" action="${donationInfo.url}" method="post" target="_top">
            <input type="hidden" name="cmd" value="_donations" />
            <input type="hidden" name="image_url" value="${donationInfo.logo}">
            <input type="hidden" name="business" value="${donationInfo.payee}" />
            <input type="hidden" name="amount" value="${parseFloat(document.querySelector('.amount input').value)}" />
            <input type="hidden" name="currency_code" value="${details.currency}" />
            <input type="hidden" name="item_name" value="${donationInfo.event} Donation" />
            <input type="hidden" name="custom" value=${donationInfo.id} />
            <input type="hidden" name="notify_url" value="${config.apiUrl}/donation/ipn" />
            <input type="hidden" name="return" value="${window.location.origin}/donate/success" />
            <input type="hidden" name="cancel_return" value="${window.location.origin}/donate/error" />
        </form>
    `);

    console.log('redirecting')

    document.querySelector('.paypal-donate-form').submit();
    document.querySelector('.fader').classList.add('visible');
}