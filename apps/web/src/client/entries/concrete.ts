import { concretePage } from '../../calculator/concrete/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the concrete calculator page, shared by both languages. It enables the form,
// keeps the result in step with it and draws the plan of the shape; every word it shows comes from
// the page (design C10).
mount(concretePage, { draw });
