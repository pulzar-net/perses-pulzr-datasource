import type { VariablePlugin } from '@perses-dev/plugin-system';

import type { PulzrDatasourceClient } from '../../datasources/pulzr-datasource/pulzr-datasource-types';
import { DEFAULT_DATASOURCE } from '../../datasources/pulzr-datasource/selector';
import type { PulzrDeviceVariableSpec } from './pulzr-device-variable-types';
import { PulzrDeviceVariableEditor } from './PulzrDeviceVariableEditor';

export const PulzrDeviceVariable: VariablePlugin<PulzrDeviceVariableSpec> = {
  getVariableOptions: async (spec, ctx, abortSignal) => {
    const client = await ctx.datasourceStore.getDatasourceClient<PulzrDatasourceClient>(
      spec.datasource ?? DEFAULT_DATASOURCE,
    );
    const devices = await client.devices(abortSignal, spec.tag);
    return { data: devices.map((d) => ({ label: d.name || d.devEui, value: d.devEui })) };
  },
  OptionsEditorComponent: PulzrDeviceVariableEditor,
  createInitialOptions: () => ({}),
};
