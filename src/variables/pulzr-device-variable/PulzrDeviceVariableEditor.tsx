import { Stack, TextField } from '@mui/material';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import { PulzrDatasourceSelect } from '../../components';
import type { PulzrDeviceVariableSpec } from './pulzr-device-variable-types';

export function PulzrDeviceVariableEditor(props: OptionsEditorProps<PulzrDeviceVariableSpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  return (
    <Stack spacing={2}>
      <PulzrDatasourceSelect
        value={value.datasource}
        onChange={(datasource) => onChange({ ...value, datasource })}
        readOnly={isReadonly}
      />
      <TextField
        label="Device tag"
        placeholder="Every device"
        value={value.tag ?? ''}
        onChange={(event) => onChange({ ...value, tag: event.target.value || undefined })}
        slotProps={{ input: { readOnly: isReadonly } }}
      />
    </Stack>
  );
}
