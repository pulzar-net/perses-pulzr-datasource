import { MenuItem, Stack, TextField } from '@mui/material';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { Metric } from '../../api';
import { DevicesField, PulzrDatasourceSelect } from '../../components';
import type { PulzrMetricQuerySpec } from './pulzr-metric-query-types';

const METRICS: Array<{ value: Metric; label: string }> = [
  { value: 'occupancyRate', label: 'Occupancy rate (%)' },
  { value: 'turnover', label: 'Turnover (changes per bucket)' },
  { value: 'dwell', label: 'Dwell (mean minutes)' },
  { value: 'reporting', label: 'Sensors reporting' },
  { value: 'occupancyByHour', label: 'Occupancy by weekday and hour (%)' },
];

export function PulzrMetricQueryEditor(props: OptionsEditorProps<PulzrMetricQuerySpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  const set = (patch: Partial<PulzrMetricQuerySpec>): void => onChange({ ...value, ...patch });
  const readOnly = { input: { readOnly: isReadonly } };

  return (
    <Stack spacing={2}>
      <PulzrDatasourceSelect
        value={value.datasource}
        onChange={(datasource) => set({ datasource })}
        readOnly={isReadonly}
      />
      <TextField
        select
        label="Metric"
        value={value.metric}
        onChange={(event) => set({ metric: event.target.value as Metric })}
        slotProps={readOnly}
      >
        {METRICS.map((m) => (
          <MenuItem key={m.value} value={m.value}>
            {m.label}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="State field"
          placeholder="park_status"
          value={value.field ?? ''}
          onChange={(event) => set({ field: event.target.value || undefined })}
          slotProps={readOnly}
        />
        <TextField
          fullWidth
          label="Equals"
          helperText="Empty counts true or non-zero."
          value={value.equals ?? ''}
          onChange={(event) => set({ equals: event.target.value === '' ? undefined : Number(event.target.value) })}
          slotProps={readOnly}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="Application"
          placeholder="Every application"
          value={value.applicationId ?? ''}
          onChange={(event) => set({ applicationId: event.target.value || undefined })}
          slotProps={readOnly}
        />
        <TextField
          fullWidth
          label="Bucket"
          placeholder="Auto"
          value={value.interval ?? ''}
          onChange={(event) => set({ interval: event.target.value || undefined })}
          slotProps={readOnly}
        />
      </Stack>
      <DevicesField value={value.devices} onChange={(devices) => set({ devices })} readOnly={isReadonly} />
    </Stack>
  );
}
