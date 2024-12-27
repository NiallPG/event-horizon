
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

        // relevance score calculation for each asteroid
        const scoredAsteroids = asteroids.map(asteroid => {
            const closeApproach = asteroid.close_approach_data[0];
            const approachTime = new Date(closeApproach.close_approach_date_full).getTime();
            const missDistanceLunar = parseFloat(closeApproach.miss_distance.lunar);
            const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_hour);
            const diameter = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
            
            // individual scores
            const timeScore = 1 - ((approachTime - today.getTime()) / (24 * 60 * 60 * 1000));
            const proximityScore = 1 - (missDistanceLunar / 100);
            const sizeScore = Math.min(diameter / 1, 1);
            const velocityScore = Math.min(velocity / 50000, 1);
            
            // weighted relevance score
            const relevanceScore = (
                (timeScore * 0.3) +
                (proximityScore * 0.3) +
                (sizeScore * 0.2) +
                (velocityScore * 0.1) +
                (asteroid.is_potentially_hazardous_asteroid ? 0.1 : 0)
            );

            return {...asteroid, relevanceScore};
        });

        return scoredAsteroids.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
        console.error('Error fetching asteroid data:', error);
        return [];
    }
}

async function updateAsteroidTable() {
    const refreshBtn = document.getElementById('refresh-asteroids');
    const tbody = document.querySelector('.asteroid-tracker tbody');
    
    // show loading state
    refreshBtn.textContent = 'Refreshing...';
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading new data...</td></tr>';
    
    const asteroids = await fetchAsteroidData();
    
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
        tbody.innerHTML = '<tr><td colspan="7">No asteroid data available</td></tr>';
    }
    
    // update refresh button with full timestamp
    const now = new Date().toLocaleTimeString();
    refreshBtn.textContent = `Last Updated: ${now}`;
    
    // reset button text after 3 seconds
    setTimeout(() => {
        refreshBtn.textContent = 'Refresh Data';
    }, 3000);
}

document.getElementById('refresh-asteroids')?.addEventListener('click', (e) => {
    e.preventDefault();
    updateAsteroidTable();
});


// kind of shit, refactoring for another day 

function calculatePlanetVisibility() {
    const planets = [
        { name: 'Mercury', period: 88, icon: 'track_changes' },
        { name: 'Venus', period: 225, icon: 'brightness_5' },
        { name: 'Mars', period: 687, icon: 'radio_button_unchecked' },
        { name: 'Jupiter', period: 4333, icon: 'album' },
        { name: 'Saturn', period: 10759, icon: 'radio_button_checked' },
        { name: 'Uranus', period: 30687, icon: 'circle' },
        { name: 'Neptune', period: 60190, icon: 'lens' }
    ];

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));

    return planets.map(planet => {
        const angle = (2 * Math.PI * dayOfYear) / planet.period;
        const sinValue = Math.sin(angle);
        
        let visibility = '';
        if (sinValue > 0.3) {
            visibility = 'Evening Sky';
        } else if (sinValue < -0.3) {
            visibility = 'Morning Sky';
        } else {
            visibility = 'Not Visible';
        }

        const brightness = Math.abs(sinValue) * 100;
        
        return {
            ...planet,
            visibility,
            brightness: Math.round(brightness)
        };
    });
}

function updatePlanetVisibility() {
    const planets = calculatePlanetVisibility();
    const planetsContainer = document.querySelector('.planet-visibility .planets-container');
    
    if (planetsContainer) {
        planetsContainer.innerHTML = planets.map(planet => `
            <div class="planet ${planet.visibility === 'Not Visible' ? 'not-visible' : ''}">
                <div class="icon">
                    <span class="material-icons-sharp">
                        ${planet.icon}
                    </span>
                </div>
                <div class="content">
                    <div class="info">
                        <h3>${planet.name}</h3>
                        <small class="text_muted">
                            ${planet.visibility} (${planet.brightness}% Brightness)
                        </small>
                    </div>
                    <span class="material-icons-sharp">
                        ${planet.visibility !== 'Not Visible' ? 'brightness_5' : 'brightness_2'}
                    </span>
                </div>
            </div>
        `).join('');
    }
}



document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark-mode-variables');
    darkMode.querySelector('span:nth-child(1)').classList.add('active');
    darkMode.querySelector('span:nth-child(2)').classList.remove('active');
    updateSpaceWeather();
    updateMoonPhase();
    updateAsteroidTable();
    updatePlanetVisibility();
    
    setInterval(() => {
        updateSpaceWeather();
        updateMoonPhase();
        updateAsteroidTable();
        updatePlanetVisibility();
    }, 1800000);
});