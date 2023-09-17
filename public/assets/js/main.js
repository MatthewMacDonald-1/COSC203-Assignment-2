
// Event functions start --------------------------------------------------------------------------
function headerResize() {
    element = document.getElementById("main_header");
    if (element == null) {console.error("No 'main_header' id found.");return;}
    if (element.getAttribute("class") == null) {element.setAttribute("class", "");}

    if (window.scrollY > 200) {
        
        if (!element.getAttribute("class").includes("header_collapse")) {
            element.setAttribute("class", "header_collapse");
        }
    } else {
        if (element.getAttribute("class") != "") {
            element.setAttribute("class", "");
        } 
    }
}

function checkHeight() {
    element = document.getElementById("main_footer");
    if (element == null) {console.error("No 'main_footer' id found.");return;}
    if (element.getAttribute("class") == null) {element.setAttribute("class", "");}

    // console.log(document.body.getBoundingClientRect().height);

    if (document.body.getBoundingClientRect().height < (window.innerHeight - element.getBoundingClientRect().height)) {
        // console.log(true);
        element.setAttribute("class", "pin_to_bottom");
    } else {
        element.setAttribute("class", "");
    }
}

checkHeight();
// Event functions end ----------------------------------------------------------------------------

let mobilePopOutMenuBtn = document.getElementById('animated_arrow');
mobilePopOutMenuBtn.addEventListener('click', function () {
    let controlPanel = document.getElementById('controls');
    if (mobilePopOutMenuBtn.getAttribute('class') === '') {
        mobilePopOutMenuBtn.setAttribute('class', 'enabled');
        controlPanel.setAttribute('class', '');
    } else {
        mobilePopOutMenuBtn.setAttribute('class', '');
        controlPanel.setAttribute('class', 'vis_disabled');

    }
});

let mobilePopOutConsStatusKey = document.getElementById('cons_status_key_el');
mobilePopOutConsStatusKey.addEventListener('click', function () {
    if (mobilePopOutConsStatusKey.getAttribute('class') === 'cons_status_key') {
        mobilePopOutConsStatusKey.setAttribute('class', 'cons_status_key mobile_vis');
    } else {
        mobilePopOutConsStatusKey.setAttribute('class', 'cons_status_key');
    }
});