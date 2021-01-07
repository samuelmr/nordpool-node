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
