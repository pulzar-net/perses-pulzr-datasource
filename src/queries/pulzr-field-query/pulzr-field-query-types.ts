import type { DatasourceSelector } from '@perses-dev/spec';

import type { FieldQuery } from '../../api';

/**
 * One or more decoded fields, bucketed and aggregated by Pulzr Net. Field
 * changes are marked by the PulzrChangeAnnotation, not here.
 */
export interface PulzrFieldQuerySpec extends Omit<FieldQuery, 'devices' | 'annotate'> {
  datasource?: DatasourceSelector;
  /** DevEUIs, or a variable (`$device`) holding them. */
  devices?: string | string[];
  /** With one series per device, label each with the device's position, for a map. */
  positions?: boolean;
}
