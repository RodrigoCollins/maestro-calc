import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { fromRoot } from '../contract/root.ts';

/**
 * Parses JSONC (comments and trailing commas allowed) with the TypeScript parser, so no JSONC
 * dependency is added. The value is `unknown`: callers narrow what they read.
 */
export const parseJsonc = (text: string): unknown => {
  const result: { config?: unknown; error?: ts.Diagnostic } = ts.parseConfigFileTextToJson(
    'file.jsonc',
    text,
  );
  if (result.error !== undefined) {
    throw new Error(ts.flattenDiagnosticMessageText(result.error.messageText, '\n'));
  }
  return result.config;
};

/** Reads a JSONC file by path relative to the repository root. */
export const readJsonc = (relativePath: string): unknown =>
  parseJsonc(readFileSync(fromRoot(relativePath), 'utf8'));
