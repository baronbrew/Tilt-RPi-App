var app = (function() {
    // Application object
    var app = {};

    // Dictionary of beacons.
    var beacons = {};

    // Timer that displays list of beacons.
    var updateTimer = null;

    app.initialize = function() {
        //time to load and view splash screen
        window.setTimeout(onDeviceReady,1000);
    };

    function onDeviceReady() {
        
        // Start tracking beacons!
        startScan();

        // Display refresh timer.
        updateTimer = setInterval(displayBeaconList, 500);
    }

    function startScan() {
        var ws;
        var wsUri = "ws:";
        var loc = window.location;
        console.log(loc);
        if (loc.protocol === "https:") { wsUri = "wss:"; }
        // This needs to point to the web socket in the Node-RED flow
        wsUri += "//" + loc.host + ":1880/ws/beacon";
        console.log(wsUri);
        console.log("connect",wsUri);
        ws = new WebSocket(wsUri);
        //var line = "";    // either uncomment this for a building list of messages
        ws.onmessage = function(msg) {
                var beacon = JSON.parse(msg.data);
                var key = beacon.uuid;
                beacons[key] = beacon;
                console.log(key);
            }
        ws.onopen = function() {
                // update the status div with the connection status
                //document.getElementById('status').innerHTML = "connected";
                //ws.send("Open for data");
                console.log("connected");
            }
        ws.onclose = function() {
                // update the status div with the connection status
                //document.getElementById('status').innerHTML = "not connected";
                // in case of lost connection tries to reconnect every 3 secs
                setTimeout(startScan,3000);
            }
        
        function doit(m) {
            if (ws) { ws.send(m); }
        }
    }

    function displayBeaconList() {
        // Clear beacon list.
        $('#found-beacons').empty();
        var timeNow = Date.now();

        var calM = JSON.parse(localStorage.getItem($('#beerColorCal').val() + '-calM'));
        var calA = JSON.parse(localStorage.getItem($('#beerColorCal').val() + '-calA'));
        //display cal points
        var calPointsSgTable = "<table><tr><td>Uncalibrated</td><td>Actual</td></tr>";
        for (var i = 1 ; i < calM.length-1 ; i++){
            calPointsSgTable += "<tr><td>" + calM[i] + "</td>";
            calPointsSgTable += "<td>" + calA[i] + "</td></tr>";
        }
        $("#calPointsSg").html(calPointsSgTable);

        var calMTemp = JSON.parse(localStorage.getItem($('#beerColorCal').val() + '-calM-Temp'));
        var calATemp = JSON.parse(localStorage.getItem($('#beerColorCal').val() + '-calA-Temp'));
        //display cal points
        var calPointsTempTable = "<table><tr><td>Uncalibrated</td><td>Actual</td></tr>";
        for (var i = 1 ; i < calMTemp.length-1 ; i++){
            calPointsTempTable += "<tr><td>" + calMTemp[i] + "</td>";
            calPointsTempTable += "<td>" + calATemp[i] + "</td></tr>";
        }

        $("#calPointsTemp").html(calPointsTempTable);


        // Update beacon list.
        $.each(beacons, function(key, beacon) {
            // Only show beacons that are updated during the last 120 seconds.
            if (beacon.timeStamp + 120000 > timeNow) {
                // correct RSSI value when unknown.
                var rssiCorrected = -100; // Used when RSSI is zero or greater.
                if (beacon.rssi < -100) { rssiCorrected = -100; } else if (beacon.rssi < 0) { rssiCorrected = beacon.rssi; }

                var date = new Date(beacon.timeStamp);
                var dateFormatted = date.toLocaleString();

                


                var sgWidth = 1; // Used when SG is less than 990.
                if (beacon.minor > 1120) { sgWidth = 100; } else if (beacon.minor < 990) { sgWidth = 1; } else { sgWidth = (beacon.minor - 990) / 130 * 100; }

                //convert sg to plato
                var degP = 259 - (259 / sgFix3);
                var degP1 = degP.toFixed(1);

                //time since last update
                var lastUpdated = (timeNow - beacon.timeStamp) / 1000;
                var lastUpdated1 = lastUpdated.toFixed(1);

                var brewUUID = beacon.uuid;
                var brewArray = ["A495BB10C5B14B44B5121370F02D74DE",
                    "a495bb10c5b14b44b5121370f02d74de",
                    "A495BB20C5B14B44B5121370F02D74DE",
                    "a495bb20c5b14b44b5121370f02d74de",
                    "A495BB30C5B14B44B5121370F02D74DE",
                    "a495bb30c5b14b44b5121370f02d74de",
                    "A495BB40C5B14B44B5121370F02D74DE",
                    "a495bb40c5b14b44b5121370f02d74de",
                    "A495BB50C5B14B44B5121370F02D74DE",
                    "a495bb50c5b14b44b5121370f02d74de",
                    "A495BB60C5B14B44B5121370F02D74DE",
                    "a495bb60c5b14b44b5121370f02d74de",
                    "A495BB70C5B14B44B5121370F02D74DE",
                    "a495bb70c5b14b44b5121370f02d74de",
                    "A495BB80C5B14B44B5121370F02D74DE",
                    "a495bb80c5b14b44b5121370f02d74de"
                ];
                var brewVariety = ["RED", "RED", "GREEN", "GREEN", "BLACK", "BLACK", "PURPLE", "PURPLE", "ORANGE", "ORANGE", "BLUE", "BLUE", "YELLOW", "YELLOW", "PINK", "PINK"];

                for (var i = 0; i < brewArray.length; i++) {
                    if (brewUUID == brewArray[i]) {
                        var brewVarietyValue = brewVariety[i];
                    }
                }
                // Map the temperature to a width in percent for the indicator.
                // Convert Temp units and use calibratation points to display calibrated value

                var tempStandardUnits = Number(beacon.major);
                var temperatureUnitString = "°F"; 
                var maxTemp = 185;

                var useCelsiusChecked = localStorage.getItem("useCelsiusChecked");               
                if(useCelsiusChecked=="true"){
                    tempStandardUnits = (tempStandardUnits - 32) * 5 / 9;
                    temperatureUnitString = "°C";
                    maxTemp = (maxTemp - 32) * 5 / 9;
                    $('#checkUseCelsius').prop('checked', true);
                } else {
                    $('#checkUseCelsius').prop('checked', false);
                }

                var calSetMTemp = localStorage.getItem(brewVarietyValue + '-calM-Temp');
                var calSetATemp = localStorage.getItem(brewVarietyValue + '-calA-Temp');
                var calValTemp = evaluateLinear([tempStandardUnits],JSON.parse(calSetMTemp),JSON.parse(calSetATemp))[0];
                var tempWidth = (calValTemp / maxTemp) * 100;

                //Convert to degrees celsius
                var uncalTempDisplay = tempStandardUnits.toFixed(1);
                var calTempDisplay = calValTemp.toFixed(1);

                //prepare cloud post  (F)
                var calValTempCloud = calValTemp;
                if(useCelsiusChecked=="true"){
                    calValTempCloud = 1.8*calValTemp + 32;
                }
                calValTempCloud = calValTempCloud.toFixed(1);

                // Convert SG units and use calibratation points to display calibrated value
                var sgStandardUnits = beacon.minor / 1000;
                var calSetM = localStorage.getItem(brewVarietyValue + '-calM');
                var calSetA = localStorage.getItem(brewVarietyValue + '-calA');
                var calVal = evaluateLinear([sgStandardUnits],JSON.parse(calSetM),JSON.parse(calSetA));

                var sgFix3 = calVal[0].toFixed(3);
                var sgFix3Uncal = sgStandardUnits.toFixed(3);

                var brewName = localStorage.getItem(brewVarietyValue);
                if (brewName == null) {
                    brewName = "";
                }

                // Create tag to display beacon data.
                var element = $(
                    '<li>'
                    //+	'<strong>UUID: ' + beacon.uuid + '</strong><br />'
                    + brewName + '<strong>TILT | ' + brewVarietyValue + '</strong><br />' + '<div style="background:' + brewVarietyValue + ';height:40px;width:' + 100 + '%;"></div>' + 'Specific Gravity: ' + sgFix3Uncal + ' (uncal.)<br /><h1>' + sgFix3 + '</h1>' + '<div style="background:' + brewVarietyValue + ';height:10px;width:' + sgWidth + '%;"></div>' + 'Temperature: ' + uncalTempDisplay + ' (uncal.)<br /><h1>' + calTempDisplay + temperatureUnitString + '</h1>' + '<div style="background:' + brewVarietyValue + ';height:10px;width:' + tempWidth + '%;"></div>' + '<h2>' + dateFormatted + '<br />' + 'Received ' + lastUpdated1 + ' seconds ago ' + rssiCorrected + ' dBm</h2>'
                    //+	'Proximity: ' + beacon.proximity + '<br />'
                    + '</li>'
                );

                $('#warning').remove();
                $('#found-beacons').append(element);

                //save last SG to localStorage and update calibration settings section
                localStorage.setItem(brewVarietyValue + '-SG', sgFix3Uncal);
                localStorage.setItem(brewVarietyValue + '-Temp', tempStandardUnits);


                //post to cloud
                var tZoneDays = date.getTimezoneOffset() / 60 / 24;
                var t = timeNow / 1000 / 60 / 60 / 24 + 25569 - tZoneDays;
                var brewNamePost = brewName.replace("<br />", "");
                var commentPost = localStorage.getItem(brewVarietyValue + '-comment');
                
                //Post now if comment available to post
                if (commentPost != "") {
                    setTimer = Date.now()-1000;
                    //console.log(commentPost);
                }
                

                if (cloudUrl != null) {
                    $('#cloudUrl').val(cloudUrl);
                    console.log('loaded Url from localStorage:' + cloudUrl);
                    cloudUrl = null;
                    var checkCloud = localStorage.getItem("cloudChecked");
                    if (checkCloud == "true") {
                        $('#checkCloud').prop('checked', true);
                    } else {
                        $('#checkCloud').prop('checked', false);
                        console.log('post to cloud checked false');
                    }
                    // console.log('post to cloud checked=' + checkCloud);

                }
                 if (serviceUrl != null) {
                    $('#serviceUrl').val(serviceUrl);
                    console.log('loaded Url from localStorage:' + serviceUrl);
                    serviceUrl = null;                    
                }

                var brewURL = $('#cloudUrl').val();
                var brewCheck = $('#checkCloud').prop('checked');
                var brewNumber = $("#found-beacons li").length;

                //if checkbox is checked start posting to cloud
                if (brewCheck) {

                    //if timer is up start posting to cloud
                    if (timeNow - setTimer > 100) {
                        //start counting number of refresh cycles
                        displayRefresh++;
                        //List of Tilts will increment at same rate of counting refresh cycles until list repeats itself making them unequal
                        if (brewNumber != displayRefresh) {
                            setTimer += 900000;
                            displayRefresh = 0;
                        } else {
                            $.post(brewURL, { SG: sgFix3, Temp: calValTempCloud, Color: brewVarietyValue, Timepoint: t, Beer: brewNamePost, Comment: commentPost }, function(data) {
                                $("#cloudResponse").text(JSON.stringify(data));
                                console.log(data);
                            });
                                localStorage.setItem(brewVarietyValue + '-comment',"");
                                $('#commentPost').val('');
                        }
                        //console.log(brewVarietyValue);

                        //console.log(brewNumber);
                        //console.log(displayRefresh);
                        //console.log(brewNumber);

                    }
                } else { setTimer = Date.now(); }

            }
        });
    }
//initialize timer variables
    var setTimer = Date.now();
    var displayRefresh = 0;
    //initialize calibration storage if runnig app for the first time
    var initialM = JSON.stringify([0, 10]);
    var initialA = JSON.stringify([0, 10]);
    if (localStorage.getItem("storage") != "initialized"){
    localStorage.setItem("RED-calM", initialM);
    localStorage.setItem("RED-calA", initialA);
    localStorage.setItem("GREEN-calM", initialM);
    localStorage.setItem("GREEN-calA", initialA);
    localStorage.setItem("BLACK-calM", initialM);
    localStorage.setItem("BLACK-calA", initialA);
    localStorage.setItem("PURPLE-calM", initialM);
    localStorage.setItem("PURPLE-calA", initialA);
    localStorage.setItem("ORANGE-calM", initialM);
    localStorage.setItem("ORANGE-calA", initialA);
    localStorage.setItem("BLUE-calM", initialM);
    localStorage.setItem("BLUE-calA", initialA);
    localStorage.setItem("YELLOW-calM", initialM);
    localStorage.setItem("YELLOW-calA", initialA);
    localStorage.setItem("PINK-calM", initialM);
    localStorage.setItem("PINK-calA", initialA);
    //initialize comment storage
    localStorage.setItem("RED-comment", "");
    localStorage.setItem("GREEN-comment", "");
    localStorage.setItem("BLACK-comment", "");
    localStorage.setItem("PURPLE-comment", "");
    localStorage.setItem("ORANGE-comment", "");
    localStorage.setItem("BLUE-comment", "");
    localStorage.setItem("YELLOW-comment", "");
    localStorage.setItem("PINK-comment", "");

    initialM = JSON.stringify([-200, 200]);
    initialA = JSON.stringify([-200, 200]);
    localStorage.setItem("RED-calM-Temp", initialM);
    localStorage.setItem("RED-calA-Temp", initialA);
    localStorage.setItem("GREEN-calM-Temp", initialM);
    localStorage.setItem("GREEN-calA-Temp", initialA);
    localStorage.setItem("BLACK-calM-Temp", initialM);
    localStorage.setItem("BLACK-calA-Temp", initialA);
    localStorage.setItem("PURPLE-calM-Temp", initialM);
    localStorage.setItem("PURPLE-calA-Temp", initialA);
    localStorage.setItem("ORANGE-calM-Temp", initialM);
    localStorage.setItem("ORANGE-calA-Temp", initialA);
    localStorage.setItem("BLUE-calM-Temp", initialM);
    localStorage.setItem("BLUE-calA-Temp", initialA);
    localStorage.setItem("YELLOW-calM-Temp", initialM);
    localStorage.setItem("YELLOW-calA-Temp", initialA);
    localStorage.setItem("PINK-calM-Temp", initialM);
    localStorage.setItem("PINK-calA-Temp", initialA);
    //set flag that localstorage is initialized
    localStorage.setItem("storage","initialized");
}
    return app;
})();

