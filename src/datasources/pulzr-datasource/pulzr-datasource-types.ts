import type { DatasourceClient } from '@perses-dev/plugin-system';
import type { HTTPProxy } from '@perses-dev/spec';

import type { DeviceSummary, LiveDevice, MetricQuery, MetricResponse, QueryResponse } from '../../api';

/**
 * Where Pulzr Net is. `directUrl` is fetched from the browser, which is how the
 * Pulzr console uses it: same origin, signed in. `proxy` sends every request
 * through the Perses server, which adds the API key from a secret, so a key
 * never reaches the browser of whoever views the dashboard.
 */
export interface PulzrDatasourceSpec {
  directUrl?: string;
  proxy?: HTTPProxy;
}

export interface PulzrDatasourceClient extends DatasourceClient {
  kind: 'PulzrDatasource';
  url: string;
  query(
    body: { query: unknown; timeRange: { from: string; to: string }; latest?: boolean },
    signal?: AbortSignal,
  ): Promise<QueryResponse>;
  metric(
    body: MetricQuery & { timeRange: { from: string; to: string } },
    signal?: AbortSignal,
  ): Promise<MetricResponse>;
  devices(signal?: AbortSignal): Promise<DeviceSummary[]>;
  liveDevices(signal?: AbortSignal): Promise<LiveDevice[]>;
  fields(signal?: AbortSignal): Promise<string[]>;
}
