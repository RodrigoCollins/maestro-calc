interface Violation {
  readonly id: string;
  readonly help: string;
  readonly nodes: readonly { readonly target: readonly unknown[] }[];
}

/** One line per violated rule, naming the page, the rule id and the first element it hit. */
export const formatViolations = (page: string, violations: readonly Violation[]): string =>
  violations
    .map(({ id, help, nodes }) => `${page}: ${id} (${help}) on ${String(nodes[0]?.target[0])}`)
    .join('\n');
