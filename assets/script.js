
// Here declare a variable to store the searched city weather
let city="";
// variable declaration
let srchCity = $("#srchCity");
let srchButton = $("#srch-btn");
let clearhisBtn = $("#clear-His");
let cCity = $("#current-city");
let currentTemp = $("#temperature");
let cHumidity= $("#humidity");
let cWindSpeed=$("#wind-speed");
let cUltravioletIndex= $("#uv-index");

let sCity=[];


// Prevent & Handle searches of the city to see if it persists in the entries from the storage

function find(c){
    for (let i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Below is My Open Weather API key 

let APIKey="297e94e2d8bc915953732e39dd99e34b";

// Display the curent and future weather to the user after grabing the city form the input text box
function displayW(event){
    event.preventDefault();
    if(srchCity.val().trim()!==""){
        city=srchCity.val().trim();
        currentWthr(city);
    }
}
// Here we create the AJAX call
function currentWthr(city){
    
    // Here we built the URL so we can get the data from server
    
let queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey; 
    
    // Using AJAX (Asynchronous JavaScript And XML)

    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display the current weather including the City name. the Date and the weather icon 
        console.log(response);
        
        //Data object from server Api for icon property.
        let weathericon= response.weather[0].icon;
        let iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        let date=new Date(response.dt*1000).toLocaleDateString();
        
        //parse the response for name of city and concanatig the date and icon.
        $(cCity).html(response.name +" ("+date+")" + "<img src="+iconurl+">");
        
        // parse the response to display the current temperature.
        // We want convert the temperature to fahrenheit, bcz of USA unit
        let tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemp).html((tempF).toFixed(2)+"&#8457");
        
        // Display the Humidity
        $(cHumidity).html(response.main.humidity+"%");
        
        //Display Wind speed and convert to MPH
        let ws=response.wind.speed;
        let windsmph=(ws*2.237).toFixed(1);
        $(cWindSpeed).html(windsmph+"MPH");
        
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UltravioletIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addUptoList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addUptoList(city);
                }
            }
        }

    });
}
    // This function returns the UVIindex response.
function UltravioletIndex(ln,lt){
    
    //lets build the url for uvindex.
          
    let uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(cUltravioletIndex).html(response.value);
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    let dayover= false;
    let queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            let date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            let iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            let iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            let tempK= response.list[((i+1)*8)-1].main.temp;
            let tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            let humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

//Daynamically add the passed city on the search history
function addUptoList(c){
    let listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

// display the past search again when the list group item is clicked in search history
function invokePreviousSrch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWthr(city);
    }

}

// render function
function loadlastCty(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addUptoList(sCity[i]);
        }
        city=sCity[i-1];
        currentWthr(city);
    }

}
//Clear the search history from the page
function clearHis(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
// Here are Handlers - click on handlers
$("#srch-btn").on("click",displayW);
$(document).on("click",invokePreviousSrch);
$(window).on("load",loadlastCty);
$("#clear-His").on("click",clearHis);


















