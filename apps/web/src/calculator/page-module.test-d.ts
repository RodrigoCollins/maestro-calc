import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expectTypeOf, it } from 'vitest';
import { countCalculator } from '../__testing__/page-fixtures.ts';
import { concrete } from '../lib/concrete.ts';
import { controllerOf, type Controller, type FieldView } from './controller.ts';
import {
  definePage,
  type AnyPageModule,
  type DrawingSlot,
  type Frame,
  type PageModule,
  type Ready,
  type SelectKey,
  type TextKey,
} from './page-module.ts';
import { rectangleAreaPage } from './rectangle-area/page.ts';
import type { Plan } from './slots/drawing.ts';

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

  // a primary per option names a select of the calculator, its options and its outputs only
  it('types the primary of each option by the select, its options and the outputs', () => {
    const primary = { imperial: 'total', metric: 'total' } as const;
    const pieces = { imperial: 'pieces', metric: 'pieces' } as const;
    definePage({
      calculator: countCalculator,
      primary: { ...primary, by: { select: 'mode', options: { count: pieces } } },
    });
    definePage({
      calculator: countCalculator,
      // @ts-expect-error `qty` is a count, not a select
      primary: { ...primary, by: { select: 'qty', options: { count: pieces } } },
    });
    definePage({
      calculator: countCalculator,
      // @ts-expect-error `huge` is not an option of `mode`
      primary: { ...primary, by: { select: 'mode', options: { huge: pieces } } },
    });
    definePage({
      calculator: countCalculator,
      primary: {
        ...primary,
        // @ts-expect-error `nope` is not an output
        by: { select: 'mode', options: { count: { imperial: 'nope', metric: 'pieces' } } },
      },
    });
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

  // spec: calculator-web-core › Page-module contract, the drawing row: a frame and a plan per ready moment
  it('declares the drawing slot as a frame, its messages and a plan of a ready moment, or none', () => {
    expectTypeOf<DrawingSlot<typeof rectangleArea>['frame']>().toEqualTypeOf<Frame>();
    expectTypeOf<Frame>().toEqualTypeOf<{ readonly width: number; readonly height: number }>();
    expectTypeOf<DrawingSlot<typeof rectangleArea>['messages']>().toEqualTypeOf<
      readonly string[]
    >();
    expectTypeOf<DrawingSlot<typeof rectangleArea>['plan']>().toEqualTypeOf<
      (moment: Ready<typeof rectangleArea>) => Plan | null
    >();
    expectTypeOf<PageModule<typeof rectangleArea>['drawing']>().toEqualTypeOf<
      DrawingSlot<typeof rectangleArea> | undefined
    >();
  });
});
