var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {}
opts.currency = 'NOK'
opts.area = 'Bergen', // DK2, EE1, FI, 'Kr.sand', LT, LV, 'Oslo', SE1, SE4, ...
opts.endDate = '2015-06-08'

prices.weekly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date // moment object (see http://momentjs.com/)
    var price = results[i].value // float, EUR/MWh
    var weeklyPriceMessage = "The price on week " + date.format("W/GGGG") +
      " was " + price + " NOK/MWh"
    console.log(weeklyPriceMessage)
  }
})
