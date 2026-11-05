import { Autocomplete, FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material';
import { useDatasourceClient } from '@perses-dev/plugin-system';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import type { Aggregate, Band } from '../../api';
import { DevicesField, PulzrDatasourceSelect } from '../../components';
import type { PulzrDatasourceClient } from '../../datasources/pulzr-datasource/pulzr-datasource-types';
import { DEFAULT_DATASOURCE } from '../../datasources/pulzr-datasource/selector';
import type { PulzrFieldQuerySpec } from './pulzr-field-query-types';

const AGGREGATES: Array<{ value: Aggregate; label: string }> = [
  { value: 'mean', label: 'Mean' },
  { value: 'timeWeighted', label: 'Time-weighted mean (reports on change)' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' },
  { value: 'last', label: 'Last' },
  { value: 'median', label: 'Median' },
  { value: 'p95', label: '95th percentile' },
  { value: 'rises', label: 'Rises (starts from 0)' },
];

/** A number when it reads as one, otherwise a field name. */
const edge = (text: string): string | number =>
  text.trim() !== '' && !Number.isNaN(Number(text)) ? Number(text) : text.trim();

function useFields(spec: PulzrFieldQuerySpec): string[] {
  const { data: client } = useDatasourceClient<PulzrDatasourceClient>(spec.datasource ?? DEFAULT_DATASOURCE);
  const { data } = useQuery({
    queryKey: ['pulzr-fields', client?.url],
    queryFn: ({ signal }) => client!.fields(signal),
    enabled: client !== undefined,
    staleTime: 5 * 60_000,
  });
  return data ?? [];
}

export function PulzrFieldQueryEditor(props: OptionsEditorProps<PulzrFieldQuerySpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  const fields = useFields(value);
  const set = (patch: Partial<PulzrFieldQuerySpec>): void => onChange({ ...value, ...patch });
  const allFields = value.fields?.length ? value.fields : [value.field].filter((f): f is string => Boolean(f));
  const band = value.band;
  const bandLo = band && 'lo' in band ? String(band.lo) : '';
  const bandHi = band && 'hi' in band ? String(band.hi) : '';
  const setBand = (lo: string, hi: string): void =>
    set({ band: lo === '' && hi === '' ? undefined : ({ lo: edge(lo), hi: edge(hi) } as Band) });

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
        options={fields}
        value={allFields}
        readOnly={isReadonly}
        onChange={(_, next) => set({ field: next[0] ?? '', fields: next.length > 1 ? next : undefined })}
        renderInput={(params) => <TextField {...params} label="Fields" helperText="Each field is its own series." />}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          select
          fullWidth
          label="Aggregate"
          value={value.aggregate ?? 'mean'}
          onChange={(event) => set({ aggregate: event.target.value as Aggregate })}
          slotProps={{ input: { readOnly: isReadonly } }}
        >
          {AGGREGATES.map((a) => (
            <MenuItem key={a.value} value={a.value}>
              {a.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label="Bucket"
          placeholder="Auto"
          helperText="5m, 1h, 1d"
          value={value.interval ?? ''}
          onChange={(event) => set({ interval: event.target.value || undefined })}
          slotProps={{ input: { readOnly: isReadonly } }}
        />
      </Stack>
      <DevicesField value={value.devices} onChange={(devices) => set({ devices })} readOnly={isReadonly} />
      <Stack direction="row" spacing={2}>
        <FormControlLabel
          label="One series per device"
          control={
            <Switch
              checked={value.groupBy === 'device'}
              disabled={isReadonly}
              onChange={(_, checked) => set({ groupBy: checked ? 'device' : undefined })}
            />
          }
        />
        <FormControlLabel
          label="Carry the last value forward"
          control={
            <Switch
              checked={Boolean(value.carryForward)}
              disabled={isReadonly}
              onChange={(_, checked) => set({ carryForward: checked || undefined })}
            />
          }
        />
        <FormControlLabel
          label="Positions, for a map"
          control={
            <Switch
              checked={Boolean(value.positions)}
              disabled={isReadonly || value.groupBy !== 'device'}
              onChange={(_, checked) => set({ positions: checked || undefined })}
            />
          }
        />
      </Stack>
      <TextField
        label="Hold for"
        placeholder="2h"
        helperText="How long a reading counts as current, for carrying forward and time-weighted means."
        value={value.holdFor ?? ''}
        onChange={(event) => set({ holdFor: event.target.value || undefined })}
        slotProps={{ input: { readOnly: isReadonly } }}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="Band low"
          helperText="A field or a number"
          value={bandLo}
          onChange={(event) => setBand(event.target.value, bandHi)}
          slotProps={{ input: { readOnly: isReadonly } }}
        />
        <TextField
          fullWidth
          label="Band high"
          helperText="A field or a number"
          value={bandHi}
          onChange={(event) => setBand(bandLo, event.target.value)}
          slotProps={{ input: { readOnly: isReadonly } }}
        />
      </Stack>
    </Stack>
  );
}
