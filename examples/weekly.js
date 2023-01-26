import { Prices } from 'nordpool'
import dayjs from 'dayjs'
import dayjsPluginWeekOfYear from 'dayjs/plugin/weekOfYear.js'
dayjs.extend(dayjsPluginWeekOfYear)

const opts = {
  currency: 'NOK',
  area: 'Bergen',
  from: '2019-06-01'
}

const getWeekly = async () => {
  const prices = await new Prices().weekly(opts)
  for (const week of prices.reverse()) {
    const weeklyPriceMessage = 'The MWh price on week ' + 
      dayjs(week.date).week() + '/' + dayjs(week.date).format('YYYY') +
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
