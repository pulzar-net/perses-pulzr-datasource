import type { TimeSeriesQueryPlugin } from '@perses-dev/plugin-system';

import { apiTimeRange, resolveDevices, toTimeSeriesData } from '../../api';
import type { PulzrDatasourceClient } from '../../datasources/pulzr-datasource/pulzr-datasource-types';
import { DEFAULT_DATASOURCE } from '../../datasources/pulzr-datasource/selector';
import type { PulzrFieldQuerySpec } from './pulzr-field-query-types';

export const getTimeSeriesData: TimeSeriesQueryPlugin<PulzrFieldQuerySpec>['getTimeSeriesData'] = async (
  spec,
  context,
  abortSignal,
) => {
  if (!spec.field && !spec.fields?.length) return { series: [] };

  const { datasource, devices, ...query } = spec;
  const client = await context.datasourceStore.getDatasourceClient<PulzrDatasourceClient>(
    datasource ?? DEFAULT_DATASOURCE,
  );
  const response = await client.query(
    {
      query: { ...query, devices: resolveDevices(devices, context.variableState) },
      timeRange: apiTimeRange(context.timeRange),
      // An instant query is a panel showing what is true now: net-api adds
      // each series' current value and since when it has held.
      latest: context.mode === 'instant',
    },
    abortSignal,
  );
  return toTimeSeriesData(response, context.timeRange);
};
