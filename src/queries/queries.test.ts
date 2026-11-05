import type { TimeSeriesQueryContext } from '@perses-dev/plugin-system';

import type { PulzrDatasourceClient } from '../datasources/pulzr-datasource/pulzr-datasource-types';
import { PulzrFieldQuery } from './pulzr-field-query';
import { PulzrMetricQuery } from './pulzr-metric-query';
import { PulzrSqlQuery } from './pulzr-sql-query';

const timeRange = { start: new Date('2026-11-05T00:00:00Z'), end: new Date('2026-11-05T01:00:00Z') };

function context(client: Partial<PulzrDatasourceClient>, mode?: 'instant' | 'range'): TimeSeriesQueryContext {
  return {
    timeRange,
    mode,
    variableState: { device: { value: 'a84041000181c061', loading: false } },
    datasourceStore: { getDatasourceClient: async () => client },
  } as unknown as TimeSeriesQueryContext;
}

const answer = {
  series: [{ t: '2026-11-05T00:00:00+00:00', value: 21.5 }],
  keys: ['value'],
  from: '',
  to: '',
  interval: '5 minutes',
};

describe('PulzrFieldQuery', () => {
  it('sends the field query with the range and the variable resolved', async () => {
    const query = vi.fn().mockResolvedValue(answer);
    const data = await PulzrFieldQuery.getTimeSeriesData(
      { field: 'temperature', aggregate: 'timeWeighted', devices: '$device' },
      context({ query }),
    );
    expect(query).toHaveBeenCalledWith(
      {
        query: { field: 'temperature', aggregate: 'timeWeighted', devices: ['a84041000181c061'] },
        timeRange: { from: '2026-11-05T00:00:00.000Z', to: '2026-11-05T01:00:00.000Z' },
        latest: false,
      },
      undefined,
    );
    expect(data.stepMs).toBe(300_000);
    expect(data.series[0]?.values).toEqual([[Date.parse('2026-11-05T00:00:00Z'), 21.5]]);
  });

  it('asks for current values on an instant query', async () => {
    const query = vi.fn().mockResolvedValue({ ...answer, latest: { value: { value: 21.5 } } });
    const data = await PulzrFieldQuery.getTimeSeriesData({ field: 'temperature' }, context({ query }, 'instant'));
    expect(query.mock.calls[0]![0].latest).toBe(true);
    expect(data.metadata).toEqual({ latest: { value: { value: 21.5 } } });
  });

  it('asks nothing without a field', async () => {
    const query = vi.fn();
    expect(await PulzrFieldQuery.getTimeSeriesData({ field: '' }, context({ query }))).toEqual({ series: [] });
    expect(query).not.toHaveBeenCalled();
  });

  it('waits on the devices variable', () => {
    expect(PulzrFieldQuery.dependsOn?.({ field: 'x', devices: '$device' }, context({}))).toEqual({
      variables: ['device'],
    });
  });
});

describe('PulzrFieldQuery positions', () => {
  it('labels each device series with where the device is', async () => {
    const query = vi.fn().mockResolvedValue({ ...answer, keys: ['Bay 14', 'Bay 15'] });
    const liveDevices = vi.fn().mockResolvedValue([
      {
        devEui: 'a84041000181c061',
        name: 'Bay 14',
        lastSeen: '',
        location: { latitude: 34.02, longitude: -118.28, source: 'device' },
      },
      { devEui: 'a84041000181c062', name: 'Bay 15', lastSeen: '', location: null },
    ]);
    const data = await PulzrFieldQuery.getTimeSeriesData(
      { field: 'park_status', groupBy: 'device', positions: true },
      context({ query, liveDevices }),
    );
    expect(query.mock.calls[0]![0].query).not.toHaveProperty('positions');
    expect(data.series.map((s) => s.labels)).toEqual([
      { devEui: 'a84041000181c061', latitude: '34.02', longitude: '-118.28' },
      undefined,
    ]);
  });
});

describe('PulzrSqlQuery', () => {
  it("leaves Pulzr Net's $from and $to for the server", async () => {
    const query = vi.fn().mockResolvedValue({ ...answer, interval: null });
    const sql = 'select time, value from readings where dev_eui = $device and time between $from and $to';
    const data = await PulzrSqlQuery.getTimeSeriesData({ sql, time: 'time' }, context({ query }));
    expect(query.mock.calls[0]![0].query.sql).toBe(
      'select time, value from readings where dev_eui = a84041000181c061 and time between $from and $to',
    );
    expect(data.metadata?.executedQueryString).toContain('$from');
    expect(PulzrSqlQuery.dependsOn?.({ sql }, context({}))).toEqual({ variables: ['device'] });
  });
});

describe('PulzrMetricQuery', () => {
  it('reads the analytic as one series named by the metric', async () => {
    const metric = vi.fn().mockResolvedValue({
      metric: 'occupancyRate',
      unit: '%',
      series: [
        { t: '2026-11-05T00:00:00+00:00', value: 61.9 },
        { t: '2026-11-05T01:00:00+00:00', value: 64.2 },
      ],
    });
    const data = await PulzrMetricQuery.getTimeSeriesData(
      { metric: 'occupancyRate', field: 'park_status', equals: 1 },
      context({ metric }),
    );
    expect(metric.mock.calls[0]![0]).toMatchObject({ metric: 'occupancyRate', field: 'park_status', equals: 1 });
    expect(data.stepMs).toBe(3_600_000);
    expect(data.series).toHaveLength(1);
    expect(data.series[0]?.name).toBe('occupancyRate');
    expect(data.metadata).toMatchObject({ unit: '%' });
  });
});
