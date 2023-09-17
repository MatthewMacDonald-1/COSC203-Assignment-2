const itemPane = document.getElementById("item_pane");

let current_filter = {
    'search': '',
    'order': -1,
    'family': -1,
    'conservation_status': -1
}
const filterNone = current_filter;

const sortMaoriAsc = 0;
const sortMaoriDesc = 1;
const sortEnglishAsc = 2;
const sortEnglishDesc = 3;
const sortScientificNameAsc = 4;
const sortScientificNameDesc = 5;
const sortOrderAsc = 6;
const sortOrderDesc = 7;
const sortFamilyAsc = 8;
const sortFamilyDesc = 9;
const sortConsStatusAsc = 10;
const sortConsStatusDesc = 11;
const sortLengthAsc = 12;
const sortLengthDesc = 13;
const sortWeightAsc = 14;
const sortWeightDesc = 15;
const sortDefault = sortMaoriAsc;
let selected_sort = sortDefault;

function processTextForComparison(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function ascComparator(a, b) {
    if (a > b) { return 1; }
    if (a < b) { return -1; }
    return 0;
}
function descComparator(a, b) {
    if (a < b) { return 1; }
    if (a > b) { return -1; }
    return 0;
}

let previousData = undefined;
let previousQuery = undefined;

async function showData(filter = filterNone, sort = 0) {
    console.log('/api/birds?family=' + filter.family + '&order=' + filter.order + '&conservation_status=' + filter.conservation_status + '&search=' + (filter.search != '' ? filter.search : '-1') + ''); // the query to the API

    let data = previousData;
    if (data == undefined || filter.search !== previousQuery.search || filter.family !== previousQuery.family || filter.order !== previousQuery.order || filter.conservation_status !== previousQuery.conservation_status) {
        // console.log("not the same");
        let response = await fetch('/api/birds?family=' + filter.family + '&order=' + filter.order + '&conservation_status=' + filter.conservation_status + '&search=' + (filter.search != '' ? filter.search : '-1') + '');
        data = await response.json();
        previousData = data;
        previousQuery = JSON.parse(JSON.stringify(filter));
    } else {
        // console.log("the same");
    }

    

    let finalData = sortCards(data, sort);

    let pageContent = '';

    for (let i = 0; i < finalData.length; i++) {
        pageContent += generateItemCard(finalData[i]);
    }

    itemPane.innerHTML = pageContent;
    checkHeight();
    createEventListeners();
}

function filterCards(array, filter) {
    let filtered = [];

    for (let i = 0; i < array.length; i++) {
        let add = true
        if (filter.order !== -1) {
            if (array[i].order !== filter.order) { add = false }
        }
        if (filter.family !== -1 && add) {
            if (array[i].family !== filter.family) { add = false }
        }
        if (filter.conservation_status !== -1 && add) {
            if (statusLookUp(array[i].status, 1) != filter.conservation_status) { add = false }
        }
        if (filter.search !== '' && add) {
            let contains = false;
            if (
                processTextForComparison(array[i].primary_name).includes(filter.search) ||
                processTextForComparison(array[i].english_name).includes(filter.search) ||
                processTextForComparison(array[i].scientific_name).includes(filter.search) ||
                processTextForComparison(array[i].order).includes(filter.search) ||
                processTextForComparison(array[i].family).includes(filter.search) ||
                processTextForComparison(array[i].status).includes(filter.search) ||
                processTextForComparison(array[i].photo.credit).includes(filter.search) ||
                array[i].size.length.value.toString().includes(filter.search) ||
                array[i].size.weight.value.toString().includes(filter.search)) {
                contains = true;
            }

            if (!contains) {
                let otherNames = array[i].other_names;
                for (let i = 0; i < otherNames.length; i++) {
                    if (processTextForComparison(otherNames[i]).includes(filter.search)) {
                        contains = true;
                    }
                }
            }

            if (!contains) { add = false }
        }

        if (add) {
            filtered.push(array[i]);
        }
    }
    return filtered;
}

function sortCards(array, sort) {
    switch (sort) {
        case sortMaoriAsc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.primary_name);
                let valB = processTextForComparison(b.primary_name);
                return ascComparator(valA, valB);
            });
            break;
        case sortMaoriDesc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.primary_name);
                let valB = processTextForComparison(b.primary_name);
                return descComparator(valA, valB);
            });
            break;
        case sortEnglishAsc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.english_name);
                let valB = processTextForComparison(b.english_name);
                return ascComparator(valA, valB);
            });
            break;
        case sortEnglishDesc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.english_name);
                let valB = processTextForComparison(b.english_name);
                return descComparator(valA, valB);
            });
            break;
        case sortScientificNameAsc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.scientific_name);
                let valB = processTextForComparison(b.scientific_name);
                return ascComparator(valA, valB);
            });
            break;
        case sortScientificNameDesc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.scientific_name);
                let valB = processTextForComparison(b.scientific_name);
                return descComparator(valA, valB);
            });
            break;
        case sortOrderAsc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.order_name);
                let valB = processTextForComparison(b.order_name);
                return ascComparator(valA, valB);
            });
            break;
        case sortOrderDesc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.order_name);
                let valB = processTextForComparison(b.order_name);
                return descComparator(valA, valB);
            });
            break;
        case sortFamilyAsc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.family);
                let valB = processTextForComparison(b.family);
                return ascComparator(valA, valB);
            });
            break;
        case sortFamilyDesc:
            array.sort((a, b) => {
                let valA = processTextForComparison(a.family);
                let valB = processTextForComparison(b.family);
                return descComparator(valA, valB);
            });
            break;
        case sortConsStatusAsc:
            array.sort((a, b) => {
                let valA = a.status_id;
                let valB = b.status_id;
                return ascComparator(valA, valB);
            });
            break;
        case sortConsStatusDesc:
            array.sort((a, b) => {
                let valA = a.status_id;
                let valB = b.status_id;
                return descComparator(valA, valB);
            });
            break;
        case sortLengthAsc:
            array.sort((a, b) => {
                let valA = parseInt(a.length, 10);
                let valB = parseInt(b.length, 10);
                return ascComparator(valA, valB);
            });
            break;
        case sortLengthDesc:
            array.sort((a, b) => {
                let valA = parseInt(a.length, 10);
                let valB = parseInt(b.length, 10);
                return descComparator(valA, valB);
            });
            break;
        case sortWeightAsc:
            array.sort((a, b) => {
                let valA = parseInt(a.weight, 10);
                let valB = parseInt(b.weight, 10);
                return ascComparator(valA, valB);
            });
            break;
        case sortWeightDesc:
            array.sort((a, b) => {
                let valA = parseInt(a.weight, 10);
                let valB = parseInt(b.weight, 10);
                return descComparator(valA, valB);
            });
            break;
    }
    return array;
}

