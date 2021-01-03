const nordpool = require('nordpool')
const prices = new nordpool.Prices()

prices.hourly({}, function (error, results) {
  if (error) console.error(error)
  for (var i = 0; i < results.length; i++) {
    var date = results[i].date // ISO Date-Time (see https://www.w3schools.com/js/js_date_formats.asp)
    var price = results[i].value // float, EUR/MWh
    var hourlyPriceMessage = results[i].area +
      ' at ' + date + ': ' + price / 10 + ' cent/kWh'
    console.log(hourlyPriceMessage)
  }
})
