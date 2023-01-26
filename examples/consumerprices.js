import { Prices } from 'nordpool'

const prices = new Prices()

const printHourlyConsumerPrices = async () => {
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

    var row = `${hour}\t${price.toFixed(3)} snt/kWh`
    console.log(row)
  }
}
printHourlyConsumerPrices()
  
  
