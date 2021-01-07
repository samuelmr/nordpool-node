'use strict'
const config = require('../config')
const dayjs = require('dayjs')
const dayjsPluginUtc = require('dayjs/plugin/utc')
const dayjsPluginTimezone = require('dayjs/plugin/timezone')
const dayjsPluginDayOfYear = require('dayjs/plugin/dayOfYear')
dayjs.extend(dayjsPluginUtc) // Used by timezone
dayjs.extend(dayjsPluginTimezone) // Used to convert from one timezone to another
dayjs.extend(dayjsPluginDayOfYear) // Used to compare dates
dayjs.tz.setDefault('UTC') // Needed when working with different timezones

const fetch = require('node-fetch')
function Prices () {
  return this
}

Prices.prototype.at = async function (opts = {}) {
  opts.date = opts.date ? dayjs.tz(new Date(opts.date)) : dayjs.tz((new Date()).toISOString())
  opts.url = config.priceUrlHourly
  opts.maxRange = { hour: 1 }
  const results = await this.getValues(opts)
  for (const result of results) {
  // for (let i = 0; i < results.length; i++) {
    // const date = results[i].date
    if (dayjs(result.date).tz('UTC').dayOfYear() === opts.date.dayOfYear() &&
          dayjs(result.date).tz('UTC').hour() === opts.date.hour()) {
      return result
    }
  }
  throw new Error('No results found for ' + opts.date.format())
  // })
}

Prices.prototype.hourly = async function (opts = {}) {
  opts.url = config.priceUrlHourly
  opts.maxRange = { day: 1 }
  return this.getValues(opts)
}

Prices.prototype.daily = async function (opts = {}) {
  opts.url = config.priceUrlDaily
  opts.maxRange = { month: 1 }
  return this.getValues(opts)
}

Prices.prototype.weekly = async function (opts = {}) {
  opts.url = config.priceUrlWeekly
  opts.maxRange = { week: 24 }
  return this.getValues(opts)
}

Prices.prototype.monthly = async function (opts = {}) {
  opts.url = config.priceUrlMonthly
  opts.maxRange = { month: 53 }
  return this.getValues(opts)
}

Prices.prototype.yearly = async function (opts = {}) {
  opts.url = config.priceUrlYearly
  return this.getValues(opts)
}

Prices.prototype.getValues = async function (opts = {}) {
  let fromTime = opts.from ? dayjs.tz(new Date(opts.from)) : null
  const toTime = opts.to ? dayjs.tz(new Date(opts.to)) : null
  opts.maxRangeKey = opts.maxRange ? Object.entries(opts.maxRange)[0][0] : ''// Eg. hour or month
  opts.maxRangeValue = opts.maxRange ? Object.entries(opts.maxRange)[0][1] : 0 // Amount of time to add
  if (fromTime && toTime && opts.maxRange) {
    const minFromTime = toTime.subtract(opts.maxRangeValue, opts.maxRangeKey)
    if (fromTime.isBefore(minFromTime)) {
      console.warn('Time span too long. Setting start time to ' + minFromTime.format())
      fromTime = minFromTime
    }
  }
  if (fromTime && !toTime && !opts.date && opts.maxRange) {
    opts.date = dayjs(fromTime).add(opts.maxRangeValue, opts.maxRangeKey)
  } else if ((fromTime || toTime) && !opts.date) {
    opts.date = toTime || fromTime
  }
  opts.area = opts.area || null
  opts.currency = opts.currency || 'EUR'
  opts.date = opts.date || dayjs.tz((new Date()).toISOString())
  const url = opts.url +
    '?currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency +
    '&endDate=' + dayjs.tz(opts.date, config.timezone).format('DD-MM-YYYY')
  const { data } = await fetch(url).then(res => res.json())
  if (data && data.Rows && data.Rows.length) {
    const values = []
    for (const row of data.Rows) {
    // for (let i = 0; i < data.Rows.length; i++) {
      // const row = data.Rows[i]
      if (row.IsExtraRow) {
        continue
      }
      // intentionally create new time object for each row (reference returned)
      const date = dayjs.tz(row.StartTime, 'YYYY-MM-DDTHH:mm:ss', config.timezone)
      if (!date.isValid()) {
        continue
      } else if ((fromTime && date.unix() < (fromTime.unix())) ||
                (toTime && date.unix() >= (toTime.unix()))) {
        // date out of given range
        continue
      }
      for (const column of row.Columns) {
        const value = parseFloat(column.Value.replace(/,/, '.').replace(/ /g, ''))
        if (isNaN(value)) {
          continue
        }
        const area = column.Name
        // console.log(JSON.stringify(column, null, 2))
        if (!opts.area || opts.area.indexOf(area) >= 0) {
          values.push({ area: area, date: date.toISOString(), value: value })
        }
      }
    }
    return values
  }
}

module.exports = Prices
