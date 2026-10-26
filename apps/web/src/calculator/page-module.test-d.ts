import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expectTypeOf, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { controllerOf, type Controller, type FieldView } from './controller.ts';
import type { AnyPageModule, PageModule, SelectKey, TextKey } from './page-module.ts';
import { rectangleAreaPage } from './rectangle-area/page.ts';

describe('the page-module types (calculator-web-core › Page-module contract, K10, K11)', () => {
  it('derives the text keys of concrete from its definition', () => {
    expectTypeOf<TextKey<typeof concrete>>().toEqualTypeOf<
      | 'length'
      | 'width'
      | 'thickness'
      | 'footingWidth'
      | 'footingDepth'
      | 'diameter'
      | 'height'
      | 'stepWidth'
      | 'rise'
      | 'run'
      | 'stepCount'
      | 'count'
      | 'waste'
      | 'bagPrice'
      | 'readyMixPrice'
    >();
  });

  it('derives the select keys of concrete from its definition', () => {
    expectTypeOf<SelectKey<typeof concrete>>().toEqualTypeOf<'shape' | 'bag'>();
  });

  // K11: a module in its own calculator is a module of any calculator
  it('assigns the module of each calculator to AnyPageModule', () => {
    expectTypeOf<PageModule<typeof concrete>>().toExtend<AnyPageModule>();
    expectTypeOf<PageModule<typeof rectangleArea>>().toExtend<AnyPageModule>();
  });

  // K10: the erased controller keeps the keys of its own calculator at the boundary
  it('types the fields of a controller by the keys of its own calculator', () => {
    const controller = controllerOf(rectangleAreaPage);
    expectTypeOf(controller).toEqualTypeOf<Controller<typeof rectangleArea>>();
    type Fields = ReturnType<typeof controller.start>['view']['fields'];
    expectTypeOf<keyof Fields>().toEqualTypeOf<'length' | 'width'>();
    expectTypeOf<Fields['length']>().toEqualTypeOf<FieldView>();
    const { view } = controller.start(
      { messages: {}, origin: '', path: '', switchPath: '', helps: new Set() },
      '',
    );
    // @ts-expect-error the rectangle-area page has no waste field
    expectTypeOf(view.fields.waste).toBeNever();
  });
});
