import type { TimeSeriesQueryPlugin } from '@perses-dev/plugin-system';

import { variableNames } from '../../api';
import { getTimeSeriesData } from './get-time-series-data';
import type { PulzrFieldQuerySpec } from './pulzr-field-query-types';
import { PulzrFieldQueryEditor } from './PulzrFieldQueryEditor';

export const PulzrFieldQuery: TimeSeriesQueryPlugin<PulzrFieldQuerySpec> = {
  getTimeSeriesData,
  OptionsEditorComponent: PulzrFieldQueryEditor,
  createInitialOptions: () => ({ field: '', aggregate: 'mean' }),
  dependsOn: (spec) => ({ variables: variableNames(spec.devices) }),
};
