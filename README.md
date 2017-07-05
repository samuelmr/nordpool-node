# Nordpool Elspot API npm client

[![Build Status](https://travis-ci.org/samuelmr/nordpool-node.svg?branch=master)](https://travis-ci.org/samuelmr/nordpool-node)

Unofficial [Nordpool](http://www.nordpoolspot.com/) Elspot API npm client

## Features

- [Prices](http://www.nordpoolspot.com/Market-data1/Elspot/Area-Prices/)
- [Volumes](http://www.nordpoolspot.com/Market-data1/Elspot/Volumes/) (not implemented yet)
- [Capacities](http://www.nordpoolspot.com/Market-data1/Elspot/Capacities1/) (not implemented yet)
- [Flow](http://www.nordpoolspot.com/Market-data1/Elspot/Flow1/) (not implemented yet)


## Usage

### Install

```
npm install nordpool
```

### Example 1: Latest hourly prices from all areas
```js

var nordpool = require('nordpool')
var prices = new nordpool.Prices()

prices.hourly({}, function (error, results) {
  if (error) console.err(error)
  for (var i=0; i<results.length; i++) {
    // moment timezone object (see https://momentjs.com/timezone/)
    var date = results[i].date
    var price = results[i].value // float, EUR/MWh
    var hourlyPriceMessage = results[i].area +
      " at " + date.format("DD.MM. H:mm") + ": " + price/10 + " eurocent/kWh"
    console.log(hourlyPriceMessage)
  }
})

```

### Example 2: Latest hourly prices in Finland
```js

var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {
  area: 'FI', // See http://www.nordpoolspot.com/maps/
  currency: 'EUR', // can also be 'DKK', 'NOK', 'SEK'
}

prices.hourly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date
    var price = results[i].value
    var time = date.tz('Europe/Helsinki').format("D.M. H:mm")
    console.log(price + ' €/MWh at ' + time)
  }
})


```

### Example 3: Weekly prices in Bergen in 2015

```js

var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {}
opts.currency = 'NOK'
opts.area = 'Bergen', // DK2, EE1, FI, 'Kr.sand', LT, LV, 'Oslo', SE1, SE4, ...
opts.endDate = '2015-06-08'

prices.weekly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date // moment object (see http://momentjs.com/)
    var price = results[i].value // float, EUR/MWh
    var weeklyPriceMessage = "The price on week " + date.format("W/GGGG") +
      " was " + price + " NOK/MWh"
    console.log(weeklyPriceMessage)
  }
})

```

See examples folder for more examples.

Check possible values for `area` (regions) from [nordpoolspot.com](http://www.nordpoolspot.com/Market-data1/Elspot/Area-Prices/)

### Data availability
Historical data seems to be available for two previous years.

### Known issues
- The Nordpool API returns data in Norwegian time zones. The `hourly` API returns data from midnight to midnight in the Europe/Oslo timezone.
- The `startDate` parameter doesn't always work. Use `endDate` instead.

### TODO
Add support for other API functions (volume, capacity, flow).
