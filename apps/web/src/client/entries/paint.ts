import { paintPage } from '../../calculator/paint/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the paint page, shared by both languages. It enables the form, keeps the
// result, the can line and the answer in step with it and draws the plan; every word it shows comes
// from the page.
mount(paintPage, { draw });
