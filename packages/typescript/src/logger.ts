/**
 * Structured Logger — pipeline execution logging with configurable levels.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  event: string;
  data?: Record<string, unknown>;
}

export interface LoggerConfig {
  level: LogLevel;
  /** Custom log handler. Defaults to console. */
  handler?: (entry: LogEntry) => void;
  /** Include timestamps. Default: true */
  timestamps?: boolean;
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.SILENT]: "SILENT",
};

export class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      handler: config.handler,
      timestamps: config.timestamps ?? true,
    };
  }

  debug(event: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, event, data);
  }

  info(event: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, event, data);
  }

  warn(event: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, event, data);
  }

  error(event: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, event, data);
  }

  /**
   * Get all log entries.
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all log entries.
   */
  clear(): void {
    this.entries = [];
  }

  // --- Pipeline-specific convenience methods ---

  pipelineStart(pipelineName: string, taskId: string): void {
    this.info("pipeline.start", { pipeline: pipelineName, taskId });
  }

  pipelineEnd(pipelineName: string, taskId: string, stagesCompleted: number): void {
    this.info("pipeline.end", { pipeline: pipelineName, taskId, stagesCompleted });
  }

  stageStart(role: string, action: string, taskId: string): void {
    this.debug("stage.start", { role, action, taskId });
  }

  stageEnd(role: string, action: string, taskId: string, durationMs: number): void {
    this.info("stage.end", { role, action, taskId, durationMs });
  }

  handoff(fromRole: string, toRole: string, reason: string): void {
    this.info("handoff", { fromRole, toRole, reason });
  }

  stageError(role: string, action: string, error: string): void {
    this.error("stage.error", { role, action, error });
  }

  private log(
    level: LogLevel,
    event: string,
    data?: Record<string, unknown>
  ): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      timestamp: this.config.timestamps
        ? new Date().toISOString()
        : "",
      event,
      data,
    };

    this.entries.push(entry);

    if (this.config.handler) {
      this.config.handler(entry);
    } else {
      this.defaultHandler(entry);
    }
  }

  private defaultHandler(entry: LogEntry): void {
    const label = LEVEL_LABELS[entry.level];
    const ts = entry.timestamp ? `[${entry.timestamp}] ` : "";
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : "";

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${ts}[${label}] ${entry.event}${dataStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`${ts}[${label}] ${entry.event}${dataStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`${ts}[${label}] ${entry.event}${dataStr}`);
        break;
      default:
        console.log(`${ts}[${label}] ${entry.event}${dataStr}`);
    }
  }
}
