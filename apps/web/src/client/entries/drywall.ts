import { drywallPage } from '../../calculator/drywall/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the drywall page, shared by both languages. It enables the form, keeps the
// result, the three lines and the answer in step with it and draws the plan; every word it shows
// comes from the page.
mount(drywallPage, { draw });
