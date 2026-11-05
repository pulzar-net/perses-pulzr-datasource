import type { TimeSeriesQueryPlugin } from '@perses-dev/plugin-system';
import { replaceVariables } from '@perses-dev/plugin-system';

import { apiTimeRange, toTimeSeriesData } from '../../api';
import type { PulzrDatasourceClient } from '../../datasources/pulzr-datasource/pulzr-datasource-types';
import { DEFAULT_DATASOURCE } from '../../datasources/pulzr-datasource/selector';
import type { PulzrSqlQuerySpec } from './pulzr-sql-query-types';

export const getTimeSeriesData: TimeSeriesQueryPlugin<PulzrSqlQuerySpec>['getTimeSeriesData'] = async (
  spec,
  context,
  abortSignal,
) => {
  if (!spec.sql?.trim()) return { series: [] };

  const { datasource, ...query } = spec;
  const sql = replaceVariables(query.sql, context.variableState);
  const client = await context.datasourceStore.getDatasourceClient<PulzrDatasourceClient>(
    datasource ?? DEFAULT_DATASOURCE,
  );
  const response = await client.query(
    { query: { ...query, sql }, timeRange: apiTimeRange(context.timeRange) },
    abortSignal,
  );
  const data = toTimeSeriesData(response, context.timeRange);
  return { ...data, metadata: { ...data.metadata, executedQueryString: sql } };
};
