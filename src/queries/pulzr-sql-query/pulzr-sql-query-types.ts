import type { DatasourceSelector } from '@perses-dev/spec';

import type { SqlQuery } from '../../api';

/**
 * A SELECT over Pulzr Net's readings, run read-only as whoever views the
 * dashboard. `$from` and `$to` in the SQL are the dashboard's range, filled
 * in by Pulzr Net; Perses variables are filled in here first.
 */
export interface PulzrSqlQuerySpec extends SqlQuery {
  datasource?: DatasourceSelector;
}