app.initialize();

//function for setting beer name

function setBeerName() {
    var beerName = $('#beerName').val() + '<br />';
    var beerColor = $('#beerColor').val();
    localStorage.setItem(beerColor, beerName);
    console.log(beerName);
    if (beerName == '<br />') {
        localStorage.setItem(beerColor, "");
    }
}

//function for setting comment

function setComment() {
    //$('#checkCloud').prop('checked', false);
    var commentPost = $('#commentPost').val();
    var beerColorComment = $('#beerColorComment').val() + '-comment';
    localStorage.setItem(beerColorComment, commentPost);
}

//functions for app-level calibration

function setCal() {
    //get cal Tilt color from user's entry
    var beerColorCalMeas = $('#beerColorCal').val() + '-calM';
    var beerColorCalAct = $('#beerColorCal').val() + '-calA';
    //get initial/previous values
    var initialM = JSON.parse(localStorage.getItem(beerColorCalMeas));
    var initialA = JSON.parse(localStorage.getItem(beerColorCalAct));
    //combine and sort values
    initialM.push(Number($('#measuredCal').val()));
    initialM.sort(function(a, b){return a-b});
    initialA.push(Number($('#actualCal').val()));
    initialA.sort(function(a, b){return a-b});
    //save modified calibration values back to local storage
    localStorage.setItem(beerColorCalMeas, JSON.stringify(initialM));
    localStorage.setItem(beerColorCalAct, JSON.stringify(initialA));

}

