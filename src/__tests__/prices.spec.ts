/* global describe, it */
'use strict'
import nock from "nock";
import {describe, before} from "mocha";
import {expect} from 'chai'
import {Prices} from '../prices'
import {config} from '../config'
import dayjs from 'dayjs'
import dayjsPluginCustomParseFormat from 'dayjs/plugin/customParseFormat.js'
import dayjsPluginUtc from 'dayjs/plugin/utc.js'
import dayjsPluginTimezone from 'dayjs/plugin/timezone.js'
import dayjsPluginWeekOfYear from 'dayjs/plugin/weekOfYear.js'
import { dailyPrices, hourlyHighPrices, hourlyPrices, monthlyPrices, weeklyPrices, yearlyPrices } from "./procesTestData";
dayjs.extend(dayjsPluginCustomParseFormat) // Used to accept custom date formats
dayjs.extend(dayjsPluginUtc) // Used by timezone
dayjs.extend(dayjsPluginTimezone) // Used to convert from one timezone to another
dayjs.extend(dayjsPluginWeekOfYear) // Used to parse week numbers

describe('Prices ', function () { 
  const prices = new Prices()
  /* eslint-enable */
  nock(config.baseUrl)
    .get('/marketdata/page/10?currency=,NOK,NOK,NOK&endDate=01-03-2018')
    .reply(200, hourlyHighPrices)
    .get('/marketdata/page/10?currency=,EUR,EUR,EUR&endDate=01-04-2016')
    .reply(200, hourlyPrices)
    .get('/marketdata/page/10?currency=,EUR,EUR,EUR&endDate=01-04-2016')
    .reply(200, hourlyPrices) // same reply must be specified again for each use
    .get('/marketdata/page/10?currency=,EUR,EUR,EUR&endDate=01-04-2016')
    .reply(200, hourlyPrices)
    .get('/marketdata/page/11?currency=,NOK,NOK,NOK&endDate=31-03-2016')
    .reply(200, dailyPrices)
    .get('/marketdata/page/11?currency=,NOK,NOK,NOK&endDate=31-03-2016')
    .reply(200, dailyPrices)
    .get('/marketdata/page/12?currency=,DKK,DKK,DKK&endDate=08-06-2015')
    .reply(200, weeklyPrices)
    .get('/marketdata/page/12?currency=,DKK,DKK,DKK&endDate=08-06-2015')
    .reply(200, weeklyPrices)
    .get('/marketdata/page/13?currency=,SEK,SEK,SEK&endDate=01-12-2016')
    .reply(200, monthlyPrices)
    .get('/marketdata/page/13?currency=,SEK,SEK,SEK&endDate=31-12-2016')
    .reply(200, monthlyPrices)
    .get('/marketdata/page/14?currency=,EUR,EUR,EUR&endDate=01-01-2017')
    .reply(200, yearlyPrices);
   

  it('should get Tr.heim price in NOK at March 1st 2018 07:00 CEST', async function () {
    const response = await prices.at({
      area: 'Tr.heim',
      currency: 'NOK',
      date: '2018-03-01T07:00:00Z'
    })
    if (!response) throw new Error('response undefined');
    expect(response.area).to.eq('Tr.heim')
    expect(dayjs(response.date).tz('Europe/Oslo').format('YYYY-MM-DD H:mm:ss')).to.equal('2018-03-01 8:00:00')
    expect(response.value).to.eq(2454.31)
  })

  it('should get LV price in EUR at April 1st 2016 15:00 GMT', async function () {
    const response = await prices.at({
      area: 'LV',
      date: '2016-04-01T15:00:00Z'
    })
    if (!response) throw new Error('response undefined');
    expect(response.area).to.eq('LV')
    expect(dayjs(response.date).tz('Europe/Riga').format('YYYY-MM-DD H:mm:ss')).to.equal('2016-04-01 18:00:00')
    expect(response.value).to.eq(30.01)
  })

  it('should get the same results again', async function () {
    const response = await prices.hourly({
      area: 'LV',
      from: '2016-04-01T15:00:00Z',
      to: '2016-04-01T15:00:01Z'
    })
    if (!response) throw new Error("response undefined");
    expect(response[0].area).to.eq('LV')
    expect(dayjs(response[0].date).tz('Europe/Riga').format('YYYY-MM-DD H:mm:ss')).to.equal('2016-04-01 18:00:00')
    expect(response[0]).to.have.property('value', 30.01)
  })

  it('should get hourly FI prices in EUR, Finnish time', async function () {
    const response = await prices.hourly({
      area: 'FI',
      date: '2016-04-01T23:59:59+0300'
    })
    if (!response) throw new Error('response undefined');
    expect(response.length).to.eq(24);
    expect(response[0].value).to.eq(20.69)
    expect(dayjs(response[0].date).tz('Europe/Helsinki').format('YYYY-MM-DD')).to.equal('2016-04-01')
  })

  it('should get daily Oslo prices in NOK', async function () {
    const response = await prices.daily({
      area: 'Oslo',
      currency: 'NOK',
      date: '2016-03-31'
    })
    if (!response) throw new Error("response undefined");
    expect(response.length).to.eq(31)
    expect(response[0].value).to.eq(204.37)
    expect(dayjs(response[0].date).tz('Europe/Oslo').format('YYYY-MM-DD')).to.equal('2016-03-31')
  })

  it('should print a warning and get daily Oslo prices in NOK', async function () {
    const response = await prices.daily({
      area: 'Oslo',
      currency: 'NOK',
      from: '2016-02-28',
      to: '2016-03-31'
    })
    if (!response) throw new Error('response undefined');
    expect(response.length).to.eq(31)
    expect(response[0].value).to.eq(204.37)
    expect(dayjs(response[0].date).tz('Europe/Oslo').format('YYYY-MM-DD')).to.equal('2016-03-31')
  })

  it('should get weekly DK2 prices in DKK from date-string input', async function () {
    const response = await prices.weekly({
      area: 'DK2',
      currency: 'DKK',
      date: '2015-06-08'
    })
    if (!response) throw new Error('response undefined');
    expect(response.length).to.eq(24);
    const result = response[0];
    expect(result.value).to.eq(186.32);
    expect(dayjs(result.date).week()).to.equal(24)
    expect(dayjs(result.date).format('YYYY')).to.equal('2015')
  })

  // >v2.1.1 upgrade: moment-timezone is able to parse week numbers as '24/2015' as week 24 in year 2015. 
  // But day.js cant do this natively and this test is therefor removed
  // it('should get weekly DK2 prices in DKK from week/year input', async function () {
  //   const response = await prices.weekly({
  //     area: 'DK2',
  //     currency: 'DKK',
  //     date: '24/2015'
  //   })
  //   expect(response).to.have.property('length', 24)
  //   expect(response[0]).to.have.property('value', 186.32)
  //   expect(dayjs(response[0].date).week()).to.equal(24)
  //   expect(dayjs(response[0].date).format('YYYY')).to.equal('2015')
  // })

  it('should get monthly SE4 prices in SEK', async function () {
    const response = await prices.monthly({
      area: 'SE4',
      currency: 'SEK',
      date: '2016-12'
    })
    if (!response) throw new Error("response undefined");
    expect(response.length).to.eq(53);
    expect(response[0].value).to.eq(333.57)
  })

  it('should get only 12 monthly prices', async function () {
    const response = await prices.monthly({
      area: 'SE4',
      currency: 'SEK',
      from: '2015-12-31',
      to: '2016-12-31'
    })
    expect(response).to.not.be.undefined;
    expect(response?.length).to.eq(12);
    expect(response![0].value).to.eq(333.57);
  })

  it('should get all yearly prices in EUR', async function () {
    const response = await prices.yearly({
      date: '2017-01-01'
    })
    if (!response) throw new Error("response undefined");
    expect(response.length).to.eq(196)
    expect(response[0].value).to.eq(26.91)
  })
})
