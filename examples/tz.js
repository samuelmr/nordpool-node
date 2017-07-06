var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {
  area: 'FI', // See http://www.nordpoolspot.com/maps/
  currency: 'EUR', // can also be 'DKK', 'NOK', 'SEK'
}

prices.hourly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i=0; i<results.length; i++) {
    var date = results[i].date
    var price = results[i].value
    var time = date.tz('Europe/Helsinki').format("D.M. H:mm")
    console.log(price + ' ' + opts.currency + '/MWh at ' + time)
  }
})
