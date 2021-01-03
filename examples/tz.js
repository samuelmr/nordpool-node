const nordpool = require('nordpool')
const prices = new nordpool.Prices()
const dayjs = require('dayjs')
const dayjsPluginUtc = require('dayjs/plugin/utc')
const dayjsPluginTimezone = require('dayjs/plugin/timezone')
dayjs.extend(dayjsPluginUtc) // Used by timezone
dayjs.extend(dayjsPluginTimezone) // Used to convert from one timezone to another

var opts = {
  area: 'FI', // See http://www.nordpoolspot.com/maps/
  currency: 'EUR' // can also be 'DKK', 'NOK', 'SEK'
}

prices.hourly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i = 0; i < results.length; i++) {
    var date = results[i].date
    var price = results[i].value
    var time = dayjs.tz(date, 'UTC').tz('Europe/Helsinki').format('D.M. H:mm')
    console.log(price + ' ' + opts.currency + '/MWh at ' + time)
  }
})
