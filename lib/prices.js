var config = require('../config'),
  moment = require('moment'),
  request = require('request')

function Prices() {
  this.request = request
  return this;
}

Prices.prototype.hourly = function(opts, callback) {
  opts.url = config.priceUrlHourly
  this.getValues(opts, callback)
}

Prices.prototype.daily = function(opts, callback) {
  opts.url = config.priceUrlDaily
  this.getValues(opts, callback)
}

Prices.prototype.weekly = function(opts, callback) {
  opts.url = config.priceUrlWeekly
  this.getValues(opts, callback)
}

Prices.prototype.monthly = function(opts, callback) {
  opts.url = config.priceUrlMonthly
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
  opts.currency = opts.currency || 'EUR'
  opts.area = opts.area || null
  // this weird format is used in e.g.
  // http://www.nordpoolspot.com/Market-data1/Elspot/Area-Prices/
  // console.log(opts.url)
  var startDate, endDate;
  var url = opts.url +
    '?currency=,' + opts.currency + ',' + opts.currency + ',' + opts.currency
  if (opts.startDate) {
    startDate = moment(opts.startDate).hour(0).minute(0).second(0)
    url += '&startDate=' + startDate.format("DD-MM-YYYY")
  }
  if (opts.endDate) {
    endDate = moment(opts.endDate).hour(23).minute(59).second(59)
    url += '&endDate=' + endDate.format("DD-MM-YYYY")
  }
  var requestOpts = {url: url, jar: this.request.jar()}
  return this.request(requestOpts, function(error, response, body) {
    if (error) {
      console.trace(error)
      callback(error)
    }
    var json = JSON.parse(body)
    var data = json.data
    // console.log(JSON.stringify(data, null, 2))
    if (data && data.Rows && data.Rows.length) {
      var values = []
      for (var i=0; i<data.Rows.length; i++) {
        var row = data.Rows[i]
        if (row.IsExtraRow) {
          continue
        }
        // intentionally create new date object for each row (reference returned)
        var date = moment(row.StartTime, "YYYY-MM-DD\Thh:mm:ss")
        if (!date.isValid()) {
          // console.log('invalid date ' + row.StartTime)
          continue
        }
        else if ((startDate && date.isBefore(startDate)) || 
          (endDate && date.isAfter(endDate))) {
          // console.log('date out of given range ' + row.StartTime)
          continue
        }
        // console.log(date.format('YYYY-MM-DD\Thh:mm:ss'))
        for (var j=0; j<row.Columns.length; j++) {
          var column = row.Columns[j]
          var value = parseFloat(column.Value.replace(/,/, '.'))
          if (isNaN(value)) {
            // console.log('invalid value ' + column.Value)
            continue
          }
          var area = column.Name
          // console.log(JSON.stringify(column, null, 2))
          if (!opts.area || (area == opts.area)) {
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
