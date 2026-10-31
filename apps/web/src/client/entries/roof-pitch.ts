import { roofPitchPage } from '../../calculator/roof-pitch/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the roof pitch page, shared by both languages. It enables the form and keeps
// the result, the answer, with its IRC check, and the slope drawing in step with it; every word
// comes from the page.
mount(roofPitchPage, { draw });
