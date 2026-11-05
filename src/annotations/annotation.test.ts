import type { AnnotationContext } from '@perses-dev/plugin-system';

import { PulzrChangeAnnotation } from './pulzr-change-annotation';

it('marks each change, named by the states it moved between', async () => {
  const query = vi.fn().mockResolvedValue({
    series: [],
    keys: [],
    changes: [{ t: '2026-11-05T00:10:00+00:00', bucket: '', field: 'rcp.stage', series: 'Shed 1', from: 1, to: 2 }],
  });
  const context = {
    absoluteTimeRange: { start: new Date('2026-11-05T00:00:00Z'), end: new Date('2026-11-05T01:00:00Z') },
    variableState: {},
    datasourceStore: { getDatasourceClient: async () => ({ query }) },
  } as unknown as AnnotationContext;
  const marks = await PulzrChangeAnnotation.getAnnotationData(
    {
      fields: ['rcp.stage'],
      states: [
        { value: 1, label: 'Stage 1' },
        { value: 2, label: 'Stage 2' },
      ],
    },
    context,
  );
  expect(query.mock.calls[0]![0].query.annotate).toEqual(['rcp.stage']);
  expect(marks).toEqual([
    {
      start: Date.parse('2026-11-05T00:10:00Z'),
      title: 'rcp.stage: Stage 1 to Stage 2',
      legend: 'Shed 1',
      tags: { field: 'rcp.stage', device: 'Shed 1' },
    },
  ]);
});
