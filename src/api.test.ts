import type { VariableStateMap } from '@perses-dev/plugin-system';

import { intervalMs, resolveDevices, stepMs, toTimeSeries } from './api';
import type { QueryResponse } from './api';

const answer = (patch: Partial<QueryResponse> = {}): QueryResponse => ({
  series: [
    { t: '2026-11-05T00:00:00+00:00', value: 1, __lo: 0, __hi: 2 },
    { t: '2026-11-05T00:30:00+00:00', value: null, __lo: 0, __hi: 2 },
  ],
  keys: ['value'],
  from: '2026-11-05T00:00:00+00:00',
  to: '2026-11-05T01:00:00+00:00',
  interval: '30 minutes',
  ...patch,
});

describe('intervalMs', () => {
  it('reads the Postgres intervals net-api answers with', () => {
    expect(intervalMs('5 minutes')).toBe(300_000);
    expect(intervalMs('1 hour')).toBe(3_600_000);
    expect(intervalMs('1 day')).toBe(86_400_000);
  });

  it('has no step for SQL, which buckets itself', () => {
    expect(intervalMs(null)).toBeUndefined();
  });
});

describe('stepMs', () => {
  it('falls back to the smallest gap between rows', () => {
    const series = [
      { t: '2026-11-05T00:00:00Z', v: 1 },
      { t: '2026-11-05T02:00:00Z', v: 1 },
      { t: '2026-11-05T03:00:00Z', v: 1 },
    ];
    expect(stepMs(answer({ interval: null, series }))).toBe(3_600_000);
  });
});

describe('toTimeSeries', () => {
  it('makes one series per key, nulls kept', () => {
    const [series] = toTimeSeries(answer());
    expect(series).toEqual({
      name: 'value',
      labels: undefined,
      values: [
        [Date.parse('2026-11-05T00:00:00Z'), 1],
        [Date.parse('2026-11-05T00:30:00Z'), null],
      ],
    });
  });

  it('adds the band edges as labelled series only when the answer has a band', () => {
    expect(toTimeSeries(answer())).toHaveLength(1);
    const withBand = toTimeSeries(answer({ band: true }));
    expect(withBand.map((s) => s.labels)).toEqual([undefined, { band: 'lo' }, { band: 'hi' }]);
  });
});

const state = (value: string | string[]): VariableStateMap => ({ device: { value, loading: false } });

describe('resolveDevices', () => {
  it('passes DevEUIs through', () => {
    expect(resolveDevices(['a84041000181c061'], {})).toEqual(['a84041000181c061']);
    expect(resolveDevices('a84041000181c061', {})).toEqual(['a84041000181c061']);
  });

  it('reads a variable', () => {
    expect(resolveDevices('$device', state('a84041000181c061'))).toEqual(['a84041000181c061']);
    expect(resolveDevices('$device', state(['a', 'b']))).toEqual(['a', 'b']);
  });

  it('is every device when the variable is All or unset', () => {
    expect(resolveDevices('$device', state('$__all'))).toEqual([]);
    expect(resolveDevices('$device', state(['$__all']))).toEqual([]);
    expect(resolveDevices('$device', {})).toEqual([]);
  });
});
