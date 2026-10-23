import { describe, expect, it } from 'vitest';
import { enCommon } from './catalogs/en/common.ts';
import { enRectangleArea } from './catalogs/en/rectangle-area.ts';
import { esCommon } from './catalogs/es/common.ts';
import { esRectangleArea } from './catalogs/es/rectangle-area.ts';
import { createTranslator, placeholdersOf } from './translate.ts';

const en = createTranslator({ ...enCommon, ...enRectangleArea });
const es = createTranslator({ ...esCommon, ...esRectangleArea });

// The twelve user-facing error codes of core (ALL_ERROR_CODES), in the order of the catalogs.
const ERROR_CODES = [
  'EMPTY',
  'MALFORMED',
  'DECIMAL_COMMA',
  'ZERO_DENOMINATOR',
  'UNKNOWN_UNIT',
  'TOO_LONG',
  'TOO_LARGE',
  'BELOW_MIN',
  'ABOVE_MAX',
  'UNKNOWN_OPTION',
  'INVALID_VALUE',
  'UNSUPPORTED_VERSION',
] as const;

describe('rectangle-area labels (i18n-catalog › Exact labels)', () => {
  // spec: Exact labels [IN6]
  it('resolves the six calculator labels in English and Spanish', () => {
    expect([
      en('calc.rectangle-area.title'),
      en('calc.rectangle-area.inputs.length'),
      en('calc.rectangle-area.inputs.width'),
      en('calc.rectangle-area.outputs.areaFt2'),
      en('calc.rectangle-area.outputs.areaYd2'),
      en('calc.rectangle-area.outputs.areaM2'),
    ]).toEqual([
      'Rectangle Area',
      'Length',
      'Width',
      'Area (square feet)',
      'Area (square yards)',
      'Area (square meters)',
    ]);
    expect([
      es('calc.rectangle-area.title'),
      es('calc.rectangle-area.inputs.length'),
      es('calc.rectangle-area.inputs.width'),
      es('calc.rectangle-area.outputs.areaFt2'),
      es('calc.rectangle-area.outputs.areaYd2'),
      es('calc.rectangle-area.outputs.areaM2'),
    ]).toEqual([
      'Área de un rectángulo',
      'Largo',
      'Ancho',
      'Área (pies cuadrados)',
      'Área (yardas cuadradas)',
      'Área (metros cuadrados)',
    ]);
  });

  it('holds no other key in the calculator module', () => {
    expect(Object.keys(enRectangleArea)).toHaveLength(6);
    expect(Object.keys(esRectangleArea)).toHaveLength(6);
  });
});

describe('common error messages (i18n-catalog › Key naming convention)', () => {
  it('has exactly the twelve errors.<CODE> keys', () => {
    const expected = ERROR_CODES.map((code) => `errors.${code}`);
    expect(Object.keys(enCommon)).toEqual(expected);
    expect(Object.keys(esCommon)).toEqual(expected);
  });

  // spec: Exact labels [IN6] and the authored messages of task 12.9
  it('says exactly the English messages', () => {
    expect(ERROR_CODES.map((code) => en(`errors.${code}`, { min: '{min}', max: '{max}' }))).toEqual(
      [
        'Enter a value.',
        'This value is not valid.',
        'Use a period for decimals and no thousands separator (for example 1250.5).',
        'A fraction cannot have zero as its denominator.',
        'Unit not recognized. Use ft, in, yd, m, cm, or mm.',
        'The value is too long.',
        'The number is too large.',
        'The value must be at least {min}.',
        'The value must be at most {max}.',
        'Choose one of the available options.',
        'A value in the link was not valid and was replaced by the default.',
        'This link uses an unsupported version, so default values were used.',
      ],
    );
  });

  it('says exactly the Spanish messages', () => {
    expect(ERROR_CODES.map((code) => es(`errors.${code}`, { min: '{min}', max: '{max}' }))).toEqual(
      [
        'Ingresa un valor.',
        'Este valor no es válido.',
        'Usa punto para los decimales y no uses separador de miles (por ejemplo 1250.5).',
        'Una fracción no puede tener cero como denominador.',
        'Unidad no reconocida. Usa ft, in, yd, m, cm o mm.',
        'El valor es demasiado largo.',
        'El número es demasiado grande.',
        'El valor debe ser al menos {min}.',
        'El valor debe ser como máximo {max}.',
        'Elige una de las opciones disponibles.',
        'Un valor del enlace no era válido y se reemplazó por el valor predeterminado.',
        'Este enlace usa una versión no compatible, por lo que se usaron los valores predeterminados.',
      ],
    );
  });

  // docs/design/direction.md (approved by the product owner): "Spanish UI copy: neutral Spanish (tú)".
  // The formal usted imperatives (Ingrese, Use, Elija) are what the first draft said.
  it('addresses the reader as tú: no formal usted imperative in any Spanish message', () => {
    const formal = /\b(ingrese|use|utilice|elija|seleccione|escriba|introduzca|verifique)\b/i;
    const messages = [...Object.values(esCommon), ...Object.values(esRectangleArea)];
    expect(messages.filter((message) => formal.test(message))).toEqual([]);
    expect(formal.test('Ingrese un valor.')).toBe(true);
    expect(formal.test('Ingresa un valor.')).toBe(false);
  });

  // spec: Key naming convention: only {min} in BELOW_MIN and {max} in ABOVE_MAX
  it('has {min} in BELOW_MIN, {max} in ABOVE_MAX and no placeholder anywhere else', () => {
    for (const module of [enCommon, esCommon]) {
      const placeholders = Object.fromEntries(
        Object.entries(module).map(([key, message]) => [key, placeholdersOf(message)]),
      );
      expect(placeholders['errors.BELOW_MIN']).toEqual(['min']);
      expect(placeholders['errors.ABOVE_MAX']).toEqual(['max']);
      const others = Object.entries(placeholders).filter(
        ([key]) => key !== 'errors.BELOW_MIN' && key !== 'errors.ABOVE_MAX',
      );
      expect(others).toHaveLength(10);
      expect(others.filter(([, names]) => names.length > 0)).toEqual([]);
    }
  });
});
