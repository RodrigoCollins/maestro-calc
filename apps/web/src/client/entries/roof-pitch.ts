import { roofPitchPage } from '../../calculator/roof-pitch/page.ts';
import { mount } from '../mount.ts';

// The one script of the roof pitch page, shared by both languages. It enables the form and keeps
// the result and the answer, with its IRC check, in step with it; every word comes from the page.
mount(roofPitchPage);
