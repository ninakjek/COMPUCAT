/*
    SensorTag IR Temperature sensor example
    This example uses Sandeep Mistry's sensortag library for node.js to
    read data from a TI sensorTag.
    The sensortag library functions are all asynchronous and there is a
    sequence that must be followed to connect and enable sensors.
      Step 1: Connect
        1) discover the tag
        2) connect to and set up the tag
      Step 2: Activate sensors
        3) turn on the sensor you want to use (in this case, IR temp)
        4) turn on notifications for the sensor
      Step 3: Register listeners
        5) listen for changes from the sensortag
      Step 4 (optional): Configure sensor update interval
*/
var SensorTag = require('sensortag');

var log = function(text) {
  if(text) {
    console.log(text);
  }
}

//==============================================================================
// Step 1: Connect to sensortag device.
//------------------------------------------------------------------------------
// It's address is printed on the inside of the red sleeve
// (replace the one below).
var ADDRESS = "b0:b4:48:d2:29:06";
var connected = new Promise((resolve, reject) => SensorTag.discoverByAddress(ADDRESS, (tag) => resolve(tag)))
  .then((tag) => new Promise((resolve, reject) => tag.connectAndSetup(() => resolve(tag))));

 log(connected);

//==============================================================================
// Step 2: Enable the sensors you need.
//------------------------------------------------------------------------------
// For a list of available sensors, and other functions,
// see https://github.com/sandeepmistry/node-sensortag.
// For each sensor enable it and activate notifications.
// Remember that the tag object must be returned to be able to call then on the
// sensor and register listeners.
var sensor = connected.then(function(tag) {
  log("connected");

  tag.enableIrTemperature(log);
  tag.notifyIrTemperature(log);

  tag.enableHumidity(log);
  tag.notifyHumidity(log);

  tag.enableGyroscope(log);
  tag.notifyGyroscope(log);

  tag.enableLuxometer(log);
  tag.notifyLuxometer(log);
  return tag;
});


//==============================================================================
// Step 3: Register listeners on the sensor.
//------------------------------------------------------------------------------
// You can register multiple listeners per sensor.
//

var slowTime = 0
var lightLevel = 0
var wasShocked = 0

sensor.then(function(tag) {
  tag.on("gyroscopeChange", function(x, y, z){
    //log(x + "," + y + "," + z)
    if(wasShocked > 15){
      log("COMPUCAT IS DEAD!")
      log("R.I.P!")
    } 
    else if(wasShocked == 9){
      for (var i = 0; i <= 20; i++) {
        log(" ")
      }
      log("You killed COMPUCAT :(")
      wasShocked +=20
    }
    else if((x > 20 || y > 20 || z > 20) && wasShocked > 5){
      log("COMPUCAT: Blouughghgh [puking]")
      wasShocked ++
    } 
    else if((x > 20 || y > 20 || z > 20) && wasShocked > 3){
      log("COMPUCAT: I'm dizzy, put me down!")
      slowTime = 0
      wasShocked ++
    }
    else if((x > 20 || y > 20 || z > 20) && wasShocked >= 1){
      log("COMPUCAT: HEEYYYYYYY!")
      slowTime = 0
      wasShocked ++
    }
    else  if(x > 16 || y > 16 || z > 16){
      log("COMPUCAT: What was that????!")
      wasShocked ++
      slowTime = 0
    }
    else{
      wasShocked = 0
      slowTime ++
      if(slowTime > 10 && lightLevel < 15){
        if(slowTime % 4 == 0) log("COMPUCAT: zzZz")
        else if(slowTime % 2 == 0) log("COMPUCAT: zZZZZzzZZzzz")
        else log("COMPUCAT: zZZzZZZzzZZzzzzzzzZZzzzzZz")

      }
    else  if(objectTempStat > 25) {
        log("COMPUCAT: I love hugs! Mmmmm...");
        slowTime = 2
      }
      else if (slowTime > 6 && lightLevel < 15){
        log("COMPUCAT: Getting sleepy")
      }
      else if (slowTime > 3 && lightLevel < 15){
        log("COMPUCAT: Is it night already?")
      }
      else if(lightLevel > 80) {
        log("COMPUCAT: My sensors!! So bright! I can nearly sense.");
        slowTime = 0
      }
      else if (slowTime > 1){
        log("COMPUCAT: Relaxing")
      }

      else{
        log("COMPUCAT: Shocked ")
      }

      
    }
  
  });
});

var coldTime = 0;
var objectTempStat = 0
// A simple example of an act on the irTemperature sensor.
sensor.then(function(tag) {
  tag.on("irTemperatureChange", function(objectTemp, ambientTemp) {
    objectTempStat = objectTemp

    if(objectTemp < 28) {
      coldTime ++;
      if (coldTime >=30){
        log("Brrrrr, I'm freezing. Can I get a hug?")
      }
    }
    else if(objectTemp>=28) {
      coldTime = 0;
    }
  })
});


sensor.then(function(tag) {
  tag.on("luxometerChange", function(lux){
    lightLevel = lux

  });
});

sensor.then(function(tag) {
  tag.on("luxometerChange", function(lux){
    // log("Lys: " + lux);
  
  });
});

var nonStopTime = 0
sensor.then(function(tag) {
  tag.on("accelerometerChange", function(x,y,z){
    if(x > 100 || y > 100 || z > 100) {
      nonStopTime ++;
      if (nonStopTime >= 5){
        log("To infinity, AND BEYOND!");
      }
    }
    else{
      nonStopTime = 0;
    }
  });
});


// A simple example of an act on the humidity sensor.
var prev = 0;
sensor.then(function(tag) {
  tag.on("humidityChange", function(temp, humidity){
    // /log(humidity)
    if(prev < 35 && humidity > 35) {
      // log("Don't slobber all over the SensorTag please...");
    }
    prev = humidity;
  });
});

// A simple example of an act on the irTemperature sensor.
sensor.then(function(tag) {
  tag.on("irTemperatureChange", function(objectTemp, ambientTemp) {
    if(objectTemp > 25) {
      // log("You're so hot");
    }
  })
});

//==============================================================================
// Step 4 (optional): Configure periods for sensor reads.
//------------------------------------------------------------------------------
// The registered listeners will be invoked with the specified interval.
sensor.then(function(tag) {
  tag.setIrTemperaturePeriod(3000, log);
});
