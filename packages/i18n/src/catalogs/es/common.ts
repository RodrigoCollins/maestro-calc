import type { CatalogOf } from '../../translate.ts';
import type { enCommon } from '../en/common.ts';

/** Shared messages, Spanish (neutral, tú): the same keys as English, checked at compile time. */
export const esCommon = {
  'errors.EMPTY': 'Ingresa un valor.',
  'errors.MALFORMED': 'Este valor no es válido.',
  'errors.DECIMAL_COMMA':
    'Usa punto para los decimales y no uses separador de miles (por ejemplo 1250.5).',
  'errors.ZERO_DENOMINATOR': 'Una fracción no puede tener cero como denominador.',
  'errors.UNKNOWN_UNIT': 'Unidad no reconocida. Usa ft, in, yd, m, cm o mm.',
  'errors.TOO_LONG': 'El valor es demasiado largo.',
  'errors.TOO_LARGE': 'El número es demasiado grande.',
  'errors.BELOW_MIN': 'El valor debe ser al menos {min}.',
  'errors.ABOVE_MAX': 'El valor debe ser como máximo {max}.',
  'errors.UNKNOWN_OPTION': 'Elige una de las opciones disponibles.',
  'errors.INVALID_VALUE':
    'Un valor del enlace no era válido y se reemplazó por el valor predeterminado.',
  'errors.UNSUPPORTED_VERSION':
    'Este enlace usa una versión no compatible, por lo que se usaron los valores predeterminados.',
} as const satisfies CatalogOf<typeof enCommon>;
