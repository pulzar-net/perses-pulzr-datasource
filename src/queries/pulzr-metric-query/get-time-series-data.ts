import type { TimeSeriesQueryPlugin } from '@perses-dev/plugin-system';

import { apiTimeRange, intervalMs, resolveDevices } from '../../api';
import type { PulzrDatasourceClient } from '../../datasources/pulzr-datasource/pulzr-datasource-types';
import { DEFAULT_DATASOURCE } from '../../datasources/pulzr-datasource/selector';
import type { PulzrMetricQuerySpec } from './pulzr-metric-query-types';

export const getTimeSeriesData: TimeSeriesQueryPlugin<PulzrMetricQuerySpec>['getTimeSeriesData'] = async (
  spec,
  context,
  abortSignal,
) => {
  const { datasource, devices, ...query } = spec;
  const client = await context.datasourceStore.getDatasourceClient<PulzrDatasourceClient>(
    datasource ?? DEFAULT_DATASOURCE,
  );
  const response = await client.metric(
    { ...query, devices: resolveDevices(devices, context.variableState), timeRange: apiTimeRange(context.timeRange) },
    abortSignal,
  );
  // A weekday-by-hour grid has no time axis: it travels as metadata, for a
  // panel that draws the grid.
  if (response.matrix) {
    return {
      series: [],
      metadata: { matrix: response.matrix, unit: response.unit ?? undefined, description: response.description },
    };
  }
  const points = response.series ?? [];
  const gaps = points.slice(1).map((p, i) => Date.parse(p.t) - Date.parse(points[i]!.t));
  return {
    timeRange: context.timeRange,
    stepMs: intervalMs(query.interval) ?? (gaps.length ? Math.min(...gaps) : undefined),
    series: [{ name: response.metric, values: points.map((p) => [Date.parse(p.t), p.value]) }],
    metadata: { unit: response.unit ?? undefined, description: response.description },
  };
};
