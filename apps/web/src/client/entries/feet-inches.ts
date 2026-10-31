import { feetInchesPage } from '../../calculator/feet-inches/page.ts';
import { mount } from '../mount.ts';

// The one script of the feet and inches page, shared by both languages. It enables the form and
// keeps the result and the answer in step with it; every word it shows comes from the page.
mount(feetInchesPage);
