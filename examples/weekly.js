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
