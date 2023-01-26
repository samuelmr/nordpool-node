import { Prices } from 'nordpool'
const prices = new Prices()
import dayjs from 'dayjs'
import dayjsPluginUtc from 'dayjs/plugin/utc.js'
import dayjsPluginTimezone from 'dayjs/plugin/timezone.js'
dayjs.extend(dayjsPluginUtc) // Used by timezone
dayjs.extend(dayjsPluginTimezone) // Used to convert from one timezone to another

const formatter = new Intl.NumberFormat('se-SE', {style: 'currency', currency: 'SEK'})
const opts = {
  area: 'SE3', // See http://www.nordpoolspot.com/maps/
  currency: 'SEK' // can also be 'DKK', 'EUR', 'NOK'
}

const run = async () => {
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
    const time = dayjs.tz(date, 'UTC').tz('Europe/Stockholm').format('D.M. H:mm')
    console.log(time + '\t' + formatter.format(price) + '/MWh')
  }
}
run()
