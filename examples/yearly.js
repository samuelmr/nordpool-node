var nordpool = require('nordpool')
var prices = new nordpool.Prices()

var opts = {
  area: ['EE', 'LT', 'LV'],
  from: '2014-01-01',
  to: '2017-12-31'
}

prices.yearly(opts, function (error, results) {
  if (error) console.error(error)
  console.log('Year\tPrice\tArea')
  for (var i=0; i<results.length; i++) {
    var date = results[i].date.format("Y")
    var price = results[i].value + " EUR/MWh"
    var area = results[i].area
    var weeklyPriceMessage = [date, area, price].join('\t')
    // LV may appear twice for some years...
    console.log(weeklyPriceMessage)
  }
})
