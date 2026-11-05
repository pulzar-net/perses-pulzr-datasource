import { DatasourceSelect, isVariableDatasource } from '@perses-dev/plugin-system';
import type { DatasourceSelectProps } from '@perses-dev/plugin-system';
import type { DatasourceSelector } from '@perses-dev/spec';
import type { ReactElement } from 'react';

import { DATASOURCE_KIND, DEFAULT_DATASOURCE } from '../datasources/pulzr-datasource/selector';

export interface PulzrDatasourceSelectProps {
  value?: DatasourceSelector;
  onChange: (next: DatasourceSelector) => void;
  readOnly?: boolean;
}

export function PulzrDatasourceSelect({ value, onChange, readOnly }: PulzrDatasourceSelectProps): ReactElement {
  const handleChange: DatasourceSelectProps['onChange'] = (next) => {
    if (isVariableDatasource(next) || next.kind !== DATASOURCE_KIND) {
      throw new Error(`Expected a ${DATASOURCE_KIND}`);
    }
    onChange(next);
  };
  return (
    <DatasourceSelect
      datasourcePluginKind={DATASOURCE_KIND}
      value={value ?? DEFAULT_DATASOURCE}
      onChange={handleChange}
      label="Datasource"
      readOnly={readOnly}
      notched
    />
  );
}
