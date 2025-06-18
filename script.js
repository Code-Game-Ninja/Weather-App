document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial theme
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDarkScheme.matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Theme toggle button
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // API Configuration
    const API_KEY = 'eb01254f67d1400ca7e45720250104';
    const BASE_URL = 'https://api.weatherapi.com/v1';

    // DOM Elements
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const loader = document.querySelector('.loader');

    // Weather Display Elements
    const currentCity = document.querySelector('.location-info h2');
    const currentDate = document.querySelector('.location-info p');
    const currentTemp = document.getElementById('current-temp');
    const currentDesc = document.getElementById('current-desc');
    const currentIcon = document.getElementById('current-icon');
    const windSpeed = document.getElementById('wind-speed');
    const humidity = document.getElementById('humidity');
    const pressure = document.getElementById('pressure');
    const uvIndex = document.getElementById('uv-index');
    const visibility = document.getElementById('visibility');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const lastUpdated = document.getElementById('last-updated');

    // Forecast Containers
    const hourlyForecast = document.getElementById('hourly-forecast');
    const dailyForecast = document.getElementById('daily-forecast');

    // Unit Toggles
    const unitButtons = document.querySelectorAll('.unit-toggle button');
    const timeRangeButtons = document.querySelectorAll('.time-range button');

    // App State
    let currentUnit = 'c';
    let currentHours = 12;
    let currentLocation = {
        lat: 51.5074,
        lng: -0.1278,
        city: 'London'
    };

    // Initialize the app
    init();

    function init() {
        // Load default location (London)
        fetchWeather(currentLocation.lat, currentLocation.lng);

        // Event Listeners
        searchBtn.addEventListener('click', handleSearch);
        currentLocationBtn.addEventListener('click', getCurrentLocation);
        locationInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') handleSearch();
        });

        unitButtons.forEach(button => {
            button.addEventListener('click', function () {
                unitButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentUnit = this.dataset.unit;
                updateWeatherDisplay();
            });
        });

        timeRangeButtons.forEach(button => {
            button.addEventListener('click', function () {
                timeRangeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentHours = parseInt(this.dataset.hours);
                updateHourlyForecast();
            });
        });
    }

    function handleSearch() {
        const location = locationInput.value.trim();
        if (!location) return;

        fetchWeatherByLocation(location);
    }

    function getCurrentLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        showLoader();
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                fetchWeather(lat, lng);
            },
            error => {
                hideLoader();
                console.error('Geolocation error:', error);
                alert(`Unable to retrieve your location: ${error.message}. Using default location.`);
                fetchWeather(currentLocation.lat, currentLocation.lng);
            }
        );
    }

    function fetchWeatherByLocation(location) {
        showLoader();

        fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=5&aqi=no&alerts=no`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error?.message || `API request failed with status ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('API response:', data);
                processWeatherData(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert(`Failed to fetch weather data: ${error.message}. Using mock data for demonstration.`);
                processWeatherData(getMockWeatherData());
            })
            .finally(() => {
                hideLoader();
            });
    }

    function fetchWeather(lat, lng) {
        fetchWeatherByLocation(`${lat},${lng}`);
    }

    function getMockWeatherData() {
        const now = new Date();
        const mockData = {
            location: {
                name: "Demo City",
                region: "Demo Region",
                country: "Demo Country",
                lat: 51.5,
                lon: -0.12,
                localtime: now.toISOString()
            },
            current: {
                temp_c: 22,
                temp_f: 71.6,
                condition: {
                    text: "Partly cloudy",
                    icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
                    code: 1003
                },
                wind_kph: 15,
                wind_mph: 9.3,
                humidity: 65,
                pressure_mb: 1015,
                vis_km: 10,
                vis_miles: 6,
                uv: 5
            },
            forecast: {
                forecastday: Array(5).fill().map((_, i) => {
                    const date = new Date(now);
                    date.setDate(date.getDate() + i + 1);

                    return {
                        date: date.toISOString().split('T')[0],
                        day: {
                            maxtemp_c: 24 + i,
                            maxtemp_f: 75.2 + (i * 1.8),
                            mintemp_c: 16 + i,
                            mintemp_f: 60.8 + (i * 1.8),
                            avgtemp_c: 20 + i,
                            avgtemp_f: 68 + (i * 1.8),
                            condition: {
                                text: i % 2 ? "Sunny" : "Partly cloudy",
                                icon: i % 2 ?
                                    "//cdn.weatherapi.com/weather/64x64/day/113.png" :
                                    "//cdn.weatherapi.com/weather/64x64/day/116.png",
                                code: i % 2 ? 1000 : 1003
                            },
                            uv: 5 + i
                        },
                        hour: Array(24).fill().map((_, h) => {
                            return {
                                time: `${date.toISOString().split('T')[0]} ${h.toString().padStart(2, '0')}:00`,
                                temp_c: 18 + Math.sin(h / 4) * 5,
                                temp_f: 64.4 + Math.sin(h / 4) * 9,
                                condition: {
                                    text: h < 6 || h > 18 ? "Clear" : "Partly cloudy",
                                    icon: h < 6 || h > 18 ?
                                        "//cdn.weatherapi.com/weather/64x64/night/113.png" :
                                        "//cdn.weatherapi.com/weather/64x64/day/116.png",
                                    code: h < 6 || h > 18 ? 1000 : 1003
                                },
                                wind_kph: 10 + Math.sin(h / 2) * 5,
                                wind_mph: 6.2 + Math.sin(h / 2) * 3,
                                humidity: 60 + Math.sin(h / 3) * 20,
                                precip_mm: h % 6 === 0 ? 0.5 : 0,
                                pressure_mb: 1010 + Math.sin(h / 5) * 5,
                                vis_km: 10,
                                vis_miles: 6,
                                uv: 3 + Math.sin(h / 4) * 2
                            };
                        })
                    };
                })
            }
        };

        // Add sunrise/sunset to first day
        mockData.forecast.forecastday[0].astro = {
            sunrise: "06:30 AM",
            sunset: "06:30 PM"
        };

        return mockData;
    }

    function processWeatherData(data) {
        currentLocation = {
            lat: data.location.lat,
            lng: data.location.lon,
            city: `${data.location.name}, ${data.location.country}`
        };

        currentCity.textContent = currentLocation.city;
        currentDate.textContent = formatDate(new Date(data.location.localtime));
        lastUpdated.textContent = `Last updated: ${formatTime(new Date())}`;

        // Store raw data for unit conversion
        currentLocation.weatherData = {
            current: {
                temp_c: data.current.temp_c,
                temp_f: data.current.temp_f,
                desc: data.current.condition.text,
                icon: data.current.condition.icon,
                wind_kph: data.current.wind_kph,
                wind_mph: data.current.wind_mph,
                humidity: data.current.humidity,
                pressure: data.current.pressure_mb,
                uv: data.current.uv,
                visibility: data.current.vis_km,
                sunrise: data.forecast?.forecastday[0]?.astro?.sunrise || "06:00 AM",
                sunset: data.forecast?.forecastday[0]?.astro?.sunset || "06:00 PM"
            },
            hourly: data.forecast?.forecastday[0]?.hour || [],
            daily: data.forecast?.forecastday?.slice(1, 6) || [] // Next 5 days
        };

        updateWeatherDisplay();
    }

    function updateWeatherDisplay() {
        const weather = currentLocation.weatherData.current;

        // Update current weather
        currentTemp.textContent = currentUnit === 'c' ? Math.round(weather.temp_c) : Math.round(weather.temp_f);
        currentDesc.textContent = weather.desc;
        currentIcon.innerHTML = `<img src="https:${weather.icon}" alt="${weather.desc}">`;
        windSpeed.textContent = currentUnit === 'c' ?
            `${Math.round(weather.wind_kph)} km/h` :
            `${Math.round(weather.wind_mph)} mph`;
        humidity.textContent = `${weather.humidity}%`;
        pressure.textContent = `${weather.pressure} hPa`;

        // Update UV index
        const uvValue = Math.round(weather.uv);
        uvIndex.textContent = uvValue;
        setUvIndexColor(uvValue);

        // Update visibility
        visibility.textContent = `${weather.visibility} km`;

        // Update sunrise/sunset
        sunrise.textContent = weather.sunrise;
        sunset.textContent = weather.sunset;

        // Update forecasts
        updateHourlyForecast();
        updateDailyForecast();
    }

    function updateHourlyForecast() {
        hourlyForecast.innerHTML = '';

        const hoursToShow = Math.min(currentHours, currentLocation.weatherData.hourly.length);

        for (let i = 0; i < hoursToShow; i++) {
            const hour = currentLocation.weatherData.hourly[i];
            const time = new Date(hour.time);

            const hourElement = document.createElement('div');
            hourElement.className = 'hourly-item';

            hourElement.innerHTML = `
                <span class="time">${formatHour(time)}</span>
                <div class="icon"><img src="https:${hour.condition.icon}" alt="${hour.condition.text}"></div>
                <span class="temp">${currentUnit === 'c' ? Math.round(hour.temp_c) : Math.round(hour.temp_f)}°</span>
                <span class="precip">${hour.precip_mm}mm</span>
            `;

            hourlyForecast.appendChild(hourElement);
        }
    }

    function updateDailyForecast() {
        dailyForecast.innerHTML = '';

        currentLocation.weatherData.daily.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'daily-item';

            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            dayElement.innerHTML = `
                <span class="day">${dayName}</span>
                <div class="icon"><img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}"></div>
                <div class="temps">
                    <span class="max-temp">${currentUnit === 'c' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f)}°</span>
                    <span class="min-temp">${currentUnit === 'c' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f)}°</span>
                </div>
            `;

            dailyForecast.appendChild(dayElement);
        });
    }

    function setUvIndexColor(uvIndexValue) {
        const uvElement = document.getElementById('uv-index');
        uvElement.style.backgroundColor =
            uvIndexValue >= 11 ? 'var(--danger-color)' :
                uvIndexValue >= 8 ? 'var(--warning-color)' :
                    uvIndexValue >= 6 ? '#f8961e' :
                        uvIndexValue >= 3 ? 'var(--success-color)' :
                            '#4cc9f0'; // Light blue for low UV
    }

    // Helper functions
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function formatHour(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        }).replace(' ', '');
    }

    function showLoader() {
        loader.classList.add('active');
    }

    function hideLoader() {
        loader.classList.remove('active');
    }
});