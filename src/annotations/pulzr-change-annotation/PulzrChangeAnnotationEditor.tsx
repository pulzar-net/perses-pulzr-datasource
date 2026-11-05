import { Autocomplete, Stack, TextField } from '@mui/material';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import { DevicesField, PulzrDatasourceSelect } from '../../components';
import type { PulzrChangeAnnotationSpec, StateName } from './pulzr-change-annotation-types';

/** `1=Stage 1, 2=Stage 2`, or `true=On, false=Off`. */
const parseStates = (text: string): StateName[] | undefined => {
  const states = text
    .split(',')
    .map((pair) => pair.split('='))
    .filter(([value, label]) => value?.trim() && label?.trim())
    .map(([value, label]) => {
      const raw = value!.trim();
      return { value: raw === 'true' || raw === 'false' ? raw === 'true' : Number(raw), label: label!.trim() };
    });
  return states.length ? states : undefined;
};

export function PulzrChangeAnnotationEditor(props: OptionsEditorProps<PulzrChangeAnnotationSpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  const set = (patch: Partial<PulzrChangeAnnotationSpec>): void => onChange({ ...value, ...patch });
  const states = value.states?.map((s) => `${String(s.value)}=${s.label}`).join(', ') ?? '';

  return (
    <Stack spacing={2}>
      <PulzrDatasourceSelect
        value={value.datasource}
        onChange={(datasource) => set({ datasource })}
        readOnly={isReadonly}
      />
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={value.fields ?? []}
        readOnly={isReadonly}
        onChange={(_, fields) => set({ fields: fields.slice(0, 4) })}
        renderInput={(params) => (
          <TextField {...params} label="Fields" helperText="Up to four. Each change is marked." />
        )}
      />
      <DevicesField value={value.devices} onChange={(devices) => set({ devices })} readOnly={isReadonly} />
      <TextField
        fullWidth
        label="Value names"
        placeholder="1=Stage 1, 2=Stage 2"
        defaultValue={states}
        onBlur={(event) => set({ states: parseStates(event.target.value) })}
        slotProps={{ input: { readOnly: isReadonly } }}
      />
    </Stack>
  );
}
