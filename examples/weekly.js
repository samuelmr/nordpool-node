var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {}
opts.currency = 'NOK'
opts.area = 'Bergen', // DK2, EE1, FI, 'Kr.sand', LT, LV, 'Oslo', SE1, SE4, ...
opts.from = '2015-01-01'

prices.weekly(opts, function (error, results) {
  if (error) console.err(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date // moment object (see http://momentjs.com/)
    var price = results[i].value // float, EUR/MWh
    var weeklyPriceMessage = "The price on week " + date.format("W/Y") +
      " was " + price + " NOK/MWh"
    console.log(weeklyPriceMessage)
  }
})
