/** How many pages of its family a long-tail page links: its nearest ones, so pages stay distinct. */
export const NEIGHBORS = 6;

/** The `NEIGHBORS` members nearest to `member` in their order, `member` left out. */
export const nearestOf = <T>(members: readonly T[], member: T): readonly T[] => {
  const index = members.indexOf(member);
  const start = Math.max(0, Math.min(index - NEIGHBORS / 2, members.length - NEIGHBORS - 1));
  return members.slice(start, start + NEIGHBORS + 1).filter((other) => other !== member);
};
