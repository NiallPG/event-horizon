const sideMenu = document.querySelector('aside');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const darkMode = document.querySelector('.dark-mode');

// Add this function to update space weather metrics
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

// Your existing event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.add('active');
    darkMode.querySelector('span:nth-child(2)').classList.remove('active');
    updateSpaceWeather(); // Initial update
});

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

// Update the table rendering
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

// Optional: Add periodic updates
setInterval(updateSpaceWeather, 60000); 