const statusLookUp_css_selector = 0;
const statusLookUp_num_value = 1;
function statusLookUp(natLang, opt = 0) {
    dict = {
        "Not Threatened": ["csc_not_threatened", 1],
        "Naturally Uncommon": ["csc_naturally_uncommon", 2],
        "Relict": ["csc_relict", 3],
        "Recovering": ["csc_recovering", 4],
        "Declining": ["csc_declining", 5],
        "Nationally Increasing": ["csc_nationally_increasing", 6],
        "Nationally Vulnerable": ["csc_nationally_vulnerable", 7],
        "Nationally Endangered": ["csc_nationally_endangered", 8],
        "Nationally Critical": ["csc_nationally_critical", 9],
        "Extinct": ["csc_extinct", 10],
        "Data Deficient": ["csc_data_deficient", 11]
    }

    if (dict[natLang] != null) {
        return dict[natLang][opt];
    } else {
        return dict['Data Deficient'][opt];
    }
}

function generateItemCard(data) {
    const imageSource = (data.filename == null ? 'no-image.png' : data.filename);
    const imageCredit = (data.photographer == null ? '' : data.photographer);
    let template = `
    <a class="item_card" href="/birds/${data.bird_id}">
        <div class="image_container">
            <img src="/images/${imageSource}" alt="${data.primary_name}/${data.english_name}. Credit: ${imageCredit}">
            <span><img class="camera_logo" src="/assets/images/camera-solid.svg" alt="Camera Logo">${imageCredit}</span>
        </div>
        <div class="description">
            <div class="item_card_name">
                <span>${data.primary_name}</span>
                <hr>
                <span>${data.english_name}</span>
            </div>
            <hr>
            <table class="properties">
                <tr><td class="row_name">Scientific Name</td><td>${data.scientific_name}</td></tr>
                <tr><td class="row_name">Family</td><td>${data.family}</td></tr>
                <tr><td class="row_name">Order</td><td>${data.order_name}</td></tr>
                <tr><td class="row_name">Status</td><td>${data.status_name}</td></tr>
                <tr><td class="row_name">Length</td><td>${data.length} cm</td></tr>
                <tr><td class="row_name">Weight</td><td>${data.weight} g</td></tr>
            </table>

            <div class="item_card-controls">
                <button type="button" class="bird-edit-button" birdid="${data.bird_id}">Edit</button>
                <button type="button" class="bird-delete-button" birdid="${data.bird_id}">Delete</button>
            </div>
        </div>
        <div class="dot_over">
            <div class="color_id ${data.status_css_tag_partial}-bg"></div>
        </div>
    </a>
    `;

    return template;
}

