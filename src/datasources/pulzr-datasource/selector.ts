import type { DatasourceSelector } from '@perses-dev/spec';

export const DATASOURCE_KIND = 'PulzrDatasource';

/** No `name`: Perses picks the dashboard's default Pulzr datasource. */
export const DEFAULT_DATASOURCE: DatasourceSelector = { kind: DATASOURCE_KIND };
