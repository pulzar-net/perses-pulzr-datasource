import type { TimeSeriesQueryPlugin } from '@perses-dev/plugin-system';

import { variableNames } from '../../api';
import { getTimeSeriesData } from './get-time-series-data';
import type { PulzrMetricQuerySpec } from './pulzr-metric-query-types';
import { PulzrMetricQueryEditor } from './PulzrMetricQueryEditor';

export const PulzrMetricQuery: TimeSeriesQueryPlugin<PulzrMetricQuerySpec> = {
  getTimeSeriesData,
  OptionsEditorComponent: PulzrMetricQueryEditor,
  createInitialOptions: () => ({ metric: 'occupancyRate' }),
  dependsOn: (spec) => ({ variables: variableNames(spec.devices) }),
};
