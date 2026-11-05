import type { AnnotationPlugin } from '@perses-dev/plugin-system';

import { variableNames } from '../../api';
import { getAnnotationData } from './get-annotation-data';
import type { PulzrChangeAnnotationSpec } from './pulzr-change-annotation-types';
import { PulzrChangeAnnotationEditor } from './PulzrChangeAnnotationEditor';

export const PulzrChangeAnnotation: AnnotationPlugin<PulzrChangeAnnotationSpec> = {
  getAnnotationData,
  OptionsEditorComponent: PulzrChangeAnnotationEditor,
  createInitialOptions: () => ({ fields: [] }),
  dependsOn: (spec) => ({ variables: variableNames(spec.devices) }),
};