function setTare() {
    clearCal();
    //get cal Tilt color from user's entry
    var beerColorCalMeas = $('#beerColorCal').val() + '-calM';
    var beerColorCalAct = $('#beerColorCal').val() + '-calA';
    //get measured value
    var measuredValue = localStorage.getItem($('#beerColorCal').val() + '-SG');
    if(measuredValue == null){
        measuredValue = "Error: Check color"
    }
    $("#checkAuto").prop("checked", true);
    $("#checkWater").prop("checked", true);
    $("#actualCal").val("1.000");
    $('#measuredCal').val(measuredValue);
    //get initial/previous values
    var initialM = JSON.parse(localStorage.getItem(beerColorCalMeas));
    var initialA = JSON.parse(localStorage.getItem(beerColorCalAct));
    //combine and sort values
    initialM.push(Number($('#measuredCal').val()));
    initialM.sort(function(a, b){return a-b});
    initialA.push(Number($('#actualCal').val()));
    initialA.sort(function(a, b){return a-b});
    //save modified calibration values back to local storage
    localStorage.setItem(beerColorCalMeas, JSON.stringify(initialM));
    localStorage.setItem(beerColorCalAct, JSON.stringify(initialA));

}

function getMeasuredSG (){
    var measuredValue = localStorage.getItem($('#beerColorCal').val() + '-SG');
    $('#measuredCal').val(measuredValue);
}

