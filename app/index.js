'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var document = _interopDefault(require('document'));
var clock = _interopDefault(require('clock'));
var geolocation = require('geolocation');

var running = false;
var startTimer = null;
var watchID = null;
var lastPos = null;
var tripDist = null;
var elapsed = null;
clock.granularity = "minutes";
document.onkeypress = function (e) {
    console.log("Key pressed: " + e.key);
    if (e.key == "down") {
        if (running == false) {
            geolocation.geolocation.getCurrentPosition(function (position) {
                lastPos = position;
                document.getElementById("distGone").text = "0.0Km";
            }, locationError);
            startTimer = Date.now();
            running = true;
            watchID = geolocation.geolocation.watchPosition(locationSuccess, locationError);
        }
        else {
            running = false;
            geolocation.geolocation.clearWatch(watchID);
        }
    }
    else if (e.key == "up") {
    }
    console.log("Running: " + running);
};
clock.ontick = function (evt) {
    updateTime(evt);
    updateTimer();
};
function updateTime(evt) {
    var display = document.getElementById("realTime");
    var hours = evt.date.getHours();
    var minutes = evt.date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    display.text = hours + ':' + minutes + ampm;
}
function updateTimer() {
    var display = document.getElementById("timeGone");
    if (running == true) {
        elapsed = (Date.now() - startTimer) / 1000;
        var date = new Date(null);
        date.setSeconds(elapsed);
        display.text = date.toISOString().substr(11, 5);
    }
}
function updateSpeed(position) {
    var display = document.getElementById("speed");
    var kmh = Math.round((position.coords.speed * 18 / 5) * 10) / 10;
    display.text = kmh + "Km/h";
}
function updateDist() {
    var display = document.getElementById("distGone");
    display.text = tripDist + "Km";
}
function updateAvSpeed() {
    var display = document.getElementById("avgSpeed");
    var avg = tripDist / (elapsed / 60);
    console.log(avg);
    display.test = avg + "Km/h";
    display.style.fill = speedCheck(avg);
}
function locationSuccess(position) {
    updateSpeed(position);
    var dist = calculateDistance(lastPos.coords.latitude, lastPos.coords.longitude, position.coords.latitude, position.coords.longitude);
    tripDist += dist;
    lastPos = position;
    updateDist();
    updateAvSpeed();
}
function locationError(error) {
    console.log("Error: " + error.code, "Message: " + error.message);
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1).toRad();
    var dLon = (lon2 - lon1).toRad();
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};
function speedCheck(kmh) {
    if (kmh < 8) {
        return "red";
    }
    else if (kmh < 12) {
        return "green";
    }
    else if (kmh < 15) {
        return "fb-orange";
    }
    else {
        return "red";
    }
}
