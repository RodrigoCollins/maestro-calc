import { rectangleAreaPage } from '../../calculator/rectangle-area/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the square footage page, shared by both languages. It enables the form, keeps
// the result and the answer in step with it and draws the plan; every word it shows comes from the
// page.
mount(rectangleAreaPage, { draw });
