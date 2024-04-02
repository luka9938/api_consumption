
const searchButton = document.getElementById('searchButton');
searchButton.addEventListener('click', fetchCityInfo);

async function fetchCityInfo() {
    const cityInput = document.getElementById('cityInput').value;
    const openWeatherApiKey = '2dd8a9bf73beae764767996a58e7a555';
    const mapboxApiKey = 'pk.eyJ1IjoibG9zdGluZGVubWFyayIsImEiOiJjbHRmdHZzM2Mwc2Y2MnBybmlwcDh5eWVnIn0.6gprxHHe0kr1yOAFHAFGjw';
    const ticketMasterApiKey = 'RBCwUlXAfzEAj90pKDAiIbcPovejGdVi';

    try {
        // Fetching weather information from OpenWeather API
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${openWeatherApiKey}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Fetching map image from MapBox API
        const mapImageResponse = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+9ed4bd(${weatherData.coord.lon},${weatherData.coord.lat})/${weatherData.coord.lon},${weatherData.coord.lat},10,0/600x400?access_token=${mapboxApiKey}`);
        const mapImageData = await mapImageResponse.blob();
        const mapImageUrl = URL.createObjectURL(mapImageData);

        // Fetching events information from TicketMaster API
        const eventsResponse = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?keyword=${cityInput}&apikey=${ticketMasterApiKey}`);
        const eventsData = await eventsResponse.json();

        // Update elements with fetched data
        document.getElementById('cityInfo').textContent = `${cityInput}, ${weatherData.sys.country}`;
        document.getElementById('mapImage').src = mapImageUrl;

        const weatherList = document.getElementById('weatherList');
        weatherList.innerHTML = '';
        const weatherInfo = {
            'Description': weatherData.weather[0].description,
            'Temperature': `${weatherData.main.temp}°C`,
            'Humidity': `${weatherData.main.humidity}%`,
            'Wind Speed': `${weatherData.wind.speed} m/s`
        };
        for (const [key, value] of Object.entries(weatherInfo)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${key}: ${value}`;
            weatherList.appendChild(listItem);
        }

        // Displaying events information
        const eventsTableBody = document.querySelector('#eventsTable tbody');
        eventsTableBody.innerHTML = '';
        const events = eventsData._embedded?.events;
        if (events && events.length > 0) {
            events.slice(0, 5).forEach(event => {
                const eventName = event.name;
                const venueName = event._embedded?.venues[0]?.name || 'Venue information not available';
                const eventDate = new Date(event.dates.start.localDate).toLocaleDateString();
                eventsTableBody.innerHTML += `<tr><td>${eventName}</td><td>${venueName}</td><td>${eventDate}</td></tr>`;
            });
        } else {
            eventsTableBody.innerHTML = '<tr><td colspan="3">No upcoming events found.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('cityInfo').textContent = 'Error fetching city information.';
        document.getElementById('weatherInfo').textContent = '';
        document.getElementById('eventsInfo').innerHTML = '';
    }
}