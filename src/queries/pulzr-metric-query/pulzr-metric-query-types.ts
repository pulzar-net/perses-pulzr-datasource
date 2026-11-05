import type { DatasourceSelector } from '@perses-dev/spec';

import type { MetricQuery } from '../../api';

/** A named Pulzr Net analytic: one definition shared by every dashboard. */
export interface PulzrMetricQuerySpec extends Omit<MetricQuery, 'devices'> {
  datasource?: DatasourceSelector;
  devices?: string | string[];
}
