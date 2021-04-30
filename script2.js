window.addEventListener("load", function() {
    // get search history from storage, or if there isn't a history in storage, start with an empty array
    var existingHistory = JSON.parse(localStorage.getItem('history')) || [];

    // function for setting new cities into local storage
    function makeHistory (newCity) {
        // if the city is already in storage, don't add it again
        for (let i = 0; i<existingHistory.length; i++) {
            if (existingHistory[i].toLowerCase() === newCity.toLowerCase()){
                //get weather and forecast for this repeated city
                getTodaysWeather(newCity);
                getForecast(newCity);
                return;
            };
        };
        // add new city to storage as the first item or at the beginning of the existing array
        if (existingHistory == []) {
            var newHistory = [newCity];
            localStorage.setItem('history', JSON.stringify(newHistory));
        } else {
            var newHistory = [newCity, ...existingHistory];
            localStorage.setItem('history', JSON.stringify(newHistory));
        };
        // reload page with new city weather results and new city at top of search list
        location.reload();
    };

    // function to capture the name of the city searched and run it thru the weather, forecast and history function, and clear input field
    function getCitySearched() {
        var citySearched = $("#city-search").val();
        if (citySearched) {
            getTodaysWeather(citySearched);
            getForecast(citySearched);
            makeHistory(citySearched);
            document.querySelector('#city-search').value = '';
        };
    };

    // loop thru each city in local storage, apply an index number as an id, add Boostrap list classes and city names
    function printHistory () {
        for (let i = 0; i < existingHistory.length; i++) {
            var liEl = document.createElement("li");
            liEl.id = i;
            liEl.classList.add("list-group-item-action", "list-group-item");
            liEl.textContent = existingHistory[i];
            $("#history").append(liEl);

            // add an event listener to each city that references that index and will move the city to the start of the array for use in the search functions
            liEl.addEventListener("click", function (event) {
                var id = this.id;
                var city = existingHistory[id];
                existingHistory.splice(id, 1);
                existingHistory.unshift(city);
                localStorage.setItem('history', JSON.stringify(existingHistory));
                location.reload();
            });
        };
    };

    // function to get today's weather
    function getTodaysWeather (city) {
        // unhide the console
        $('#console').removeAttr("hidden");
        // search API
        var endURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=af1b189b0fd1d35663b353e6a5c87f59&units=imperial`;
        fetch(endURL)
          .then((response) => response.json())
          .then((data) => {
            // put in today's date, icon of weather, temp and wind and humidity, and run UV function
            var today = new Date();
            var formatToday = today.toLocaleDateString();
            document.querySelector("#date-today").textContent = formatToday;

            $('#pic-today').attr('src', `http://openweathermap.org/img/w/${data.weather[0].icon}.png`);

            var tempToday = data.main.temp;
            document.querySelector("#temp-today").textContent = `${tempToday} °F`;

            var windToday = data.wind.speed;
            document.querySelector("#wind-speed-today").textContent = `${windToday} MPH`;

            var humidityToday = data.main.humidity;
            document.querySelector("#humidity-today").textContent = `${humidityToday}%`;

            getUV(data.coord.lat, data.coord.lon);
          });

        // put in city name into "Today's Weather in"
        document.querySelector('#city-today').textContent = city;
    };

    // get 5-day forecast
    function getForecast (city) {
        //unhide the 5-day forecast statement
        $("#five-day").removeAttr("hidden");
        //counter that links returned data to specific day ID in html
        var dayCounter = 0;
        var endURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=af1b189b0fd1d35663b353e6a5c87f59&units=imperial`;
        fetch(endURL)
          .then((response) => response.json())
          .then((data) => {
            for (let i = 0; i < data.list.length; i++) {

                // this conditional ensures that we are only getting one set of data for each day, in this case the data at noon
                if (data.list[i].dt_txt.indexOf('12:00:00') !== -1) {
                    //add 1 to day counter for reference to IDs, get info from API for next 5 days
                    dayCounter++;
                    console.log(data.list[i].dt_txt)
                    var rawDate = new Date(data.list[i].dt_txt);
                    var date = rawDate.toLocaleDateString();
                    document.querySelector(`#date-day${dayCounter}`).textContent = date;

                    $(`#pic-day${dayCounter}`).attr('src', `https://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png`);
                
                    var temp = data.list[i].main.temp;
                    document.querySelector(`#temp-day${dayCounter}`).textContent = `${temp} °F`;

                    var windSpeed = data.list[i].wind.speed;
                    document.querySelector(`#wind-speed-day${dayCounter}`).textContent = `${windSpeed} MPH`;

                    var humidity = data.list[i].main.humidity;
                    document.querySelector(`#humidity-day${dayCounter}`).textContent = `${humidity}%`;

                    var feelsLike = data.list[i].main.feels_like;
                    document.querySelector(`#feels-like-day${dayCounter}`).textContent = `${feelsLike} °F`;
                }
            }
        })
    }

    // function to get UV info for today in city
    function getUV(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=af1b189b0fd1d35663b353e6a5c87f59&lat=${lat}&lon=${lon}`)
          .then((response) => response.json())
          .then((data) => {
                document.querySelector('#UV-today').textContent = data.value;
                var liUV = document.querySelector('#UV-today-li');

                // add Bootstrap class that will color-code the UV index
                if (data.value < 3) {
                    $(liUV).addClass(['btn', 'btn-success']);
                } else if (data.value > 7) {
                    $(liUV).addClass(['btn', 'btn-danger']);
                } else {
                    $(liUV).addClass(['btn', 'btn-warning']);
                }
          })
    }

    // I designed this page to display on load the weather and forecast of the first city in the local storage array. This function ensures that these functions only run if there's at least one city in storage, and hide the console if there aren't any
    if (existingHistory.length > 0){
        getTodaysWeather(existingHistory[0]);
        getForecast(existingHistory[0]);
        printHistory();
        $('#bottomhalf').removeAttr('hidden');
    }
    
    // event listener for user-input
    $("#btn").on('click', getCitySearched);

    // event listener for clearing local storage button
    $('#clearBtn').on('click', function () {
        localStorage.clear();
        location.reload();
    });
});