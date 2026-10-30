import { roofingPage } from '../../calculator/roofing/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the roofing page, shared by both languages. It enables the form and keeps the
// result, the materials, the answer with its IRC check and the plan in step with it; every word
// comes from the page.
mount(roofingPage, { draw });
