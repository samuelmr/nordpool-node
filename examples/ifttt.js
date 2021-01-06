/*
Create your own IFTTT maker channel
Go to https://ifttt.com/maker_webhooks/settings/connect
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
const fetch = require('node-fetch')

const myTimeZone = moment.tz.guess()

const inputDate = moment()
inputDate.set('hours', inputDate.get('hours') + 1) // next hour
inputDate.set('minutes', 0)
inputDate.set('seconds', 0)
inputDate.set('milliseconds', 0)

async function run (inputDate) {
  let opts = {
    area: AREA,
    currency: CURRENCY,
    date: inputDate
  }
  let results
  try {
    results = await prices.at(opts)
  } catch (error) {
    throw new Error('Error getting prices from nordpool')
  }
  const price = results.value / 10 // price per kWh instead of MWh
  const date = moment(results.date).tz(myTimeZone).format('H:mm')
  console.log('Energy price at ' + date + ' will be ' + price + ' cent/kWh')
  const values = {
    value2: price,
    value3: date
  }
  if (price >= HIGH_TRESHOLD) {
    values.value1 = 'HIGH'
  } else if (price <= LOW_TRESHOLD) {
    values.value1 = 'LOW'
  } else {
    console.log('Price within normal range. No alert.')
    return
  }
  opts = {
    method: 'post',
    body: JSON.stringify(values),
    headers: { 'Content-Type': 'application/json' }
  }
  console.log('POSTing ' + values.value1 + ' threshold trigger...')
  let response
  try {
    response = await fetch(IFTTT_URL, opts)
  } catch (error) {
    throw new Error('Error posing to IFTTT')
  }
  response = await response.text()
  console.log('response', response)
  if (response.search('errors') > 0) {
    throw new Error(response)
  }
  return response
}
run(inputDate)
