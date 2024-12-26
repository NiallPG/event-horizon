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

const lunarCycle = 29.53059 * 24 * 60 * 60 * 1000;
let daysSinceNewMoon;

function getMoonPhase() {
    const knownNewMoon = new Date(2024, 11, 12, 23, 33).getTime();
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


async function fetchAsteroidData() {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    try {
        const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${todayFormatted}&end_date=${todayFormatted}&api_key=YOUR+API`);
        const data = await response.json();
        const asteroids = data.near_earth_objects[todayFormatted];

        // relevance score is calculated for each asteroid
        const scoredAsteroids = asteroids.map(asteroid => {
            const closeApproach = asteroid.close_approach_data[0];
            const approachTime = new Date(closeApproach.close_approach_date_full).getTime();
            const missDistanceLunar = parseFloat(closeApproach.miss_distance.lunar);
            const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_hour);
            const diameter = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
            
            // individual scores
            const timeScore = 1 - ((approachTime - today.getTime()) / (24 * 60 * 60 * 1000)); // higher score for closer times
            const proximityScore = 1 - (missDistanceLunar / 100); // higher score for closer approaches
            const sizeScore = Math.min(diameter / 1, 1); // higher score for larger objects
            const velocityScore = Math.min(velocity / 50000, 1); // higher score for faster objects
            
            // weighted relevance score
            const relevanceScore = (
                (timeScore * 0.3) + // time weight: 30%
                (proximityScore * 0.3) + // proximity weight: 30%
                (sizeScore * 0.2) + // size weight: 20%
                (velocityScore * 0.1) + // velocity weight: 10%
                (asteroid.is_potentially_hazardous_asteroid ? 0.1 : 0) // hazard bonus: 10%
            );

            return {...asteroid,relevanceScore};
        });


        return scoredAsteroids.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
        console.error('Error fetching asteroid data:', error);
        return [];
    }
}

async function updateAsteroidTable() {
    const asteroids = await fetchAsteroidData();
    const tbody = document.querySelector('.asteroid-tracker tbody');
    tbody.innerHTML = '';


    if (asteroids.length > 0) {
        asteroids.slice(0, 4).forEach(asteroid => {
            const tr = document.createElement('tr');
            const closeApproach = asteroid.close_approach_data[0];
            const velocity = parseInt(closeApproach.relative_velocity.kilometers_per_hour);
            const missDistance = parseFloat(closeApproach.miss_distance.lunar).toFixed(1);
            const hazardClass = asteroid.is_potentially_hazardous_asteroid ? 'danger' : 'primary';
            const approachTime = new Date(closeApproach.close_approach_date_full).toLocaleTimeString();
            const relevancePercentage = (asteroid.relevanceScore * 100).toFixed(1);
            
            const trContent = `
                <td>${asteroid.name.replace(/[()]/g, '')}</td>
                <td>${(asteroid.estimated_diameter.kilometers.estimated_diameter_max).toFixed(2)}</td>
                <td>${missDistance}</td>
                <td class="${hazardClass}">${asteroid.is_potentially_hazardous_asteroid ? 'Warning' : 'Safe'}</td>
                <td>${velocity.toLocaleString()}</td>
                <td>${approachTime}</td>
                <td>${relevancePercentage}%</td>
            `;
            
            tr.innerHTML = trContent;
            tbody.appendChild(tr);
        });
    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7">No asteroid data available</td>';
        tbody.appendChild(tr);
    }
}

document.getElementById('refresh-asteroids')?.addEventListener('click', (e) => {
    e.preventDefault();
    updateAsteroidTable();
});

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.add('active');
    darkMode.querySelector('span:nth-child(2)').classList.remove('active');
    updateSpaceWeather();
    updateMoonPhase();
    updateAsteroidTable();
    
    setInterval(() => {
        updateSpaceWeather();
        updateMoonPhase();
        updateAsteroidTable();
    }, 1800000);
});