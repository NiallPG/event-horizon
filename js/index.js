const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const darkMode = document.querySelector('.dark-mode');

function updateSpaceWeather() {
    const metrics = {
        solarActivity: Math.floor(Math.random() * 100),
        geomagneticLevel: Math.floor(Math.random() * 100),
        solarWind: 350 + Math.floor(Math.random() * 300)
    };

    document.querySelector('.sales h1').textContent = `${metrics.solarActivity}%`;
    document.querySelector('.visits h1').textContent = `${metrics.geomagneticLevel}%`;
    document.querySelector('.searches h1').textContent = `${metrics.solarWind} km/s`;
}


menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none';
});

darkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkMode.querySelector('span:nth-child(2)').classList.toggle('active');
});

SpaceEvents.forEach(event => {
    const tr = document.createElement('tr');
    const trContent = `
        <td>${event.eventName}</td>
        <td>${event.eventClass}</td>
        <td>${event.region}</td>
        <td class="${event.status === 'Warning' ? 'danger' : 
                   event.status === 'Monitoring' ? 'warning' : 'primary'}">
            ${event.status}
        </td>
        <td class="primary">Details</td>
    `;
    tr.innerHTML = trContent;
    document.querySelector('table tbody').appendChild(tr);
});

setInterval(updateSpaceWeather, 60000); 


const lunarCycle = 29.53059 * 24 * 60 * 60 * 1000;
let daysSinceNewMoon;

function getMoonPhase() {
    const knownNewMoon = new Date(2024, 12, 13).getTime();
    const now = new Date().getTime();
    
    daysSinceNewMoon = (now - knownNewMoon) % lunarCycle;
    const phase = daysSinceNewMoon / lunarCycle;
    
    if (phase < 0.0625 || phase >= 0.9375) return { name: 'New Moon', image: './images/new-moon.webp' };
    if (phase < 0.1875) return { name: 'Waxing Crescent', image: './images/waxing-crescent.webp' };
    if (phase < 0.3125) return { name: 'First Quarter', image: './images/first-quarter.webp' };
    if (phase < 0.4375) return { name: 'Waxing Gibbous', image: './images/waxing-gibbous.webp' };
    if (phase < 0.5625) return { name: 'Full Moon', image: './images/full-moon.webp' };
    if (phase < 0.6875) return { name: 'Waning Gibbous', image: './images/waning-gibbous.webp' };
    if (phase < 0.8125) return { name: 'Last Quarter', image: './images/third-quarter.webp' };
    return { name: 'Waning Crescent', image: './images/waning-crescent.webp' };
}

function updateMoonPhase() {
    const moonPhase = getMoonPhase();
    const profileSection = document.querySelector('.user-profile .logo'); 
    if (profileSection) {
        profileSection.querySelector('img').src = moonPhase.image;
        profileSection.querySelector('h2').textContent = 'Moon Phase';
        const percentage = (daysSinceNewMoon / lunarCycle * 100).toFixed(1);
        profileSection.querySelector('p').textContent = `${moonPhase.name} (${percentage}%)`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.add('active');
    darkMode.querySelector('span:nth-child(2)').classList.remove('active');
    updateSpaceWeather();
    updateMoonPhase();
    setInterval(updateMoonPhase, 3600000);
});