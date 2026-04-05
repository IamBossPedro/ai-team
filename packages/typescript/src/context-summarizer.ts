/**
 * Context Summarizer — compresses large context histories to prevent token overflow.
 */

import type { ContextEntry, SharedContext } from "./types.js";

export interface SummarizerConfig {
  /** Maximum number of full entries to keep (most recent). Default: 3 */
  maxFullEntries: number;
  /** Maximum summary length for compressed entries. Default: 200 */
  maxSummaryLength: number;
  /** Maximum total context entries before summarization triggers. Default: 5 */
  triggerThreshold: number;
}

const DEFAULT_CONFIG: SummarizerConfig = {
  maxFullEntries: 3,
  maxSummaryLength: 200,
  triggerThreshold: 5,
};

/**
 * Summarize a context entry by truncating its summary.
 */
function compressEntry(entry: ContextEntry, maxLength: number): ContextEntry {
  return {
    ...entry,
    summary:
      entry.summary.length > maxLength
        ? entry.summary.slice(0, maxLength) + "..."
        : entry.summary,
    action: `[Summarized] ${entry.action}`,
  };
}

/**
 * Summarize the shared context history to reduce token usage.
 *
 * Keeps the most recent entries in full and compresses older ones.
 */
export function summarizeContext(
  context: SharedContext,
  config: Partial<SummarizerConfig> = {}
): SharedContext {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (context.history.length <= cfg.triggerThreshold) {
    return context;
  }

  const fullEntries = context.history.slice(-cfg.maxFullEntries);
  const olderEntries = context.history.slice(
    0,
    context.history.length - cfg.maxFullEntries
  );

  const compressed = olderEntries.map((entry) =>
    compressEntry(entry, cfg.maxSummaryLength)
  );

  return {
    ...context,
    history: [...compressed, ...fullEntries],
  };
}

/**
 * Get an estimated token count for the context.
 * Uses a rough heuristic of ~4 characters per token.
 */
export function estimateContextTokens(context: SharedContext): number {
  let chars = 0;
  for (const entry of context.history) {
    chars += entry.role.length;
    chars += entry.action.length;
    chars += entry.summary.length;
    chars += entry.timestamp.length;
    if (entry.filesChanged) {
      chars += entry.filesChanged.join(",").length;
    }
  }
  for (const [path, content] of Object.entries(context.files)) {
    chars += path.length + content.length;
  }
  chars += JSON.stringify(context.metadata).length;
  return Math.ceil(chars / 4);
}
