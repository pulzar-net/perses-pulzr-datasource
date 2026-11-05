import type { TimeSeriesQueryPlugin } from '@perses-dev/plugin-system';
import { parseVariables } from '@perses-dev/plugin-system';

import { getTimeSeriesData } from './get-time-series-data';
import type { PulzrSqlQuerySpec } from './pulzr-sql-query-types';
import { PulzrSqlQueryEditor } from './PulzrSqlQueryEditor';

/** Pulzr Net's own placeholders, which are not Perses variables. */
const RANGE = new Set(['from', 'to']);

export const PulzrSqlQuery: TimeSeriesQueryPlugin<PulzrSqlQuerySpec> = {
  getTimeSeriesData,
  OptionsEditorComponent: PulzrSqlQueryEditor,
  createInitialOptions: () => ({ sql: '' }),
  dependsOn: (spec) => ({ variables: parseVariables(spec.sql ?? '').filter((name) => !RANGE.has(name)) }),
};
