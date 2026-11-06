import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import { PulzrDatasourceSelect } from '../../components';
import type { PulzrDeviceVariableSpec } from './pulzr-device-variable-types';

export function PulzrDeviceVariableEditor(props: OptionsEditorProps<PulzrDeviceVariableSpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  return (
    <PulzrDatasourceSelect
      value={value.datasource}
      onChange={(datasource) => onChange({ ...value, datasource })}
      readOnly={isReadonly}
    />
  );
}
