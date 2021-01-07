var nordpool = require('nordpool')
var prices = new nordpool.Prices()
const moment = require('moment-timezone')

async function run () {
  var opts = {
    area: ['SE1', 'SE2', 'SE3', 'SE4'],
    from: '2019-01-01',
    to: '2020-12-31'
  }
  const results = await prices.yearly(opts)
  console.log('Year\tPrice\tArea')
  for (var i = 0; i < results.length; i++) {
    var date = moment(results[i].date).format('Y')
    var price = results[i].value + ' EUR/MWh'
    var area = results[i].area
    var weeklyPriceMessage = [date, area, price].join('\t')
    // LV may appear twice for some years...
    console.log(weeklyPriceMessage)
  }
}
run()
