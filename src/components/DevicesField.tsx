import { TextField } from '@mui/material';
import type { ReactElement } from 'react';

export interface DevicesFieldProps {
  value?: string | string[];
  onChange: (next: string | string[] | undefined) => void;
  readOnly?: boolean;
}

/** A variable (`$device`) or DevEUIs, comma separated. Empty is every device. */
export function DevicesField({ value, onChange, readOnly }: DevicesFieldProps): ReactElement {
  const text = Array.isArray(value) ? value.join(', ') : (value ?? '');
  return (
    <TextField
      fullWidth
      label="Devices"
      placeholder="$device, or DevEUIs"
      helperText="Empty is every device."
      value={text}
      onChange={(event) => {
        const next = event.target.value.trim();
        if (next === '') onChange(undefined);
        else if (next.startsWith('$')) onChange(next);
        else
          onChange(
            next
              .split(',')
              .map((eui) => eui.trim())
              .filter(Boolean),
          );
      }}
      slotProps={{ input: { readOnly } }}
    />
  );
}
