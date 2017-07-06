var nordpool = require('nordpool')
var prices = new nordpool.Prices()

prices.hourly({}, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date // moment object (see http://momentjs.com/)
    var price = results[i].value // float, EUR/MWh
    var hourlyPriceMessage = results[i].area +
      " at " + date.format("DD.MM. H:mm") + ": " + price/10 + " eurocent/kWh"
    console.log(hourlyPriceMessage)
  }
})
