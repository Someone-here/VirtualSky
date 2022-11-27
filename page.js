const el = document.querySelector("#starmap1");
const longitudeEl = document.querySelector("#longitude");
const latitudeEl = document.querySelector("#latitude");
const place = document.querySelector("#place");
const ground = document.querySelector("#ground");
const controls = document.querySelector("#controls");
const timeVal = document.querySelector("#timeVal");
const timeRange = document.querySelector("#timeRange");

el.style.height = `${window.innerHeight - 70}px`;
let mouseDown = false;
let position = null;
let picOffset = 0;
let currentDate = new Date();
const adj = (Math.round(ground.clientWidth / window.innerWidth) - 1) 
            / Math.round(ground.clientWidth / window.innerWidth);

const planetarium = S.virtualsky({
    id: 'starmap1',
    projection: 'stereo',
    // ra: 83.8220833,
    // dec: -5.3911111,
    constellations: true,
    live: false,
});

timeRange.addEventListener("input", () => {
    const val = timeRange.value;
    currentDate.setTime((new Date()).getTime() + (24 * 60 * 60 * 1000) * val);
    planetarium.updateClock(currentDate);
    planetarium.calendarUpdate();
    planetarium.draw();
    timeVal.innerHTML = currentDate.toLocaleDateString();
});

function fullScreenChange() {
    // if (!document.fullscreenElement) {
    //     controls.style.zIndex = 9999;
    //     ground.style.zIndex = 9999;
    // }
}

["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"].forEach(
    eventType => document.addEventListener(eventType, fullScreenChange, false)
);

let longitude = planetarium.longitude.deg.toFixed(3);
let latitude = planetarium.latitude.deg.toFixed(3);

el.addEventListener("mousedown", (e) => {
    mouseDown = true; position = e.x
});
el.addEventListener("mouseup", (e) => { 
    mouseDown = false; 
    picOffset = parseInt(ground.style.translate.slice(0, -2)) 
});
el.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        console.log(picOffset);
        ground.style.translate =  `${picOffset + (e.x - position)}px`;
        console.log("T", ground.style.translate);
        if (parseInt(ground.style.translate.slice(0, -2)) > 0) {
            ground.style.translate = "0px";
            planetarium.mouse = false;
        } else if (parseInt(ground.style.translate.slice(0, -2)) < -(ground.clientWidth * adj)) {
            ground.style.translate = `${-ground.clientWidth * adj}px`;
            planetarium.mouse = false;
        } else planetarium.mouse = true;
    }
})


longitudeEl.addEventListener("change", (e) => {
    const val = Number(e.target.value);
    if (!Number.isFinite(val)) return;
    if (Math.floor(val / 180) % 2 == 0) e.target.nextElementSibling.innerHTML = "East";
    else e.target.nextElementSibling.innerHTML = "West";
    planetarium.setLongitude(val).setClock(0).draw();
})
latitudeEl.addEventListener("change", (e) => {
    const val = Number(e.target.value);
    if (!Number.isFinite(val)) return;
    if (val > 0) e.target.nextElementSibling.innerHTML = "North";
    else e.target.nextElementSibling.innerHTML = "South";
    planetarium.setLatitude(val);
    planetarium.draw();
})

longitudeEl.value = longitude;
latitudeEl.value = latitude;
longitudeEl.dispatchEvent(new Event("change"));
latitudeEl.dispatchEvent(new Event("change"));
