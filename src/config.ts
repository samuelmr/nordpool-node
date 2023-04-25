const baseUrl = 'https://www.nordpoolgroup.com/api'

export const config = {
  baseUrl: baseUrl,
  priceUrlHourly: baseUrl + '/marketdata/page/10',
  priceUrlDaily: baseUrl + '/marketdata/page/11',
  priceUrlWeekly: baseUrl + '/marketdata/page/12',
  priceUrlMonthly: baseUrl + '/marketdata/page/13',
  priceUrlYearly: baseUrl + '/marketdata/page/14',
  // volumeUrl: baseUrl + '/marketdata/page/',
  // capacityUrl: baseUrl + '/marketdata/page/',
  // flowUrl: baseUrl + '/marketdata/page/',
  timezone: 'Europe/Oslo'
};
