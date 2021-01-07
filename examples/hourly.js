const nordpool = require('nordpool')
const prices = new nordpool.Prices()

// async/await method
async function run () {
  const results = await prices.hourly()
  for (var i = 0; i < results.length; i++) {
    var date = results[i].date // ISO Date-Time (see https://www.ecma-international.org/ecma-262/11.0/#sec-date-time-string-format)
    var price = results[i].value // float, EUR/MWh
    var hourlyPriceMessage = results[i].area +
      ' at ' + date + ': ' + price / 10 + ' cent/kWh'
    console.log(hourlyPriceMessage)
  }
}
run()

// then.then method
prices.hourly().then(results => {
  for (var i = 0; i < results.length; i++) {
    var date = results[i].date // ISO Date-Time (see https://www.ecma-international.org/ecma-262/11.0/#sec-date-time-string-format)
    var price = results[i].value // float, EUR/MWh
    var hourlyPriceMessage = results[i].area +
      ' at ' + date + ': ' + price / 10 + ' cent/kWh'
    console.log(hourlyPriceMessage)
  }
})
