import type { DatasourceSelector } from '@perses-dev/spec';

/** The devices Pulzr Net has heard from in the last 30 days, by name. */
export interface PulzrDeviceVariableSpec {
  datasource?: DatasourceSelector;
  /** Only devices carrying this LNS device tag. */
  tag?: string;
}
