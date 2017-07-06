var config = require('../config'),
  moment = require('moment-timezone'),
  request = require('request')

function Prices() {
  this.request = request
  return this;
}

Prices.prototype.at = function(opts, callback) {
  opts.date = opts.date ? moment.tz(opts.date, config.dateFormats, config.timezone) : moment.tz(config.timezone)
  opts.url = config.priceUrlHourly
  opts.maxRange = {hours: 1}
  this.getValues(opts, function(error, results) {
    if (error) {
      callback(error)
      return
    }
    for (let i=0; i<results.length; i++) {
      let date = results[i].date
      if (date.get('dayOfYear') == opts.date.get('dayOfYear') &&
          date.get('hour') == opts.date.get('hour')) {
        callback(null, results[i])
        return
      }
    }
    callback(new Error('No results found for ' + opts.date.format()))
  })
}

Prices.prototype.hourly = function(opts, callback) {
  opts.url = config.priceUrlHourly
  opts.maxRange = {days: 1}
  this.getValues(opts, callback)
}

Prices.prototype.daily = function(opts, callback) {
  opts.url = config.priceUrlDaily
  opts.maxRange = {months: 1}
  this.getValues(opts, callback)
}

Prices.prototype.weekly = function(opts, callback) {
  opts.url = config.priceUrlWeekly
  opts.maxRange = {weeks: 24}
  this.getValues(opts, callback)
}

Prices.prototype.monthly = function(opts, callback) {
  opts.url = config.priceUrlMonthly
  opts.maxRange = {months: 53}
  this.getValues(opts, callback)
}

Prices.prototype.yearly = function(opts, callback) {
  opts.url = config.priceUrlYearly
  this.getValues(opts, callback)
}

Prices.prototype.getValues = function(opts, callback) {
  if (!opts) {
    opts = {}
  }
  fromTime = opts.from ? moment.tz(opts.from, config.timeFormats, config.timezone) : null;
  toTime = opts.to ? moment.tz(opts.to, config.timeFormats, config.timezone) : null;
  if (fromTime && toTime && opts.maxRange) {
    minFromTime = moment(toTime).subtract(opts.maxRange);
    if (fromTime.isBefore(minFromTime)) {
      console.warn('Time span too long. Setting start time to ' + minFromTime.format())
      fromTime = minFromTime
    }
  }
  if (fromTime && !toTime && !opts.date && opts.maxRange) {
    opts.date = moment(fromTime).add(opts.maxRange)
  }
  else if ((fromTime || toTime) && !opts.date) {
    opts.date = toTime ? toTime : fromTime
  }
  opts.area = opts.area || null
  opts.currency = opts.currency || 'EUR'
  opts.date = opts.date || moment()
  var url = opts.url +
    '?currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency +
    '&endDate=' + moment(opts.date, config.dateFormats).format("DD-MM-YYYY")
  // console.log(url)
  var requestOpts = {url: url, json: true, jar: this.request.jar()}
  return this.request(requestOpts, function(error, response, json) {
    if (error) {
      console.trace(error)
      callback(error)
    }
    var data = json.data
    // console.log(JSON.stringify(data, null, 2))
    if (data && data.Rows && data.Rows.length) {
      var values = []
      for (var i=0; i<data.Rows.length; i++) {
        var row = data.Rows[i]
        if (row.IsExtraRow) {
          continue
        }
        // intentionally create new moment object for each row (reference returned)
        var date = moment.tz(row.StartTime, "YYYY-MM-DD\Thh:mm:ss", config.timezone)
        if (!date.isValid()) {
          // console.log('invalid date ' + row.StartTime)
          continue
        }
        else if ((fromTime && date.isBefore(fromTime)) ||
                 (toTime && date.isAfter(toTime))) {
          // console.log('date out of given range ' + date.format(), fromTime, toTime)
          continue
        }
        for (var j=0; j<row.Columns.length; j++) {
          var column = row.Columns[j]
          var value = parseFloat(column.Value.replace(/,/, '.'))
          if (isNaN(value)) {
            // console.log('invalid value ' + column.Value)
            continue
          }
          var area = column.Name
          // console.log(JSON.stringify(column, null, 2))
          if (!opts.area || (area == opts.area) || (opts.area.indexOf && (opts.area.indexOf(area) >= 0))) {
            values.push({area: area, date: date, value: value})
          }
        }
      }
      // console.log(JSON.stringify(values, null, 2))
      callback(null, values)
    }
  })
}

module.exports = Prices
