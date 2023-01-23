import fetch from "node-fetch";
import { config } from "./config";
import dayjs from "dayjs";
import dayjsPluginUtc from "dayjs/plugin/utc.js";
import dayjsPluginTimezone from "dayjs/plugin/timezone.js";
import dayjsPluginDayOfYear from "dayjs/plugin/dayOfYear.js";
dayjs.extend(dayjsPluginUtc); // Used by timezone
dayjs.extend(dayjsPluginTimezone); // Used to convert from one timezone to another
dayjs.extend(dayjsPluginDayOfYear); // Used to compare dates
dayjs.tz.setDefault("UTC"); // Needed when working with different timezones

export type PriceOptions = {
  area?: string;
  currency?: string;
  date?: string | number | Date;
  from?: DateType;
  to?: DateType;
};

type NordpoolRange = {
  hour?: number;
  day?: number;
  week?: number;
  month?: number;
}
type NordpoolOptions = {
  url: string;
  maxRange?: NordpoolRange;
  maxRangeValue?: number;
  date?: dayjs.Dayjs;
} & Omit<PriceOptions, "date">;
type DateType = string | number | dayjs.Dayjs | Date | null | undefined;

/**
 * Result data type
 */
export type Result = {
  date: string;
  value: number;
  area: string;
};

export class Prices {
  async at(opts: PriceOptions): Promise<Result> {
    const date = opts.date
      ? dayjs.tz(new Date(opts.date))
      : dayjs.tz(new Date().toISOString());
    
    const results = await this.getValues(Object.assign({}, opts, {
      url: config.priceUrlHourly,
      maxRange: { hour: 1 },
    }, {date}) as NordpoolOptions);
    if (results) {
      for (const result of results) {
        if (
          dayjs(result.date).tz("UTC").dayOfYear() === date.dayOfYear() &&
          dayjs(result.date).tz("UTC").hour() === date.hour()
        ) {
          return result;
        }
      }
    }
    throw new Error("No results found for " + date.format());
  }

  async hourly(opts: PriceOptions) {
    return this.getValues(
      Object.assign({}, opts, {
        url: config.priceUrlHourly,
        maxRange: { day: 1 },
      }) as NordpoolOptions
    );
  }

  async daily(opts: PriceOptions) {
    return this.getValues(
      Object.assign({}, opts, {
        url: config.priceUrlDaily,
        maxRange: { day: 31 },
      }) as NordpoolOptions
    );
  }

  async weekly(opts: PriceOptions) {
    return this.getValues(Object.assign({}, opts, {
      url: config.priceUrlWeekly,
      maxRange: { week: 24 },
    }) as NordpoolOptions);
  }

  async monthly(opts: PriceOptions) {
    return this.getValues(
      Object.assign({}, opts, {
        url: config.priceUrlMonthly,
        maxRange: { month: 53 },
      }) as NordpoolOptions
    );
  }

  async yearly(opts: PriceOptions) {
    return this.getValues(
      Object.assign({}, opts, {
        url: config.priceUrlYearly,
      }) as NordpoolOptions
    );
  }

  private async getValues(opts: NordpoolOptions): Promise<Result[]|undefined> {
    let fromTime = opts.from ? dayjs.tz(opts.from) : null;
    const toTime = opts.to ? dayjs.tz(opts.to) : null;
    const maxRangeKey = opts.maxRange ? (opts.maxRange.day ? "day" : opts.maxRange.hour ? "hour" : opts.maxRange.month ? "month" : "week") : undefined;
    const maxRangeValue = opts.maxRange && maxRangeKey ? opts.maxRange[maxRangeKey] : 0;
    if (fromTime && toTime && maxRangeKey && maxRangeValue) {
      const minFromTime = toTime.subtract(maxRangeValue, maxRangeKey);
      if (fromTime.isBefore(minFromTime)) {
        console.warn(
          "Time span too long. Setting start time to " + minFromTime.format()
        );
        fromTime = minFromTime;
      }
    }
    let optsDate;
    if (fromTime && !toTime && !opts.date && maxRangeKey && maxRangeValue) {
      optsDate = dayjs(fromTime).add(maxRangeValue, maxRangeKey);
    } else if ((fromTime || toTime) && !opts.date) {
      optsDate = toTime || fromTime;
    } else if (!opts.date) {
      optsDate = dayjs.tz(new Date().toISOString());
    } else {
      optsDate = opts.date;
    }
    const currency = opts.currency || "EUR";
    const url = `${opts.url}?currency=,${currency},${currency},${currency}&endDate=${dayjs.tz(optsDate, config.timezone).format("DD-MM-YYYY")}`
    
    // fetch
    const resp = await fetch(url);
    if (resp.status !== 200) throw new Error(`Unable to make request to nordpool - status ${resp.status}`);
    const obj: any = await resp.json();
    const data = obj.data;
    if (data && data.Rows && data.Rows.length) {
      const values = [];
      for (const row of data.Rows) {
        if (row.IsExtraRow) {
          continue;
        }

        const date = dayjs.tz(
          row.StartTime,
          "YYYY-MM-DDTHH:mm:ss",
          config.timezone
        );
        if (!date.isValid()) {
          continue;
        } else if (
          (fromTime && date.unix() < fromTime.unix()) ||
          (toTime && date.unix() >= toTime.unix())
        ) {
          // date out of given range
          continue;
        }
        for (const column of row.Columns) {
          const value = parseFloat(
            column.Value.replace(/,/, ".").replace(/ /g, "")
          );
          if (isNaN(value)) {
            continue;
          }
          const area = column.Name;
          if (!opts.area || opts.area === area) {
            values.push({ area: area, date: date.toISOString(), value: value } as Result);
          }
        }
      }
      return values;
    }
  }
}
