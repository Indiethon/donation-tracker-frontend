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

const textareaPlaceholderArray = [
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

let formStatus = { amount: false, email: false }
let incentives;
let prizes;
let selectedIncentives = [];
let scrollPosition;

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

async function donateForm() {

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

    document.querySelector('.paypal-donate-form').submit();
    document.querySelector('.fader').classList.add('visible');
}


// async function load(config, details) {
//     if (!window.location.pathname.includes('/donate')) return;
//     document.querySelector('textarea').setAttribute('placeholder', `Insert ${textareaPlaceholderArray[Math.floor(Math.random() * textareaPlaceholderArray.length)]} comment here...`)

//     let res = await fetch('/api/donation/info');
//     donationDetails = await res.json();

//     document.getElementById('privacyPolicy').href = details.privacyPolicy;
//     document.getElementById('sweepstakesRules').href = details.sweepstakesRules;
//     document.querySelector('.pageSubtitle').innerHTML = `100% of your donation goes to ${details.activeEvent.charity.name}.`

//     // let div = document.querySelector('#custom');
//     // for (const custom of data.custom) {
//     //     if (custom.type !== 'select') {
//     //         div.innerHTML += `
//     //             <div customId="${custom.id}" class="inputDiv">
//     //                 <label class="label">${custom.name}</label>
//     //                 <input class="input" type="${custom.type}">
//     //                 <div class="errorText">Error</div>
//     //             </div>
//     //             `
//     //     }
//     // }

//     let amountInput = document.querySelector('#amount input');
//     let inputUnit = document.querySelector('.inputUnitTest');
//     inputUnit.innerHTML = details.currencySymbol;
//     let unitWidth = inputUnit.offsetWidth;
//     amountInput.style.paddingLeft = `${unitWidth + 12}px`;
//     amountInput.style.width = `calc(100% - ${unitWidth + 4}px)`
//     document.querySelector('#amount .inputUnit').innerHTML = details.currencySymbol;
//     if (donationDetails.incentives.length <= 0) document.querySelector('#incentives').style.display = 'none';
//     document.querySelector('#amount .inputSubtext').innerHTML = `Minimum donation is <b>${details.currencySymbol}${donationDetails.event.minDonation.toFixed(2)}</b>`

//     for (const incentive of donationDetails.incentives) {
//         let div = `
//             <div class="incentiveListDiv" incentiveID=${incentive.id} onClick="showIncentiveInfo(this)">
//                 <div class="incentiveGame">${incentive.run.game}</div>
//                 <div class="incentiveName">${incentive.name}</div>
//             </div>
//             `
//         document.querySelector('.incentiveList').innerHTML += div;
//     }
//     if (donationDetails.prizes.length <= 0) {
//         document.querySelector('.prizesLabel').style.display = 'none';
//         document.querySelector('#prizes').style.display = 'none';
//     }
//     for (const prize of donationDetails.prizes) {
//         let div = `
//             <div class="prizeListDiv" prizeID="${prize.id}" onClick="showPrize()">
//                 <p class="prizeName">${prize.name}</p>
//                 <p class="prizeAmount">${details.currencySymbol}${prize.minDonation.toFixed(2)} Minimim Donation</p>
//             </div>
//             `
//         document.querySelector('.prizeList').innerHTML += div;
//     }

//     document.querySelector('.spinnerDiv').style.display = 'none'
//     document.querySelector('main').style.display = 'inline-block'
// }


// function updateAlias(element) {
//     element.parentElement.querySelector('.inputCountCurrent').innerHTML = element.value.length;
//     if (element.value.length <= 0) return donationData.alias = 'Anonymous';
//     donationData.alias = element.value;
// }

// function updateEmail(element) {
//     element.parentElement.querySelector('.inputCountCurrent').innerHTML = element.value.length;
//     if (element.value.includes('@') && element.value.includes('.') && !element.value.includes(' ') && element.value.length > 0) donationData.email = element.value;
//     else donationData.email = null;
//     checkStatus();
// }

// function updateEmailErrorText(element) {
//     if (!element.value.includes('@') || !element.value.includes('.') || element.value.includes(' ')) element.parentElement.querySelector(`.errorText`).style.visibility = 'visible';
// }

// function updateAmount(element) {
//     if (element.value === '' || element.value < donationDetails.event.minDonation) { donationData.amount = null; return checkStatus() };
//     element.parentElement.querySelector(`.errorText`).style.visibility = 'hidden';
//     donationData.amount = parseFloat(element.value)
//     checkStatus();
// }

// function updateAmountErrorText(element) {
//     if (element.value < donationDetails.event.minDonation && element.value !== '') element.parentElement.querySelector(`.errorText`).style.visibility = 'visible';
//     if (document.querySelector('#email input').value === '') document.querySelector('#email .errorText').style.visibility = 'visible';
//     element.value = parseFloat(element.value).toFixed(2);
//     document.querySelector('.donateButtonAmount').innerHTML = details.currencySymbol + (parseFloat(element.value)).toFixed(2);
// }

// function updateComment(element) {
//     element.parentElement.querySelector('.inputCountCurrent').innerHTML = element.value.length;
//     if (element.value.length > 0) donationData.comment = element.value;
//     else donationData.comment = '';
// }

// function checkStatus() {
//     if (donationData.amount !== null) document.querySelector('#incentiveAdd').disabled = false;
//     else document.querySelector('#incentiveAdd').disabled = true;
//     if (donationData.email !== null && donationData.amount !== null) {
//         document.querySelector('.donateButton').disabled = false;
//         return;
//     }
//     else if (donationData.amount === null) document.querySelector('.donateButtonAmount').innerHTML = '';
//     document.querySelector('.donateButton').disabled = true;
//     return;
// }

// function checkIncentiveStatus() {
//     if (selectedIncentive.id && selectedIncentive.amount) {
//         if (selectedIncentive.type !== 'bidwar') document.querySelector('#incentiveAddConfirm').disabled = false;
//         else if (selectedIncentive.option !== undefined && selectedIncentive.option !== null) document.querySelector('#incentiveAddConfirm').disabled = false;
//         else if (selectedIncentive.userOption !== undefined && selectedIncentive.userOption !== null) document.querySelector('#incentiveAddConfirm').disabled = false;
//     }
//     else document.querySelector('#incentiveAddConfirm').disabled = true;
// }

// Incentive logic.
// function showIncentiveInfo(element) {
//     const divs = document.querySelectorAll('.incentiveList .incentiveListDiv');
//     for (const div of divs) { div.classList.remove('selected') }
//     element.classList.add('selected');
//     let incentive = donationDetails.incentives.find(x => x.id === element.getAttribute('incentiveid'))
//     let info = document.querySelector('.incentiveInfo');
//     selectedIncentive.id = element.getAttribute('incentiveid');
//     selectedIncentive.type = incentive.type;
//     calculateIncentiveAmountRemaining();
//     info.querySelector('.incentiveGame').innerHTML = incentive.run.game;
//     info.querySelector('.incentiveName').innerHTML = incentive.name;
//     info.querySelector('.incentiveDescription').innerHTML = incentive.description;
//     info.querySelector('.inputUnit').innerHTML = details.currencySymbol;
//     info.querySelector('#incentiveAmount').style.paddingLeft = `${info.querySelector('.inputUnit').offsetWidth + 12}px`;
//     if (incentive.type === 'target') {
//         info.querySelector('.incentiveOptions').style.display = 'none';
//         info.querySelector('.incentiveTotalProgressBar').style.width = `${(((100 * incentive.total) / incentive.goal) > 100) ? 100 : (100 * incentive.total) / incentive.goal}%`;
//         info.querySelector('.incentiveTotal .incentiveTotalText').innerHTML = `Current Raised Amount: ${details.currencySymbol}${incentive.total.toFixed(2)} / ${details.currencySymbol}${incentive.goal.toFixed(2)}`
//         info.querySelector('.incentiveTotal').style.display = 'inherit';
//         info.querySelector('#incentiveAddConfirm').disabled = false;
//     }
//     else {
//         info.querySelector('#incentiveAddConfirm').disabled = true;
//         info.querySelector('.incentiveTotal').style.display = 'none';
//         info.querySelector('.incentiveOptions').innerHTML = '';
//         let incentiveOptions = incentive.options.sort((a, b) => { return b.total - a.total });
//         for (const option of incentiveOptions) {
//             let div = `
//                 <div class="incentiveOptionDiv" optionID=${option.id} onClick="selectIncentiveOption(this, false)">
//                     <input type="checkbox" class="incentiveOptionCheck"></input>
//                     <div class="incentiveOptionName">${option.name}</div>
//                     <div class="incentiveOptionAmount">${details.currencySymbol}${option.total.toFixed(2)}</div>
//                 </div>
//                 `
//             info.querySelector('.incentiveOptions').innerHTML += div;
//         }
//         if (incentive.allowUserOptions) {
//             let div = `
//             <div class="incentiveOptionDiv customOption" onClick="selectIncentiveOption(this, true)">
//                 <div class="flexbox">
//                     <input type="checkbox" class="incentiveOptionCheck" customOption="true"></input>
//                     <div class="incentiveOptionName">Nominate a new option!</div>
//                 </div>
//                 <input type="input" class="incentiveCustomOption" maxLength="${(incentive.userOptionMaxLength) ? incentive.userOptionMaxLength : 160}" onInput="incentiveAddCustomOption(this)" disabled>
//                 <div class="inputCount">
//                     <span class="inputCountCurrent">0</span>
//                     <span class="inputCountMax">&nbsp/&nbsp${(incentive.userOptionMaxLength) ? incentive.userOptionMaxLength : 160}</span>
//                 </div>
//             </div>
//             `
//             info.querySelector('.incentiveOptions').innerHTML += div;
//         }
//         info.querySelector('.incentiveOptions').style.display = 'inherit'
//     }
//     info.style.visibility = 'visible';
// }

// function addIncentiveAmount(element) {
//     if (element.value === '' || element.value < 0.01) selectedIncentive.amount = null
//     else if (parseFloat(element.value) > parseFloat(element.getAttribute('max'))) selectedIncentive.amount = parseFloat(element.getAttribute('max'))
//     else selectedIncentive.amount = parseFloat(element.value)
//     checkIncentiveStatus();
// }

// function checkIncentiveAmount(element) {
//     if (parseFloat(element.value) > parseFloat(element.getAttribute('max'))) element.value = parseFloat(element.getAttribute('max')).toFixed(2);
//     element.value = parseFloat(element.value).toFixed(2);
// }

// function selectIncentiveOption(element, custom) {
//     if (element.querySelector('.incentiveOptionCheck').checked) return;
//     for (const div of element.parentElement.querySelectorAll('.incentiveOptionDiv')) {
//         div.classList.remove('selected');
//         div.querySelector('.incentiveOptionCheck').checked = false;
//     }
//     try { element.parentElement.querySelector('.incentiveCustomOption').disabled = true } catch { };
//     selectedIncentive.option = element.getAttribute('optionid');
//     if (custom) element.querySelector('.incentiveCustomOption').disabled = false;
//     element.querySelector('.incentiveOptionCheck').checked = true;
//     element.classList.add('selected')
//     checkIncentiveStatus();
// }

// function incentiveAddCustomOption(element) {
//     element.parentElement.querySelector('.inputCountCurrent').innerHTML = element.value.length;
//     if (element.value.length > 0) selectedIncentive.userOption = element.value;
//     checkIncentiveStatus();
// }

// function addIncentive() {
//     delete selectedIncentive.type;
//     let index = donationData.incentives.findIndex(x => x.id === selectedIncentive.id);
//     if (index > -1) {
//         selectedIncentive.amount += donationData.incentives[index].amount;
//         donationData.incentives[index] = selectedIncentive;
//     }
//     else donationData.incentives.push(selectedIncentive);
//     selectedIncentive = {};
//     document.querySelector('.incentiveDiv').style.display = 'none';
//     document.querySelector('#incentiveAdd').style.display = 'inherit';
//     document.querySelector('.incentiveErrorText').style.display = 'none';
//     updateSelectedIncentives();
// }

// function showIncentiveMenu(button) {
//     for (const div of button.parentElement.querySelectorAll('.incentiveListDiv')) {
//         div.classList.remove('selected')
//     }
//     document.querySelector('.incentiveInfo').style.visibility = 'hidden'
//     button.style.display = 'none';
//     document.querySelector('.incentiveDiv').style.display = 'flex';
//     document.querySelector('.incentiveErrorText').style.display = 'inherit';
// }

// function updateSelectedIncentives() {
//     let incentiveDiv = document.querySelector('.incentiveSelected');
//     incentiveDiv.innerHTML = '';
//     for (const incentive of donationData.incentives) {
//         let info = donationDetails.incentives.find(x => x.id === incentive.id);
//         let option = '&nbsp';
//         if (incentive.option !== undefined && incentive.option !== null) try { option = `Option: ${info.options.find(x => x.id === incentive.option).name}` } catch { option = '&nbsp' }
//         else if (incentive.userOption !== undefined) option = `Option: ${incentive.userOption}`;
//         let div = `
//             <div class="incentiveSelectedDiv">
//                 <div class="incentiveSelectedLeftDiv">
//                     <div class="incentiveGame">${info.run.game}</div>
//                     <div class="incentiveName">${info.name}</div>
//                     <div class="incentiveOption">${option}</div>
//                 </div>
//                 <div class="incentiveSelectedRightDiv">
//                     <div class="incentiveAmount">${details.currencySymbol}${parseFloat(incentive.amount).toFixed(2)}</div>
//                     <button type="button" class="incentiveSelectedRemove" onClick="removeIncentive('${info.id}')">Remove</button>
//                 </div>
//             </div>
//         `

//         incentiveDiv.innerHTML += div;
//     }
//     if (Math.abs(donationData.incentives.reduce((sum, x) => sum - x.amount, 0)) >= donationData.amount) return document.querySelector('#incentiveAdd').style.display = 'none';
//     else if (donationData.incentives.length > 0) document.querySelector('#incentiveAdd').innerHTML = 'Add Another Incentive';
//     else document.querySelector('#incentiveAdd').innerHTML = 'Add Incentives'
//     document.querySelector('#incentiveAdd').style.display = 'inherit';
// }

// function calculateIncentiveAmountRemaining() {
//     let amount = parseFloat(document.querySelector('#amount input').value);
//     if (donationData.incentives.length > 0) amount += donationData.incentives.reduce((sum, x) => sum - x.amount, 0);
//     let input = document.querySelector('.incentiveInfo #incentiveAmount');
//     input.value = amount.toFixed(2);
//     input.setAttribute('max', amount);
//     document.querySelector('.incentiveInfo .inputSubtext').innerHTML = `You have <b>${details.currencySymbol}${parseFloat(amount).toFixed(2)}</b> remaining.`;
//     addIncentiveAmount(input)
// }

// function removeIncentive(id) {
//     donationData.incentives.splice(donationData.incentives.indexOf(x => x.id === id), 1);
//     updateSelectedIncentives();
//     calculateIncentiveAmountRemaining();
// }

// function showPrize() {
//     return;
// }

// function updateCounter(element) {
//     element.parentElement.querySelector('.inputCountCurrent').innerHTML = element.value.length;
// }
