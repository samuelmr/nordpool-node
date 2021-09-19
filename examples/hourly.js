import {nordpool} from 'nordpool'
const prices = new nordpool.Prices()

prices.hourly().then(results => {
  for (const item of results) {
    const row = item.date + ': ' + item.value + ' €/MWh in ' + item.area
    console.log(row)
  }
})
