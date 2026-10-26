/** The ids that tie a field to its parts, shared by the markup and the script. */
export const inputId = (key: string): string => `calc-${key}`;
export const hintId = (key: string): string => `${inputId(key)}-hint`;
export const helpId = (key: string): string => `${inputId(key)}-help`;
export const errorId = (key: string): string => `${inputId(key)}-error`;
/** The label element of a choice group (`calc-shape-label`). */
export const labelId = (key: string): string => `${inputId(key)}-label`;
