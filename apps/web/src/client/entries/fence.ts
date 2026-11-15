import { fencePage } from '../../calculator/fence/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the fence page, shared by both languages. It enables the form, keeps the
// result, the four lines and the answer in step with it and draws the face of the run; every word
// it shows comes from the page.
mount(fencePage, { draw });
