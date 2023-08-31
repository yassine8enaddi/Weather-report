const cityNameInput = document.querySelector("[data-city-name]");
const searchBtn = document.querySelector("[data-search-btn]");
const currentLocationBtn = document.querySelector(
  "[data-current-location-btn]"
);
const currentWeatherDiv = document.querySelector("[data-current-weather]");
const weatherCardsDiv = document.querySelector("[data-weather-cards]");

const API_KEY = "YOUR_API_KEY";

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // HTML for the main weather card
    return `<div class="weather-details">
                  <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                  <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                    2
                  )}°C</h4>
                  <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                  <h4>Humidity: ${weatherItem.main.humidity}%</h4>
              </div>
              <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${
                    weatherItem.weather[0].icon
                  }@4x.png" alt="weather-icon">
                  <h4>${weatherItem.weather[0].description}</h4>
              </div>`;
  } else {
    // HTML for the other five day forecast card
    return `<li class="card">
                  <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                  <img src="https://openweathermap.org/img/wn/${
                    weatherItem.weather[0].icon
                  }@4x.png" alt="weather-icon">
                  <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(
                    2
                  )}°C</h4>
                  <h4 class="wind">Wind: ${weatherItem.wind.speed} M/S</h4>
                  <h4>Humidity: ${weatherItem.main.humidity}%</h4>
              </li>`;
  }
};

async function getWeatherDetails(cityName, lat, lon) {
  const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  try {
    const res = await fetch(WEATHER_API_URL);
    const data = await res.json();
    const uniqueForeCastDays = [];
    // filtering the response's data to get only the current day's weather details and a also the weather details of the next 5 days
    const fiveDaysForecast = data.list.filter((foreCast) => {
      const foreCastDate = new Date(foreCast.dt_txt).getDate();
      if (!uniqueForeCastDays.includes(foreCastDate)) {
        return uniqueForeCastDays.push(foreCastDate);
      }
    });

    cityNameInput.value = "";
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    fiveDaysForecast.forEach((weatherItem, index) => {
      const html = createWeatherCard(cityName, weatherItem, index);
      if (index === 0) {
        currentWeatherDiv.insertAdjacentHTML("beforeend", html);
      } else {
        weatherCardsDiv.insertAdjacentHTML("beforeend", html);
      }
    });
  } catch {
    console.log(
      "Error: fetching the weather details failed. Unable to retrieve requested data."
    );
  }
}

// getting the coordinates of entered city
async function getCoordinates() {
  const cityName = cityNameInput.value;
  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  try {
    const res = await fetch(GEOCODING_API_URL);
    const data = await res.json();
    if (!data.length) return alert(`No coordinates found for ${cityName}`);
    else {
      // getting the name, latitude and longitude of the entered city
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    }
  } catch {
    console.log(
      "Error: Fetching operation failed. Unable to retrieve requested data."
    );
  }
}

// this function has the same functionality as the getcoordinates function, the difference is that it makes an api call to the reverse geoding api to get the city's name using on the latitude and longitude values
function getUserCoordiantes() {
  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const { latitude, longitude } = position.coords;

      const REVERSE_GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      const res = await fetch(REVERSE_GEOCODING_API_URL);
      const data = await res.json();
      const cityName = data[0].name;

      getWeatherDetails(cityName, latitude, longitude);
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED)
        console.log(
          "Geolocation request denied. Please reset location permission to grant acces again."
        );
    }
  );
}

searchBtn.addEventListener("click", getCoordinates);
currentLocationBtn.addEventListener("click", getUserCoordiantes);
cityNameInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCoordinates()
);
