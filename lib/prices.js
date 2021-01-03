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
  this.fetch = fetch
  return this
}

Prices.prototype.at = function (opts, callback) {
  // opts.date = opts.date ? dayjs(opts.date, config.dateFormats).tz(config.timezone) : dayjs().tz(config.timezone)
  opts.date = opts.date ? dayjs.tz(new Date(opts.date)) : dayjs.tz((new Date()).toISOString())
  // console.log('opts.date', opts.date)
  opts.url = config.priceUrlHourly
  opts.maxRange = { hour: 1 }
  this.getValues(opts, function (error, results) {
    if (error) {
      callback(error)
      return
    }
    for (let i = 0; i < results.length; i++) {
      const date = results[i].date
      if (dayjs(date).tz('UTC').dayOfYear() === opts.date.dayOfYear() &&
          dayjs(date).tz('UTC').hour() === opts.date.hour()) {
        callback(null, results[i])
        return
      }
    }
    callback(new Error('No results found for ' + opts.date.format()))
  })
}

Prices.prototype.hourly = function (opts, callback) {
  opts.url = config.priceUrlHourly
  opts.maxRange = { day: 1 }
  this.getValues(opts, callback)
}

Prices.prototype.daily = function (opts, callback) {
  opts.url = config.priceUrlDaily
  opts.maxRange = { month: 1 }
  this.getValues(opts, callback)
}

Prices.prototype.weekly = function (opts, callback) {
  opts.url = config.priceUrlWeekly
  opts.maxRange = { week: 24 }
  this.getValues(opts, callback)
}

Prices.prototype.monthly = function (opts, callback) {
  opts.url = config.priceUrlMonthly
  opts.maxRange = { month: 53 }
  this.getValues(opts, callback)
}

Prices.prototype.yearly = function (opts, callback) {
  opts.url = config.priceUrlYearly
  this.getValues(opts, callback)
}

Prices.prototype.getValues = async function (opts, callback) {
  if (!opts) {
    opts = {}
  }
  // fromTime = opts.from ? dayjs(opts.from, config.dateFormats).tz(config.timezone) : null;
  let fromTime = opts.from ? dayjs.tz(new Date(opts.from)) : null
  // console.log('fromTime', fromTime)
  // toTime = opts.to ? dayjs(opts.to, config.dateFormats).tz(config.timezone) : null;
  const toTime = opts.to ? dayjs.tz(new Date(opts.to)) : null
  // console.log('toTime', toTime)
  // console.log(opts.maxRange)
  opts.maxRangeKey = opts.maxRange ? Object.entries(opts.maxRange)[0][0] : ''// Eg. hour or month
  opts.maxRangeValue = opts.maxRange ? Object.entries(opts.maxRange)[0][1] : 0 // Amount of time to add
  if (fromTime && toTime && opts.maxRange) {
    // console.log('toTime',toTime)
    const minFromTime = toTime.subtract(opts.maxRangeValue, opts.maxRangeKey)
    // console.log('minFromTime', minFromTime)
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
  // console.log('opts.date', opts.date)
  var url = opts.url +
    '?currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency +
    '&endDate=' + dayjs.tz(opts.date, config.timezone).format('DD-MM-YYYY')
  // console.log('url', url)
  var data
  try {
    data = (await this.fetch(url).then(res => res.json())).data
  } catch (error) {
    // console.trace(error)
    callback(error)
  }
  // console.log(JSON.stringify(data, null, 2))
  if (data && data.Rows && data.Rows.length) {
    var values = []
    for (var i = 0; i < data.Rows.length; i++) {
      var row = data.Rows[i]
      if (row.IsExtraRow) {
        continue
      }
      // intentionally create new time object for each row (reference returned)
      const date = dayjs.tz(row.StartTime, 'YYYY-MM-DDTHH:mm:ss', config.timezone)
      if (!date.isValid()) {
        // console.log('invalid date ' + row.StartTime)
        continue
      } else if ((fromTime && date.unix() < (fromTime.unix())) ||
                (toTime && date.unix() >= (toTime.unix()))) {
        // console.log('date out of given range ' + date.format(), fromTime.format(), toTime.format())
        continue
      }
      for (var j = 0; j < row.Columns.length; j++) {
        var column = row.Columns[j]
        var value = parseFloat(column.Value.replace(/,/, '.').replace(/ /g, ''))
        if (isNaN(value)) {
          // console.log('invalid value ' + column.Value)
          continue
        }
        var area = column.Name
        // console.log(JSON.stringify(column, null, 2))
        if (!opts.area || opts.area.indexOf(area) >= 0) {
          // console.log({ area: area, date: date.toISOString(), value: value })
          values.push({ area: area, date: date.toISOString(), value: value })
        }
      }
    }
    // console.log(JSON.stringify(values, null, 2))
    callback(null, values)
  }
}

module.exports = Prices
