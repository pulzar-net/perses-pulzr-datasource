import { PulzrDatasource } from './pulzr-datasource';

it("uses the host's fetch, so the host's sign-in rides along", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: ['battery'] })));
  const client = PulzrDatasource.createClient({ directUrl: 'https://app.pulzr.net/' }, { fetch });
  expect(await client.fields()).toEqual(['battery']);
  expect(fetch.mock.calls[0]![0]).toBe('https://app.pulzr.net/api/v1/data/fields');
});

it("reports net-api's error message", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ error: 'Malformed DevEUI: x' }), { status: 400 }));
  const client = PulzrDatasource.createClient({}, { proxyUrl: '/proxy/globaldatasources/pulzr', fetch });
  await expect(client.query({ query: {}, timeRange: { from: '', to: '' } })).rejects.toThrow('Malformed DevEUI: x');
  expect(fetch.mock.calls[0]![0]).toBe('/proxy/globaldatasources/pulzr/api/v1/data/query');
});
