import { Stack, TextField } from '@mui/material';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { PulzrDatasourceSelect } from '../../components';
import type { PulzrSqlQuerySpec } from './pulzr-sql-query-types';

export function PulzrSqlQueryEditor(props: OptionsEditorProps<PulzrSqlQuerySpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  // The query runs on blur, not on every keystroke.
  const [sql, setSql] = useState(value.sql);
  const set = (patch: Partial<PulzrSqlQuerySpec>): void => onChange({ ...value, ...patch });

  return (
    <Stack spacing={2}>
      <PulzrDatasourceSelect
        value={value.datasource}
        onChange={(datasource) => set({ datasource })}
        readOnly={isReadonly}
      />
      <TextField
        fullWidth
        multiline
        minRows={6}
        label="SQL"
        helperText="$from and $to are the dashboard's range."
        value={sql}
        onChange={(event) => setSql(event.target.value)}
        onBlur={() => sql !== value.sql && set({ sql })}
        slotProps={{ input: { readOnly: isReadonly, sx: { fontFamily: 'monospace' } } }}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="Time column"
          helperText="Empty puts every row at the end of the range."
          value={value.time ?? ''}
          onChange={(event) => set({ time: event.target.value || undefined })}
          slotProps={{ input: { readOnly: isReadonly } }}
        />
        <TextField
          fullWidth
          label="Series column"
          helperText="One series per value, such as device_name."
          value={value.series ?? ''}
          onChange={(event) => set({ series: event.target.value || undefined })}
          slotProps={{ input: { readOnly: isReadonly } }}
        />
      </Stack>
    </Stack>
  );
}
