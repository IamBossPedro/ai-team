import { describe, it, expect, vi } from "vitest";
import { Logger, LogLevel } from "../src/logger.js";

describe("Logger", () => {
  it("logs at INFO level by default", () => {
    const entries: any[] = [];
    const logger = new Logger({
      handler: (entry) => entries.push(entry),
    });

    logger.debug("debug msg");
    logger.info("info msg");
    logger.warn("warn msg");
    logger.error("error msg");

    // DEBUG should be filtered out at INFO level
    expect(entries).toHaveLength(3);
    expect(entries[0].event).toBe("info msg");
    expect(entries[1].event).toBe("warn msg");
    expect(entries[2].event).toBe("error msg");
  });

  it("respects custom log level", () => {
    const entries: any[] = [];
    const logger = new Logger({
      level: LogLevel.ERROR,
      handler: (entry) => entries.push(entry),
    });

    logger.info("should not appear");
    logger.warn("should not appear");
    logger.error("should appear");

    expect(entries).toHaveLength(1);
  });

  it("stores entries for retrieval", () => {
    const logger = new Logger({
      handler: () => {},
    });

    logger.info("test1");
    logger.info("test2");

    const entries = logger.getEntries();
    expect(entries).toHaveLength(2);
  });

  it("clears entries", () => {
    const logger = new Logger({ handler: () => {} });
    logger.info("test");
    logger.clear();
    expect(logger.getEntries()).toHaveLength(0);
  });

  it("logs pipeline events", () => {
    const entries: any[] = [];
    const logger = new Logger({
      level: LogLevel.DEBUG,
      handler: (entry) => entries.push(entry),
    });

    logger.pipelineStart("Backend Feature", "TASK-001");
    logger.stageStart("backend-developer", "implement", "TASK-001");
    logger.stageEnd("backend-developer", "implement", "TASK-001", 1500);
    logger.pipelineEnd("Backend Feature", "TASK-001", 3);

    expect(entries).toHaveLength(4);
    expect(entries[0].event).toBe("pipeline.start");
    expect(entries[0].data?.pipeline).toBe("Backend Feature");
  });

  it("includes timestamps by default", () => {
    const entries: any[] = [];
    const logger = new Logger({ handler: (entry) => entries.push(entry) });
    logger.info("test");
    expect(entries[0].timestamp).toBeTruthy();
  });

  it("can disable timestamps", () => {
    const entries: any[] = [];
    const logger = new Logger({
      handler: (entry) => entries.push(entry),
      timestamps: false,
    });
    logger.info("test");
    expect(entries[0].timestamp).toBe("");
  });
});
