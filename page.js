const el = document.querySelector("#starmap1");
const longitudeEl = document.querySelector("#longitude");
const latitudeEl = document.querySelector("#latitude");
const place = document.querySelector("#place");
const ground = document.querySelector("#ground");
const controls = document.querySelector("#controls");
const timeVal = document.querySelector("#timeVal");
const timeRange = document.querySelector("#timeRange");
const eventsContainer = document.querySelector("#event");
const eventsURL = "https://pingone.paralelo.eu/wp-json/wp/v2/class";
const carouselControls = document.querySelector("#carouselControls")
const leftBtn = document.querySelector("#left");
const rightBtn = document.querySelector("#right");


let eventsData = [];
let dateMappings = [];

async function getEventData() {
    const res = await fetch("https://pingone.paralelo.eu/wp-json/wp/v2/class");
    return await res.json();
}

getEventData().then(ev => { 
    eventsData = ev;
    eventsData = eventsData.map(a => ({ ...a, date: new Date(a.meta.datevs) }));
    dateMappings = eventsData.map(a => a.date.toDateString());
    document.dispatchEvent(new Event("EventsLoaded"));
});

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


function changeActive(oldIdx) {
    document.querySelectorAll(".eventContainer").forEach((val) => {
        if (val.dataset.index == eventsContainer.dataset.active) {
            val.style.display = "block";
        }
        if (val.dataset.index == oldIdx) {
            val.style.display = "none";
            console.log(oldIdx)
        }
    })
}

const truncateString = (string = '', maxLength = 50) => 
  string.length > maxLength 
    ? `${string.substring(0, maxLength)}…`
    : string

leftBtn.addEventListener('click', (event) => {
    const activeEl = parseInt(eventsContainer.dataset.active);
    if (activeEl != 0) {
        eventsContainer.dataset.active = activeEl - 1;
        changeActive(activeEl);
    }
})

rightBtn.addEventListener('click', (event) => {
    const activeEl = parseInt(eventsContainer.dataset.active);
    if (activeEl != document.querySelectorAll(".eventContainer").length - 1) {
        eventsContainer.dataset.active = activeEl + 1;
        changeActive(activeEl)
    }
})

let mouseDown = false;
let position = null;
let picOffset = 0;
let currentDate = new Date();
const adj = (Math.round(ground.clientWidth / window.innerWidth) - 1) 
            / Math.round(ground.clientWidth / window.innerWidth);

const planetarium = S.virtualsky({
    id: 'starmap1',
    projection: 'stereo',
    constellations: true,
    live: false,
});

document.addEventListener('EventsLoaded', () => {
    console.log(dateMappings, (new Date()).toDateString());
    if (dateMappings.includes((new Date()).toDateString())) {
        eventsContainer.style.display = "flex";
        const filteredEvents = eventsData.filter(ev => ev.date.toDateString() == (new Date()).toDateString());
        if (filteredEvents.length > 1) carouselControls.style.display = "flex";
        const eventElements = filteredEvents.map((event, idx) => {
            return `
                <div class="eventContainer" data-index="${idx}" style="display: ${idx == 0 ? 'block' : 'none'};">
                    <div class="top-card">
                        <p>${event.date.getDate()}<sup style="font-size: 1.5rem">th</sup> ${months[event.date.getMonth()]}</p>
                        <p style="font-size: 1.75rem; font-weight: 500" >${event.date.getFullYear()}</p>
                    </div>
                    <div class="bottom-card">
                        <p class="eventTitle">${event.title.rendered}</p>
                        <div class="eventDescription">${truncateString(event.content.rendered, 100)}</div>
                        <a class="eventLink" href="${event.link}" >Go to Event</a>
                    </div>
                </div>
            `;
        }).reduce((p, c) => p + c);
        
        eventsContainer.innerHTML = eventElements;
        eventsContainer.dataset.active = 0;
    } else {
        eventsContainer.style.display = "none";
        carouselControls.style.display = "none";
        eventsContainer.innerHTML = "";
    }
});

timeRange.addEventListener("input", () => {
    const val = timeRange.value;
    currentDate.setTime((new Date()).getTime() + (24 * 60 * 60 * 1000) * val);
    planetarium.updateClock(currentDate);
    planetarium.calendarUpdate();
    planetarium.draw();
    timeVal.innerHTML = currentDate.toLocaleDateString();
    if (dateMappings.includes(currentDate.toDateString())) {
        eventsContainer.style.display = "flex";
        const filteredEvents = eventsData.filter(ev => ev.date.toDateString() == currentDate.toDateString());
        if (filteredEvents.length > 1) carouselControls.style.display = "flex";
        const eventElements = filteredEvents.map((event, idx) => {
            return `
                <div class="eventContainer" data-index="${idx}" style="display: ${idx == 0 ? 'block' : 'none'};">
                    <div class="top-card">
                        <p>${event.date.getDate()}<sup style="font-size: 1.5rem">th</sup> ${months[event.date.getMonth()]}</p>
                        <p style="font-size: 1.75rem; font-weight: 500" >${event.date.getFullYear()}</p>
                    </div>
                    <div class="bottom-card">
                        <p class="eventTitle">${event.title.rendered}</p>
                        <div class="eventDescription">${truncateString(event.content.rendered, 100)}</div>
                        <a class="eventLink" href="${event.link}" >Go to Event</a>
                    </div>
                </div>
            `;
        }).reduce((p, c) => p + c);
        
        eventsContainer.innerHTML = eventElements;
        eventsContainer.dataset.active = 0;
    } else {
        eventsContainer.style.display = "none";
        carouselControls.style.display = "none";
        eventsContainer.innerHTML = "";
    }
});

let longitude = planetarium.longitude.deg.toFixed(3);
let latitude = planetarium.latitude.deg.toFixed(3);

el.addEventListener("mousedown", (e) => {
    mouseDown = true; position = e.x;
    console.log(e.x);
});

el.addEventListener("touchstart", (e) => {
    mouseDown = true; position = e.touches[0].pageX;
});

el.addEventListener("touchmove", (e) => {
    if (mouseDown) {
        ground.style.translate =  `${picOffset + (e.targetTouches[0].pageX - position)}px`;
        if (parseInt(ground.style.translate.slice(0, -2)) > 0) {
            ground.style.translate = "0px";
            planetarium.mouse = false;
        } else if (parseInt(ground.style.translate.slice(0, -2)) < -(ground.clientWidth * adj)) {
            ground.style.translate = `${-ground.clientWidth * adj}px`;
            planetarium.mouse = false;
        } else planetarium.mouse = true;
    }
});

el.addEventListener("touchend", () => { 
    mouseDown = false;
    picOffset = parseInt(ground.style.translate.slice(0, -2));
});

el.addEventListener("mouseup", () => { 
    mouseDown = false;
    picOffset = parseInt(ground.style.translate.slice(0, -2));
});

el.addEventListener("mouseleave", () => { 
    mouseDown = false;
    picOffset = isFinite(parseInt(ground.style.translate.slice(0, -2))) ? parseInt(ground.style.translate.slice(0, -2)) : 0;
});

el.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        ground.style.translate =  `${picOffset + (e.x - position)}px`;
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