const nordpool = require('nordpool')
const prices = new nordpool.Prices()
const moment = require('moment-timezone')

var opts = {
  currency: 'NOK',
  area: 'Bergen',
  from: '2016-01-01'
}

prices.weekly(opts, function (error, results) {
  if (error) console.error(error)
  for (var i = 0; i < results.length; i++) {
    var date = results[i].date
    var price = results[i].value
    var weeklyPriceMessage = 'The price on week ' + moment(date).format('W/GGGG') +
      ' was ' + price + ' NOK/MWh'
    console.log(weeklyPriceMessage)
  }
})
