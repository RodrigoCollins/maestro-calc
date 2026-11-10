import { boardFeetPage } from '../../calculator/board-feet/page.ts';
import { draw } from '../draw.ts';
import { mount } from '../mount.ts';

// The one script of the board feet page, shared by both languages. It enables the form, keeps the
// board feet, the cost and the answer in step with it and draws the face of the board; every word
// it shows comes from the page.
mount(boardFeetPage, { draw });