// initialize();

function runShowDataWithParams() {
    showData(current_filter, selected_sort);
    checkHeight();
}

let sortByDropDown = document.getElementById('sort_byFeild');
sortByDropDown.addEventListener('change', function () {
    try {
        selected_sort = parseInt(sortByDropDown.children[sortByDropDown.selectedIndex].getAttribute('value'));
        runShowDataWithParams();
    } catch {
        // Do nothing
    }
});

let filterOrder = document.getElementById('filter_order');
filterOrder.addEventListener('change', function () {
    checkOrder();
    runShowDataWithParams();
});
function checkOrder() {
    if (filterOrder.children[filterOrder.selectedIndex].textContent != 'All') {
        current_filter.order = filterOrder.children[filterOrder.selectedIndex].textContent;
    } else {
        current_filter.order = -1;
    }
}

let filterFamily = document.getElementById('filter_family');
filterFamily.addEventListener('change', function () {
    checkFamily();
    runShowDataWithParams();
});
function checkFamily() {
    if (filterFamily.children[filterFamily.selectedIndex].textContent != 'All') {
        current_filter.family = filterFamily.children[filterFamily.selectedIndex].textContent;
    } else {
        current_filter.family = -1;
    }
}

let filterConsStatus = document.getElementById('filter_consStatus');
filterConsStatus.addEventListener('change', function () {
    checkConsStatus();
    runShowDataWithParams();
});
function checkConsStatus() {
    if (filterConsStatus.children[filterConsStatus.selectedIndex].textContent != 'All') {
        current_filter.conservation_status = statusLookUp(filterConsStatus.children[filterConsStatus.selectedIndex].textContent, 1);
    } else {
        current_filter.conservation_status = -1;
    }
}

let filterResultsBtn = document.getElementById('filter_results_btn');
filterResultsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    checkOrder();
    checkFamily();
    checkConsStatus();
    checkTextField();
    runShowDataWithParams();
});

let textSearch = document.getElementById('text_search_all_fields');
textSearch.addEventListener('keyup', textSearchEventFunction);

function textSearchEventFunction() {
    checkTextField();
    runShowDataWithParams();
}
function checkTextField() {
    current_filter.search = processTextForComparison(textSearch.value);
}

let clearAllFieldsBtn = document.getElementById('clear_all_fields_btn');
clearAllFieldsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    filterOrder.selectedIndex = 0;
    filterFamily.selectedIndex = 0;
    filterConsStatus.selectedIndex = 0;
    sortByDropDown.selectedIndex = 0;
    selected_sort = sortDefault;
    textSearch.value = '';
    checkOrder();
    checkFamily();
    checkConsStatus();
    checkTextField();
    runShowDataWithParams();
});
