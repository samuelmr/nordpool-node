/*
Create your own IFTTT maker channel
Go to https://ifttt.com/services/maker_webhooks/settings/connect
to create your channel and see your key

Run this script from cron every hour.
*/

const AREA = 'FI'
const CURRENCY = 'EUR' // can also be 'DKK', 'NOK', 'SEK'
const HIGH_TRESHOLD = 6 // snt/kWh (inclusive)
const LOW_TRESHOLD = 3 // snt/kWh (inclusive)
const KEY = 'CHANGE_ME'
const IFTTT_URL = 'https://maker.ifttt.com/trigger/nordpool/with/key/' + KEY

const nordpool = require('nordpool')
const moment = require('moment-timezone')
const prices = new nordpool.Prices()
const request = require('request')

let myTimeZone = moment.tz.guess()

let date = moment()
date.set('hours', date.get('hours') + 1) // next hour
date.set('minutes', 0)
date.set('seconds', 0)
date.set('milliseconds', 0)

let opts = {
  area: AREA,
  currency: CURRENCY,
  date: date
}

prices.at(opts, function (error, results) {
  if (error) {
    console.error(error)
    return
  }
  let price = results.value/10 // price per kWh instead of MWh
  let date = results.date.tz(myTimeZone).format('H:mm')
  console.log('Energy price at ' + date + ' will be ' + price + ' snt/kWh')
  let values = {
    value2: price,
    value3: date
  }
  if (price >= HIGH_TRESHOLD) {
    values.value1 = 'HIGH'
  }
  else if (price <= LOW_TRESHOLD) {
    values.value1 = 'LOW'
  }
  else {
    console.log('Price within normal range. No alert.')
    return
  }
  var opts = {
    url: IFTTT_URL,
    json: true,
    body: values
  }
  console.log('POSTing ' + values.value1 + ' treshold trigger...')
  request.post(opts, function(err, res) {
    if (err) {
      console.error(err)
      return
    }
    console.log('Success: ' + res.body)
  })
})
