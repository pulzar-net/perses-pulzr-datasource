import { HTTPSettingsEditor } from '@perses-dev/plugin-system';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { PulzrDatasourceSpec } from './pulzr-datasource-types';

export const INITIAL_SPEC_DIRECT: PulzrDatasourceSpec = {
  directUrl: 'https://app.pulzr.net',
};

/** Every endpoint the plugins call, and nothing else: the proxy refuses the rest. */
export const INITIAL_SPEC_PROXY: PulzrDatasourceSpec = {
  proxy: {
    kind: 'HTTPProxy',
    spec: {
      url: 'https://app.pulzr.net',
      allowedEndpoints: [
        { endpointPattern: '/api/v1/data/query', method: 'POST' },
        { endpointPattern: '/api/v1/data/analytics', method: 'POST' },
        { endpointPattern: '/api/v1/data/devices', method: 'GET' },
        { endpointPattern: '/api/v1/data/fields', method: 'GET' },
      ],
    },
  },
};

export function PulzrDatasourceEditor(props: OptionsEditorProps<PulzrDatasourceSpec>): ReactElement {
  const { value, onChange, isReadonly } = props;
  return (
    <HTTPSettingsEditor
      value={value}
      onChange={onChange}
      isReadonly={isReadonly}
      initialSpecDirect={INITIAL_SPEC_DIRECT}
      initialSpecProxy={INITIAL_SPEC_PROXY}
    />
  );
}
