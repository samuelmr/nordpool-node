# Nordpool Elspot API npm client

[![Build Status](https://travis-ci.org/samuelmr/nordpool-node.svg?branch=master)](https://travis-ci.org/samuelmr/nordpool-node)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Unofficial [Nordpool](http://www.nordpoolspot.com/) Elspot API npm client

## Restrictions regarding data use

Before you access the Nordpool data using this module, please read and understand the
[Terms and conditions for use of website](https://www.nordpoolgroup.com/About-us/Terms-and-conditions-for-use/)
There may be clauses prohibiting automatic extraction of data that reduces the performance of the website,
limits for republishing information etc.

## Features

- [Prices][AreaPrices]
- [Volumes](http://www.nordpoolspot.com/Market-data1/Elspot/Volumes/) *(not implemented yet)*
- [Capacities](http://www.nordpoolspot.com/Market-data1/Elspot/Capacities1/) *(not implemented yet)*
- [Flow](http://www.nordpoolspot.com/Market-data1/Elspot/Flow1/) *(not implemented yet)*

[AreaPrices]: https://www.nordpoolgroup.com/Market-data1/

## Usage
```js
const nordpool = require('nordpool')
const prices = new nordpool.Prices()
async function run () {
  const results = await prices.hourly()
  console.log(results)
}
run()
```

### Methods
- `at`: get price at an exact time
- `hourly`: get hourly prices
- `daily`: get daily prices
- `weekly`: get weekly prices
- `monthly`: get monthly prices
- `yearly`: get yearly prices

### Options
*Options shall be included as a single object containing the some of the properties listed here*
- `area`: the energy market area. See [nordpool map](https://www.nordpoolgroup.com/Market-data1/#/nordic/map)
  - Accepts: a string or an array of strings. Strings are case sensitive. Currently available areas are `Bergen, DK1, DK2, FI, Kr.sand, Molde, OSLO, SE1, SE2, SE3, SE4, SYS, Tr.heim, Tromsø'. (EE, LV, LT, AT, BE, DE-LU, FR` and `NL` are only partially supported - e.g. yearly data is not available.)
  - Optional: if not specified data from all supported areas is returned.
- `currency`: choose currency of the returned  values. *Note that not all areas will return all currencies*. `EUR` seams to work on all areas though.
  - Accepts: a string of either `DKK`, `EUR`, `NOK` or `SEK`.  Strings are case sensitive.
  - Optional: if currency is not specified `EUR` or wrong `EUR` is returned.
- `date`: must be a date parsable by `new Date(x)`.
  - Accepts: `Date` object or a string parsable by `new Date(x)` like a string in [ISO 8601 format](https://www.ecma-international.org/ecma-262/11.0/#sec-date-time-string-format).
  - Optional: if date is not specified todays date of your local system is used
- `from`: don't return values before/after this time. 
  - Accepts: Accepts same formats as `date`.
  - Optional: falls back to one date based on input from `date`.
- `to`: don't return values/after this time. There are some weird limits to this time span as stated in the known issues. You will be prompted with a warning if you pass the limit.
  - Accepts: Accepts same formats as `date`.
  - Optional: falls back to the max limits  one date based on input from `date`.

## Returned values

The result is returned as a Promise resolving into an array of objects. Eg. if requesting hourly with options = `{ area: 'Oslo', currency: 'NOK', from: '2020-01-01T04:00:00.000Z', to: '2020-01-01T05:00:01.000Z' }`
```js
[{
    area: 'Oslo' // Area in Eg. Oslo
    date: '2020-01-01T04:00:00.000Z' // UTC timestamp of price. Eg. price from 04:00 to 05:00 UTC time
    value: 298.57 // Price in 'currency'/MWh Eg. NOK/MWh
},
{ area: 'Oslo', date: '2020-01-01T05:00:00.000Z', value: 297.58 }
]
```

## Install

```
npm install nordpool
```

## Examples

### Example 1: Latest hourly prices from all areas

```js
const nordpool = require('nordpool')
const prices = new nordpool.Prices()

prices.hourly().then(results => {
  for (const item of results) {
    const row = item.date + ': ' + item.value + ' €/kWh in ' + item.area
    console.log(row)
  }
})

```

### Example 2: Hourly prices in Finland

Parsing dates and setting timezone with `day.js`

```js
const nordpool = require('nordpool')
const prices = new nordpool.Prices()
const dayjs = require('dayjs')
const dayjsPluginUtc = require('dayjs/plugin/utc')
const dayjsPluginTimezone = require('dayjs/plugin/timezone')
dayjs.extend(dayjsPluginUtc) // Used by timezone
dayjs.extend(dayjsPluginTimezone) // Used to convert from one timezone to another

async function run () {
  const opts = {
    area: 'FI', // See http://www.nordpoolspot.com/maps/
    currency: 'EUR' // can also be 'DKK', 'NOK', 'SEK'
  }
  let results
  try {
    results = await prices.hourly(opts)
  } catch (error) {
    console.error(error)
    return
  }
  for (let i = 0; i < results.length; i++) {
    const date = results[i].date
    const price = results[i].value
    const time = dayjs.tz(date, 'UTC').tz('Europe/Helsinki').format('D.M. H:mm')
    console.log(price + ' ' + opts.currency + '/MWh at ' + time)
  }
}
run()
```

### Example 3: Consumer prices in Finland (in cent/kWh and local time)

Coverting "business prices" (€/MWh) to "consumer prices" (including VAT)
```js
const nordpool = require('nordpool')
const prices = new nordpool.Prices()

// async/await method
printHourlyConsumerPrices = async () => {
  const results = await prices.hourly({area:'FI'})
  for (const item of results) {
    // item.date is an ISO Date-Time
    // (see https://www.ecma-international.org/ecma-262/11.0/#sec-date-time-string-format)
    // use Date object to format
    const date = new Date(item.date) // automatically in your local timezone
    const hour = date.getHours().toString().padStart(2, '0').concat(':00')

    // item.value is the enrgy price in EUR/MWh
    // convert it to snt/kWh and add Finnish VAT of 24 %
    const price = Math.round(item.value * 1.24 * 100)/1000

    var row = `${hour}\t${price} cent/kWh`
    console.log(row)
  }
}
printHourlyConsumerPrices()
```

### Example 4: Weekly prices in Bergen in 2020

Parsing dates with `moment` and formatting prices with `Intl.NumberFormat`

```js
const nordpool = require('nordpool')
const moment = require('moment-timezone')

const opts = {
  currency: 'NOK',
  area: 'Bergen',
  from: '2019-06-01'
}

getWeekly = async () => {
  const prices = await new nordpool.Prices().weekly(opts)
  for (const week of prices.reverse()) {
    const weeklyPriceMessage = 'The MWh price on week ' + 
      moment(week.date).format('W/GGGG') +
      ' was ' + priceFormat.format(week.value)
    console.log(weeklyPriceMessage)
  }
}
getWeekly()

const priceFormat = new Intl.NumberFormat('no-NO', {
  style: 'currency',
  currency: 'NOK',
  minimumFractionDigits: 2
});
```

See [examples] folder for more examples.

Check possible values for `area` (regions) from [nordpoolspot.com][AreaPrices]

## Data availability
Historical data seems to be available for two previous years.

## Known issues
- Versions prior to 2.0 were full of flaws. Don't use them.
- The Nordpool API returns data in Norwegian time zones. The `hourly` API returns data from midnight to midnight in the Europe/Oslo timezone.
- Historical data is limited to two calendar years in addition to the current year.
- The API limits are a bit strange. The maximum number of weeks is 24 and the maximum number of months is 53.

## TODO
- Add support for other API functions (volume, capacity, flow).
- Make configuration more dynamic so that e.g. the yearly prices would work in all areas.