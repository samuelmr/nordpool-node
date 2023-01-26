import { Prices } from 'nordpool'
var prices = new Prices()

async function run () {
  var opts = {
    area: ['SE1', 'SE2', 'SE3', 'SE4'],
    from: '2017-01-01T00:00:00+01:00', // including timezone
    to: '2020-12-31'
  }
  const results = await prices.yearly(opts)
  console.log('Year\tPrice\tArea')
  for (var i = 0; i < results.length; i++) {
    var date = new Date(results[i].date)
    var price = results[i].value + ' EUR/MWh'
    var area = results[i].area
    var weeklyPriceMessage = [date.getFullYear(), area, price].join('\t')
    // LV may appear twice for some years...
    console.log(weeklyPriceMessage)
  }
}
run()
