var moment = require('moment-timezone')
var baseUrl = 'http://www.nordpoolspot.com/api'

module.exports = {
  baseUrl: baseUrl,
  priceUrlHourly: baseUrl + '/marketdata/page/10',
  priceUrlDaily: baseUrl + '/marketdata/page/11',
  priceUrlWeekly: baseUrl + '/marketdata/page/12',
  priceUrlMonthly: baseUrl + '/marketdata/page/13',
  priceUrlYearly: baseUrl + '/marketdata/page/14',
  // volumeUrl: baseUrl + '/marketdata/page/',
  // capacityUrl: baseUrl + '/marketdata/page/',
  // flowUrl: baseUrl + '/marketdata/page/',
  timezone: 'Europe/Oslo',
  dateFormats: [
    moment.ISO_8601,
    'YYYY-MM-DD',
    'YYYY-MM',
    'W/GGGG'
  ]
}
