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
                getTodaysWeather(newCity);
                getForecast(newCity);
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
    }

    function printHistory () {
        for (let i = 0; i < existingHistory.length; i++) {
            var liEl = document.createElement("li");
            liEl.id = i;
            liEl.classList.add("list-group-item", "list-group-item-action");
            liEl.textContent = existingHistory[i];
            $("#history").append(liEl);

            liEl.addEventListener("click", function (event) {
                var id = this.id;
                var city = existingHistory[id];
                existingHistory.splice(id, 1);
                existingHistory.unshift(city);
                localStorage.setItem('history', JSON.stringify(existingHistory));
                location.reload();
            })
        }
    }

    function getTodaysWeather (city) {
        var endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d91f911bcf2c0f925fb6535547a5ddc9&units=imperial`;
        fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
            var today = new Date();
            var formatToday = today.toLocaleDateString();
            //var formatToday = `${today.getMonth() + 1}/${today.getDate()}`;
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

        document.querySelector('#city-today').textContent = city;
    };

    function getForecast (city) {
        $("#five-day").removeAttr("hidden");
        var dayCounter = 0;
        var endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=d91f911bcf2c0f925fb6535547a5ddc9&units=imperial`;
        fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
            for (let i = 0; i < data.list.length; i++) {

                // this conditional ensures that we are only getting one set of data for each day, in this case the data at 3pm
                if (data.list[i].dt_txt.indexOf('15:00:00') !== -1) {
                    dayCounter++;

                    var rawDate = new Date(data.list[i].dt_txt);
                    var date = rawDate.toLocaleDateString();
                    document.querySelector(`#date-day${dayCounter}`).textContent = date;
                
                    var temp = data.list[i].main.temp;
                    document.querySelector(`#temp-day${dayCounter}`).textContent = `${temp} °F`;

                    var windSpeed = data.list[i].wind.speed;
                    document.querySelector(`#wind-speed-day${dayCounter}`).textContent = `${windSpeed} MPH`;

                    var humidity = data.list[i].main.humidity;
                    document.querySelector(`#humidity-day${dayCounter}`).textContent = `${humidity}%`;
                }
            }
        })
    }

    function getUV(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=d91f911bcf2c0f925fb6535547a5ddc9&lat=${lat}&lon=${lon}`)
          .then((response) => response.json())
          .then((data) => {
                document.querySelector('#UV-today').textContent = data.value;
                var liUV = document.querySelector('#UV-today-li');

                if (data.value < 3) {
                    $(liUV).addClass(['btn', 'btn-success']);
                } else if (data.value > 7) {
                    $(liUV).addClass(['btn', 'btn-danger']);
                } else {
                    $(liUV).addClass(['btn', 'btn-warning']);
                }
          })
    }

    getTodaysWeather(existingHistory[0]);
    getForecast(existingHistory[0]);

    printHistory();
    
    $("#btn").on('click', getCitySearched);

    $('#clearBtn').on('click', function () {
        localStorage.clear();
        location.reload();
    });
});