# Pulzr Net plugins for Perses

Sensor readings from [Pulzr Net](https://app.pulzr.net) on [Perses](https://perses.dev) dashboards: the same data, aggregates and analytics the Pulzr console draws, in your own Perses.

| Plugin | Kind | What it does |
|---|---|---|
| `PulzrDatasource` | Datasource | Where Pulzr Net is, and how requests reach it |
| `PulzrFieldQuery` | TimeSeriesQuery | Decoded fields, bucketed and aggregated (mean, time-weighted mean, min, max, p95, rises, …), with an optional target band |
| `PulzrSqlQuery` | TimeSeriesQuery | A read-only SQL SELECT over your readings, `$from` and `$to` set to the dashboard's range |
| `PulzrMetricQuery` | TimeSeriesQuery | Occupancy rate, turnover, dwell and sensors reporting |
| `PulzrChangeAnnotation` | Annotation | Marks every change of up to four fields, such as a recipe stage or a mode |
| `PulzrDeviceVariable` | Variable | The devices heard in the last 30 days, by name |

Every request is made as the API key or signed-in user behind it, with the same organization, application and retention limits as the Pulzr console.

## Use it in Perses

1. In Pulzr Net, open **API keys** and create a key with **Data: Read** and **Devices: Read**, limited to the applications the dashboards should see.
2. Put the plugin archive (`Pulzr-<version>.tar.gz`, from this repository's releases) in a folder listed in the Perses server's `plugin.archive_paths`.
3. Store the key as a Perses secret:

   ```yaml
   kind: GlobalSecret
   metadata:
     name: pulzr-api-key
   spec:
     authorization:
       type: Bearer
       credentials: pzk_…
   ```

4. Add the datasource. The Perses server calls Pulzr Net and adds the key, so it never reaches a viewer's browser:

   ```yaml
   kind: GlobalDatasource
   metadata:
     name: pulzr
   spec:
     default: true
     plugin:
       kind: PulzrDatasource
       spec:
         proxy:
           kind: HTTPProxy
           spec:
             url: https://app.pulzr.net
             secret: pulzr-api-key
             allowedEndpoints:
               - { endpointPattern: /api/v1/data/query, method: POST }
               - { endpointPattern: /api/v1/data/analytics, method: POST }
               - { endpointPattern: /api/v1/data/devices, method: GET }
               - { endpointPattern: /api/v1/data/fields, method: GET }
   ```

A panel query looks like this:

```yaml
kind: TimeSeriesQuery
spec:
  plugin:
    kind: PulzrFieldQuery
    spec:
      field: temperature
      aggregate: timeWeighted
      interval: 15m
      devices: $device
```

`devices` is DevEUIs or a variable holding them; empty is every device. The schemas in `schemas/` are the full specification of each plugin.

## Embed it in a React app

The package also exports every plugin for apps that embed Perses directly, as the Pulzr console does:

```bash
npm install @pulzr/perses-plugin
```

```tsx
import * as pulzr from '@pulzr/perses-plugin';

const pluginLoader = dynamicImportPluginLoader([
  { resource: pulzr.getPluginModule(), importPlugin: async () => pulzr },
]);
```

With `directUrl` the browser calls Pulzr Net itself, through the `fetch` from Perses's `FetchProvider`. Wrap the dashboard in a `FetchProvider` that adds your sign-in to each request.

## Development

Node.js 24 or later, npm 11 or later, and [`percli`](https://perses.dev/perses/docs/cli/).

```bash
npm install
npm test                     # unit tests
percli plugin test-schemas   # CUE schema tests
percli plugin lint
npm run build                # the npm package and module-federation bundle, in dist/
percli plugin build          # the archive a Perses server installs
```

## License

Apache 2.0