function getMeasuredTemp (){
    var measuredValue = localStorage.getItem($('#beerColorCalTemp').val() + '-Temp');
    $('#measuredCalTemp').val(measuredValue);
}

function clearCal() {
    var beerColorCalMeas = $('#beerColorCal').val() + '-calM';
    var beerColorCalAct = $('#beerColorCal').val() + '-calA';
    localStorage.setItem(beerColorCalMeas, JSON.stringify([0, 10]));
    localStorage.setItem(beerColorCalAct, JSON.stringify([0, 10]));
}


function setCalTemp() {
    //get cal Tilt color from user's entry
    var beerColorCalMeas = $('#beerColorCalTemp').val() + '-calM-Temp';
    var beerColorCalAct = $('#beerColorCalTemp').val() + '-calA-Temp';
    //get initial/previous values
    var initialM = JSON.parse(localStorage.getItem(beerColorCalMeas));
    var initialA = JSON.parse(localStorage.getItem(beerColorCalAct));
    //combine and sort values
    initialM.push(Number($('#measuredCalTemp').val()));
    initialM.sort(function(a, b){return a-b});
    initialA.push(Number($('#actualCalTemp').val()));
    initialA.sort(function(a, b){return a-b});
    //save modified calibration values back to local storage
    localStorage.setItem(beerColorCalMeas, JSON.stringify(initialM));
    localStorage.setItem(beerColorCalAct, JSON.stringify(initialA));
}

