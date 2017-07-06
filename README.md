# Nordpool Elspot API npm client

[![Build Status](https://travis-ci.org/samuelmr/nordpool-node.svg?branch=master)](https://travis-ci.org/samuelmr/nordpool-node)

Unofficial [Nordpool](http://www.nordpoolspot.com/) Elspot API npm client

## Features

- [Prices](http://www.nordpoolspot.com/Market-data1/Elspot/Area-Prices/)
- [Volumes](http://www.nordpoolspot.com/Market-data1/Elspot/Volumes/) (not implemented yet)
- [Capacities](http://www.nordpoolspot.com/Market-data1/Elspot/Capacities1/) (not implemented yet)
- [Flow](http://www.nordpoolspot.com/Market-data1/Elspot/Flow1/) (not implemented yet)


## Usage
```js

const nordpool = require('nordpool')
const prices = new nordpool.Prices()
let opts = {}
prices.hourly(opts, function (error, results) {
  console.log(results)
})

```

### Methods
- `at`: get price at an exact time
- `hourly`: get hourly prices
- `daily`: get daily prices
- `weekly`: get weekly prices
- `monthly`: get monthly prices
- `yearly`: get yearly prices

### Options
- `area`: the energy market area. See http://www.nordpoolspot.com/maps/
  Currently active areas are BERGEN, DK1, DK2, EE, ELE, FRE, KR.SAND, KT,
  LT, LV, MOLDE, OSLO, SE, SE1, SE2, SE3, SE4, SYS, TR.HEIM and TROMSØ
- `currency`: choose either `DKK`, `EUR`, `NOK` or `SEK`
- `date`: can be a `Date` or `moment.js` object or a string in ISO 8601 format
  or `W/YYYY` (week number and year) or `YYYY-MM` (year and month). If no
  timezone is set, `CET` is assumed.
- `from`: Don't return values before this time. Accepts same formats as `date`.
- `to`: Don't return values after this time. Accepts same formats as `date`.

### Install

```
npm install nordpool

```

## Examples

### Example 1: Latest hourly prices from all areas
```js

var nordpool = require('nordpool')
var prices = new nordpool.Prices()

prices.hourly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date // moment object (see http://momentjs.com/)
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
    console.log(price + ' ' + opts.currency + '/MWh at ' + time)
  }
})

```

### Example 3: Weekly prices in Bergen in 2015

```js

var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {
  currency: 'NOK',
  area: 'Bergen',
  from: '2016-01-01'
}

prices.weekly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date
    var price = results[i].value
    var weeklyPriceMessage = "The price on week " + date.format("W/GGGG") +
      " was " + price + " NOK/MWh"
    console.log(weeklyPriceMessage)
  }
})

```

See examples folder for more examples.

Check possible values for `area` (regions) from [nordpoolspot.com](http://www.nordpoolspot.com/Market-data1/Elspot/Area-Prices/)

## Data availability
Historical data seems to be available for two previous years.

## Known issues
- Versions prior to 2.0 were full of flaws. Don't use them.
- The Nordpool API returns data in Norwegian time zones. The `hourly` API
  returns data from midnight to midnight in the Europe/Oslo timezone.
- The API limits are a bit strange. The maximum number of weeks is 24 and
  the maximum number of months is 53.

## TODO
Add support for other API functions (volume, capacity, flow).
