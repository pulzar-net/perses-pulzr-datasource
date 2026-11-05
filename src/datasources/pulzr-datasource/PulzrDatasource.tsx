import type { DatasourcePlugin } from '@perses-dev/plugin-system';

import type { PulzrDatasourceClient, PulzrDatasourceSpec } from './pulzr-datasource-types';
import { INITIAL_SPEC_PROXY, PulzrDatasourceEditor } from './PulzrDatasourceEditor';

/** net-api's error body is `{error}`; anything else is shown as the status. */
async function failure(response: Response): Promise<Error> {
  const body = (await response.json().catch(() => undefined)) as { error?: string } | undefined;
  return new Error(body?.error ?? `Pulzr Net answered ${response.status}`);
}

const createClient: DatasourcePlugin<PulzrDatasourceSpec, PulzrDatasourceClient>['createClient'] = (spec, options) => {
  // Unset `directUrl` with no proxy is the same origin, as inside the Pulzr
  // console. The host's fetch (Perses's FetchProvider) carries its sign-in.
  const url = (spec.directUrl ?? options.proxyUrl ?? '').replace(/\/$/, '');
  const fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);

  async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await fetchFn(`${url}${path}`, {
      method,
      signal,
      headers:
        body === undefined
          ? { Accept: 'application/json' }
          : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) throw await failure(response);
    return (await response.json()) as T;
  }

  return {
    kind: 'PulzrDatasource',
    url,
    query: (body, signal) => call('POST', '/api/v1/data/query', body, signal),
    metric: (body, signal) => call('POST', '/api/v1/data/analytics', body, signal),
    devices: async (signal) =>
      (
        await call<{ result: Awaited<ReturnType<PulzrDatasourceClient['devices']>> }>(
          'GET',
          '/api/v1/data/devices',
          undefined,
          signal,
        )
      ).result,
    liveDevices: async (signal) =>
      (
        await call<{ result: Awaited<ReturnType<PulzrDatasourceClient['liveDevices']>> }>(
          'GET',
          '/api/v1/data/devices/live',
          undefined,
          signal,
        )
      ).result,
    fields: async (signal) =>
      (await call<{ result: string[] }>('GET', '/api/v1/data/fields', undefined, signal)).result,
  };
};

export const PulzrDatasource: DatasourcePlugin<PulzrDatasourceSpec, PulzrDatasourceClient> = {
  createClient,
  OptionsEditorComponent: PulzrDatasourceEditor,
  // Outside the console the API key has to stay on the Perses server.
  createInitialOptions: () => INITIAL_SPEC_PROXY,
};
