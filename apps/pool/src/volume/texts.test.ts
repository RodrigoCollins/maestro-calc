import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { describe, expect, it } from 'vitest';
import { VOLUME_TEXTS } from './texts.ts';

describe('pool volume texts', () => {
  it('labels every input of the engine, in its order, and every shape it offers', () => {
    expect(Object.keys(VOLUME_TEXTS.fields)).toEqual(poolVolume.inputs.map(({ key }) => key));
    const shape = poolVolume.inputs.find(({ key }) => key === 'shape');
    expect(shape?.kind === 'select' && shape.options).toEqual(
      Object.keys(VOLUME_TEXTS.fields.shape.options),
    );
  });

  it('labels every output after the leading figure', () => {
    expect(Object.keys(VOLUME_TEXTS.rows)).toEqual(
      poolVolume.outputs.slice(1).map(({ key }) => key),
    );
  });

  it('keeps the title and the description short', () => {
    expect(VOLUME_TEXTS.title.length).toBeLessThanOrEqual(70);
    expect(VOLUME_TEXTS.description.length).toBeLessThanOrEqual(160);
  });
});
