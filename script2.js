window.addEventListener('load', function() {
    // get search history from storage, or if there isn't a history in storage, start with an empty array
    var existingHistory = JSON.parse(localStorage.getItem('history')) || [];
    console.log(existingHistory);

    // function for setting new cities into local storage
    function handleHistory (newCity) {
        // if the city is already in storage, don't add it again
        for (let i = 0; i<existingHistory.length; i++) {
            if (existingHistory[i].toLowerCase() === newCity.toLowerCase()){
                console.log("already in history")
                //run getWeather function for this city
                return;
            };
        };
        // add new city to storage as the first item or at the end of the existing array
        if (existingHistory == []) {
            var newHistory = [newCity];
            localStorage.setItem('history', JSON.stringify(newHistory));
        } else {
            var newHistory = [newCity, ...existingHistory];
            localStorage.setItem('history', JSON.stringify(newHistory));
        }
        location.reload();
    };

    function getCitySearched() {
        var citySearched = $("#city-search").val();
        console.log(citySearched);
        if (citySearched) {
            // searchWeather(citySearched);
            handleHistory(citySearched);
            document.querySelector('#city-search').value = '';
        }
        $('#city-today').textContent = citySearched;
    }

    function printHistory () {
        for (let i = 0; i < existingHistory.length; i++) {
            var liEl = document.createElement("li");
            liEl.classList.add("list-group-item", "list-group-item-action");
            liEl.textContent = existingHistory[i];
            $("#history").append(liEl);
        }
    }

    function getTodaysWeather (city) {
        var endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d91f911bcf2c0f925fb6535547a5ddc9&units=imperial`;
        fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
            var today = new Date();
            var formatToday = `${today.getMonth() + 1}/${today.getDate()}`
            document.querySelector("#date-today").textContent = formatToday;

            var tempToday = data.main.temp;
            document.querySelector("#temp-today").textContent = `${tempToday} °F`;

            var feelsLikeToday = data.main.feels_like;
            document.querySelector("#feels-like-today").textContent = `${feelsLikeToday} °F`;

            var humidityToday = data.main.humidity;
            document.querySelector("#humidity-today").textContent = `${humidityToday}%`;

            //var skiesToday = data.weather.description;
            //document.querySelector("#skies-today").textContent = skiesToday;
          })
    }

    getTodaysWeather(existingHistory[0]);

    printHistory();

    document.querySelector('#city-today').textContent = existingHistory[0];
    
    $("#btn").on('click', getCitySearched);

    $('#clearBtn').on('click', function () {
        localStorage.clear();
        location.reload();
    });
});