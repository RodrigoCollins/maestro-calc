import { slotFreePage } from './slot-free-page.ts';
import { mount } from '../../client/mount.ts';

// The proof entry of the second calculator (calculator-web-core › [CWC4], [CWC36]): the generic
// mount over a page module that declares no slot. It is never routed and never shipped; the
// contract walks and weighs it as it does the entry of a live page.
mount(slotFreePage);
