import type { DatasourceSelector } from '@perses-dev/spec';

/** What one value of a field means, for the mark's title. */
export interface StateName {
  value: number | boolean;
  label: string;
}

/** Marks every change of up to four fields: a recipe stage, a mode, a setpoint. */
export interface PulzrChangeAnnotationSpec {
  datasource?: DatasourceSelector;
  fields: string[];
  devices?: string | string[];
  states?: StateName[];
}
