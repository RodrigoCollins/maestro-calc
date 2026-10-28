// No imports: the browser suite of tooling/site-browser reads this module, and that package resolves
// none of the workspace packages a page module reaches.

/**
 * The estimated width of a character, in sizes: wide enough for the widest common fallback the
 * font stack can reach before or without Barlow Condensed (DejaVu Sans Bold, whose widest label,
 * `<0.01 cm`, averages 0.661 sizes), so the labels never meet in any of them. Barlow Condensed 600
 * itself stays under 0.42.
 */
export const CHAR = 0.67;
