import { feetInchesPage } from '../../calculator/feet-inches/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the feet and inches page, shared by both languages. It enables the form and
// keeps the result, the answer and the bars in step with it; every word it shows comes from the page.
mount(feetInchesPage, { draw });
