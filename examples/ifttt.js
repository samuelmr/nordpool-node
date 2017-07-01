/*
Create your own IFTTT maker channel
Go to https://ifttt.com/services/maker_webhooks/settings/connect
to create your channel and see your key
*/

const AREA = 'FI'
const CURRENCY = 'EUR' // can also be 'DKK', 'NOK', 'SEK'
const HIGH_TRESHOLD = 6 // snt/kWh (inclusive)
const LOW_TRESHOLD = 3 // snt/kWh (inclusive)
const KEY = 'CHANGE_ME'
const IFTTT_URL = 'https://maker.ifttt.com/trigger/nordpool/with/key/' + KEY

const nordpool = require('nordpool')
const moment = require('moment')
const prices = new nordpool.Prices()
const request = require('request')

let opts = {
  area: AREA,
  currency: CURRENCY
}

let date = moment()
date.set('hours', date.get('hours') + 1) // next hour
date.set('minutes', 0)
date.set('seconds', 0)
date.set('milliseconds', 0)
prices.at(date, opts, function (error, results) {
  if (error) {
    console.error(error)
    return
  }
  let price = results.value/10 // price per kWh instead of MWh
  let values = {
    value2: price,
    value3: results.date.format('h:mm')
  }
  if (price >= HIGH_TRESHOLD) {
    values.value1 = 'HIGH'
  }
  else if (price <= LOW_TRESHOLD) {
    values.value1 = 'LOW'
  }
  else {
    return
  }
  var opts = {
    url: IFTTT_URL,
    json: true,
    body: values
  }
  console.log('POSTing ' + values.value1 + ' treshold warning...')
  request.post(opts, function(err, res) {
    if (err) {
      console.error(err)
      return
    }
    console.log('Success: ' + res.body)
  })
})
