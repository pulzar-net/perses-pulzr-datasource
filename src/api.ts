import type { VariableStateMap } from '@perses-dev/plugin-system';
import type { AbsoluteTimeRange, Labels, TimeSeries, TimeSeriesData } from '@perses-dev/spec';

/**
 * The Pulzr Net data API, as the plugins read it. The contract is the public
 * OpenAPI document at /api/v1/openapi.json; these types cover only what the
 * plugins send and read.
 */

export type Aggregate = 'mean' | 'min' | 'max' | 'sum' | 'count' | 'last' | 'median' | 'p95' | 'timeWeighted' | 'rises';

/** One edge of a band: a field, carried forward, or a fixed number. */
export type BandEdge = string | number;

export type Band = { lo: BandEdge; hi: BandEdge } | { center: BandEdge; spread: BandEdge };

export interface Filter {
  field: string;
  op: string;
  value: unknown;
}

/** The body's `query` for POST /api/v1/data/query, field form. */
export interface FieldQuery {
  field?: string;
  fields?: string[];
  aggregate?: Aggregate;
  interval?: string;
  devices?: string[];
  groupBy?: 'device' | 'none';
  filter?: Filter[];
  carryForward?: boolean;
  holdFor?: string;
  band?: Band;
  annotate?: string[];
}

/** The body's `query` for POST /api/v1/data/query, SQL form. */
export interface SqlQuery {
  sql: string;
  time?: string;
  series?: string;
}

export interface Change {
  t: string;
  bucket: string;
  field: string;
  series: string;
  from: number;
  to: number;
}

export interface Latest {
  value: number | null;
  time: string;
  since: string | null;
  sinceAtLeast: boolean;
}

export interface QueryResponse {
  series: Array<Record<string, string | number | null>>;
  keys: string[];
  from: string;
  to: string;
  /** A Postgres interval (`30 minutes`); null for SQL, which buckets itself. */
  interval: string | null;
  /** The points carry `__lo` and `__hi`. */
  band?: boolean;
  changes?: Change[];
  latest?: Record<string, Latest>;
}

export type Metric = 'occupancyRate' | 'turnover' | 'dwell' | 'reporting';

/** The body for POST /api/v1/data/analytics, less `timeRange`. */
export interface MetricQuery {
  metric: Metric;
  field?: string;
  equals?: number;
  applicationId?: string;
  devices?: string[];
  interval?: string;
}

export interface MetricResponse {
  metric: Metric;
  description?: string;
  unit?: string | null;
  series: Array<{ t: string; value: number | null; samples?: number }>;
}

export interface LiveDevice {
  devEui: string;
  name: string;
  lastSeen: string;
  location?: { latitude: number; longitude: number; source: 'device' | 'gateway' } | null;
}

export interface DeviceSummary {
  devEui: string;
  name: string;
  lastSeen: string;
  uplinks: number;
}

/** The time range as net-api takes it. */
export function apiTimeRange({ start, end }: AbsoluteTimeRange): { from: string; to: string } {
  return { from: start.toISOString(), to: end.toISOString() };
}

const UNIT_MS = {
  second: 1000,
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
} as const;

/** A Postgres interval (`30 minutes`) in milliseconds. */
export function intervalMs(interval: string | null | undefined): number | undefined {
  const match = /^(\d+) (second|minute|hour|day|week)s?$/.exec(interval ?? '');
  return match ? Number(match[1]) * UNIT_MS[match[2] as keyof typeof UNIT_MS] : undefined;
}

/**
 * The step Perses lays every series on. A SQL answer has no interval, since
 * the query buckets itself, so its step is the smallest gap between rows.
 */
export function stepMs(response: QueryResponse): number | undefined {
  const step = intervalMs(response.interval);
  if (step !== undefined) return step;
  let smallest: number | undefined;
  for (let i = 1; i < response.series.length; i += 1) {
    const gap = Date.parse(String(response.series[i]?.t)) - Date.parse(String(response.series[i - 1]?.t));
    if (gap > 0 && (smallest === undefined || gap < smallest)) smallest = gap;
  }
  return smallest;
}

const BAND_KEYS = { __lo: 'lo', __hi: 'hi' } as const;

/**
 * net-api answers `[{t, <key>: value}]` with the keys listed; Perses wants one
 * series per key. A band's edges become two more series, labelled
 * `band: lo|hi`, so a panel can draw them as an area rather than as lines.
 */
export function toTimeSeries(response: QueryResponse): TimeSeries[] {
  const points = response.series ?? [];
  const column = (key: string, name: string, labels?: Labels): TimeSeries => ({
    name,
    labels,
    values: points.map((point) => [
      Date.parse(String(point.t)),
      typeof point[key] === 'number' ? (point[key] as number) : null,
    ]),
  });
  const series = (response.keys ?? []).map((key) => column(key, key));
  if (response.band) {
    for (const [key, edge] of Object.entries(BAND_KEYS)) {
      series.push(column(key, `band ${edge}`, { band: edge }));
    }
  }
  return series;
}

export function toTimeSeriesData(response: QueryResponse, timeRange: AbsoluteTimeRange): TimeSeriesData {
  return {
    timeRange,
    stepMs: stepMs(response),
    series: toTimeSeries(response),
    metadata: response.latest ? { latest: response.latest } : undefined,
  };
}

/**
 * Labels each per-device series with where the device is, for a map panel.
 * net-api names a per-device series by the device's name.
 */
export function withPositions(series: TimeSeries[], devices: LiveDevice[]): TimeSeries[] {
  const byName = new Map(devices.filter((d) => d.location).map((d) => [d.name, d]));
  return series.map((s) => {
    const device = byName.get(s.name);
    if (!device?.location) return s;
    return {
      ...s,
      labels: {
        ...s.labels,
        devEui: device.devEui,
        latitude: String(device.location.latitude),
        longitude: String(device.location.longitude),
      },
    };
  });
}

/** Perses's value for a variable's "All" option. */
const ALL = '$__all';

/**
 * `devices` names DevEUIs, or a variable (`$device`) whose current value does.
 * An unresolved variable is no devices, which net-api reads as every device:
 * the same as a board opened before anything is picked.
 */
export function resolveDevices(
  devices: string | string[] | undefined,
  variableState: VariableStateMap,
): string[] | undefined {
  if (devices === undefined) return undefined;
  if (Array.isArray(devices)) return devices;
  if (!devices.startsWith('$')) return [devices];
  const value = variableState[devices.slice(1)]?.value;
  if (Array.isArray(value)) return value.includes(ALL) ? [] : value;
  return typeof value === 'string' && value !== '' && value !== ALL ? [value] : [];
}

/** Variable names a query depends on, for Perses to wait on. */
export function variableNames(devices: string | string[] | undefined): string[] {
  return typeof devices === 'string' && devices.startsWith('$') ? [devices.slice(1)] : [];
}
