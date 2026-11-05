import type { AnnotationContext } from '@perses-dev/plugin-system';
import type { AnnotationData } from '@perses-dev/spec';

import { apiTimeRange, resolveDevices } from '../../api';
import type { PulzrDatasourceClient } from '../../datasources/pulzr-datasource/pulzr-datasource-types';
import { DEFAULT_DATASOURCE } from '../../datasources/pulzr-datasource/selector';
import type { PulzrChangeAnnotationSpec, StateName } from './pulzr-change-annotation-types';

/** On/off fields arrive as 1 and 0; a state named `true` or `false` matches them. */
function stateLabel(value: number, states: StateName[] | undefined): string {
  const named = states?.find((s) => (typeof s.value === 'boolean' ? Number(s.value) === value : s.value === value));
  return named?.label ?? String(value);
}

export async function getAnnotationData(
  spec: PulzrChangeAnnotationSpec,
  context: AnnotationContext,
  abortSignal?: AbortSignal,
): Promise<AnnotationData[]> {
  const fields = spec.fields?.filter(Boolean) ?? [];
  if (fields.length === 0) return [];

  const client = await context.datasourceStore.getDatasourceClient<PulzrDatasourceClient>(
    spec.datasource ?? DEFAULT_DATASOURCE,
  );
  // net-api finds changes alongside a query of the same fields. The widest
  // bucket keeps the series part of the answer as small as it can be.
  const response = await client.query(
    {
      query: {
        field: fields[0],
        fields: fields.length > 1 ? fields : undefined,
        aggregate: 'last',
        interval: '1d',
        devices: resolveDevices(spec.devices, context.variableState),
        groupBy: 'device',
        annotate: fields,
      },
      timeRange: apiTimeRange(context.absoluteTimeRange),
    },
    abortSignal,
  );
  return (response.changes ?? []).map((change) => ({
    start: Date.parse(change.t),
    title: `${change.field}: ${stateLabel(change.from, spec.states)} to ${stateLabel(change.to, spec.states)}`,
    legend: change.series === 'value' ? undefined : change.series,
    tags: { field: change.field, device: change.series },
  }));
}
