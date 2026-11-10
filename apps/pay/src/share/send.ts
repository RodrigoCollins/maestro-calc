/** The part of `navigator` the copy and share button uses; either can be missing. */
export interface Sender {
  readonly clipboard?: { writeText(text: string): Promise<void> };
  readonly share?: (data: { text: string }) => Promise<void>;
}

/** What happened: the text is on the clipboard, and the share sheet sent it somewhere. */
export interface Sent {
  readonly copied: boolean;
  readonly shared: boolean;
}

/** Whether the browser has a share sheet (`navigator.share`: phones, some desktops). */
export const canShare = (sender: Sender): boolean => typeof sender.share === 'function';

/** Waits for a call that may be missing, may reject and may have thrown at once. */
const settled = async (start: () => Promise<void> | undefined): Promise<boolean> => {
  try {
    const running = start();
    if (running === undefined) return false;
    await running;
    return true;
  } catch {
    return false;
  }
};

/**
 * Copies `text` and, where the browser has one, opens the share sheet with it. Both start before
 * the first `await`, so both run inside the click's user activation. Never rejects.
 */
export const sendText = async (sender: Sender, text: string): Promise<Sent> => {
  const copying = settled(() => sender.clipboard?.writeText(text));
  const sharing = settled(() => (canShare(sender) ? sender.share?.({ text }) : undefined));
  return { copied: await copying, shared: await sharing };
};
