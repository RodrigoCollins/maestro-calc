import { topsoilPage } from '../../calculator/topsoil/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the topsoil page, shared by both languages. It enables the form, keeps the
// result, the bag line and the answer in step with it and draws the plan; every word it shows comes
// from the page.
mount(topsoilPage, { draw });
