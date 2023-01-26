/*
 *
 * Create your own IFTTT maker channel
 * Go to https://ifttt.com/maker_webhooks/settings/connect
 * to create your channel and see your key
 * 
 * Run this script from cron every hour.
 *
 */

const TIMEZONE = 'Europe/Helsinki'
const AREA = 'FI'
const VAT = 24 // percentage of value added tax
const CURRENCY = 'EUR' // can also be 'DKK', 'NOK', 'SEK'
const HIGH_TRESHOLD = 6 // snt/kWh (inclusive)
const LOW_TRESHOLD = 3 // snt/kWh (inclusive)
const IFTTT_TRIGGER = 'nordpool'
const IFTTT_KEY = '' // get from https://ifttt.com/maker_webhooks/settings/connect

const IFTTT_URL = `https://maker.ifttt.com/trigger/${IFTTT_TRIGGER}/with/key/${IFTTT_KEY}`

import { Prices } from 'nordpool'
import fetch from 'node-fetch'
import dayjs from 'dayjs'
import dayjsPluginUtc from 'dayjs/plugin/utc.js'
import dayjsPluginTimezone from 'dayjs/plugin/timezone.js'
dayjs.extend(dayjsPluginUtc) // Used by timezone
dayjs.extend(dayjsPluginTimezone) // Used to convert from one timezone to another

const prices = new Prices()

const inputDate = new Date()
inputDate.setHours(inputDate.getHours() + 1) // next hour
inputDate.setMinutes(0)
inputDate.setSeconds(0)
inputDate.setMilliseconds(0)

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
  // price per kWh instead of MWh, VAT added, rounded to 3 decimals
  const price = Math.round(results.value * (100 + VAT))/1000
  const date = dayjs(results.date).tz(TIMEZONE).format('H:mm')
  console.log(`Energy price at ${date} will be ${price} cent/kWh (including ${VAT}% VAT).`)
  const values = {
  }
  if (price >= HIGH_TRESHOLD) {
    values.value1 = 'HIGH'
  } else if (price <= LOW_TRESHOLD) {
    values.value1 = 'LOW'
  } else {
    console.log('Price within normal range. No alert.')
    return
  }
  values.value2 = price.toString()
  values.value3 = date
  opts = {
    method: 'post',
    body: JSON.stringify(values),
    headers: { 'Content-Type': 'application/json' }
  }
  console.log('POSTing ' + values.value1 + ' threshold trigger...')
  // console.log(IFTTT_URL)
  // console.log(opts.body)
  let response
  try {
    response = await fetch(IFTTT_URL, opts)
  } catch (error) {
    throw new Error('Error POSTing to IFTTT')
  }
  response = await response.text()
  // console.log('Got response from IFTTT:', response)
  if (response.search('errors') > 0) {
    throw new Error(response)
  }
  return response
}
run(inputDate)
