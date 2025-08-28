import type { LogLevel } from 'shared/types/CommonTypes';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  debug(message: string, ...data: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...data);
    }
    this.addToHistory('debug', message, data);
  }

  info(message: string, ...data: unknown[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...data);
    }
    this.addToHistory('info', message, data);
  }

  warn(message: string, ...data: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...data);
    this.addToHistory('warn', message, data);
  }

  error(message: string, error?: Error | unknown, ...data: unknown[]): void {
    const errorMessage = `[ERROR] ${message}`;

    if (error instanceof Error) {
      console.error(errorMessage, error, ...data);
    } else if (error) {
      console.error(errorMessage, error, ...data);
    } else {
      console.error(errorMessage, ...data);
    }

    const logEntry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      data: data.length > 0 ? data : undefined,
    };

    if (error instanceof Error) {
      logEntry.stack = error.stack;
    }

    this.logHistory.unshift(logEntry);
    this.trimHistory();

    if (this.isProduction) {
      this.reportToExternalService(message, error, data);
    }
  }

  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupCollapsed(label: string): void {
    if (this.isDevelopment) {
      console.groupCollapsed(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  table(data: unknown): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }

  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  clear(): void {
    if (this.isDevelopment) {
      console.clear();
    }
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }

  private addToHistory(level: LogLevel, message: string, data?: unknown[]): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: data && data.length > 0 ? data : undefined,
    };

    this.logHistory.unshift(entry);
    this.trimHistory();
  }

  private trimHistory(): void {
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(0, this.maxHistorySize);
    }
  }

  private reportToExternalService(message: string, error?: Error | unknown, data?: unknown[]): void {
    try {
      const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
      errors.push({
        message,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      if (errors.length > 50) {
        errors.shift();
      }

      sessionStorage.setItem('app_errors', JSON.stringify(errors));
    } catch { }
  }
}

const logger = new Logger();

export { logger as default, Logger };

if (import.meta.env.DEV) {
  (window as unknown as { logger: Logger }).logger = logger;
}