function clearCalTemp() {
    var beerColorCalMeas = $('#beerColorCalTemp').val() + '-calM-Temp';
    var beerColorCalAct = $('#beerColorCalTemp').val() + '-calA-Temp';
    localStorage.setItem(beerColorCalMeas, JSON.stringify([-200, 200]));
    localStorage.setItem(beerColorCalAct, JSON.stringify([-200, 200]));
}


function evaluateLinear (pointsToEvaluate, functionValuesX, functionValuesY) {
  var results = []
  pointsToEvaluate = makeItArrayIfItsNot(pointsToEvaluate)
  pointsToEvaluate.forEach(function (point) {
    var index = findIntervalLeftBorderIndex(point, functionValuesX)
    if (index == functionValuesX.length - 1)
      index--
    results.push(linearInterpolation(point, functionValuesX[index], functionValuesY[index]
      , functionValuesX[index + 1], functionValuesY[index + 1]))
  })
  return results
}

function linearInterpolation (x, x0, y0, x1, y1) {
  var a = (y1 - y0) / (x1 - x0)
  var b = -a * x0 + y0
  return a * x + b
}

function makeItArrayIfItsNot (input) {
  return Object.prototype.toString.call( input ) !== '[object Array]'
    ? [input]
    : input
}

function findIntervalLeftBorderIndex (point, intervals) {
  //If point is beyond given intervals
  if (point < intervals[0])
    return 0
  if (point > intervals[intervals.length - 1])
    return intervals.length - 1
  //If point is inside interval
  //Start searching on a full range of intervals
  var indexOfNumberToCompare 
    , leftBorderIndex = 0
    , rightBorderIndex = intervals.length - 1
  //Reduce searching range till it find an interval point belongs to using binary search
  while (rightBorderIndex - leftBorderIndex !== 1) {
    indexOfNumberToCompare = leftBorderIndex + Math.floor((rightBorderIndex - leftBorderIndex)/2)
    point >= intervals[indexOfNumberToCompare]
      ? leftBorderIndex = indexOfNumberToCompare
      : rightBorderIndex = indexOfNumberToCompare
  }
  return leftBorderIndex
}
//function for saving CloudURL
// assign function to onclick property of checkbox
function saveCloudUrl(checkbox) {
    var cloudUrl = $('#cloudUrl').val();
    localStorage.setItem("cloudUrl", cloudUrl);
    console.log('saving cloud URL ' + cloudUrl);
    localStorage.setItem("cloudChecked", checkbox.checked);
    console.log('cloudChecked=' + checkbox.checked);
};
//load cloudUrl from localstorage
var cloudUrl = localStorage.getItem("cloudUrl");

//function for saving useCelsius
// assign function to onclick property of checkbox
function saveUseCelsius(checkbox) {
    localStorage.setItem("useCelsiusChecked", checkbox.checked);
    console.log('useCelsiusChecked=' + checkbox.checked);
};

function goServiceUrl(){
    var serviceUrl = $('#serviceUrl').val();
    localStorage.setItem("serviceUrl", serviceUrl);
    location.href = serviceUrl;
}
//load serviceUrl from localstorage
var serviceUrl = localStorage.getItem("serviceUrl");
