/**
 * Structured Logger
 * 
 * In production, this forwards logs to Sentry and avoids console.log
 * to prevent leaking sensitive information in production environments.
 */

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      env: process.env.NODE_ENV,
      ...context,
    });
  }

  info(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context || '');
    } else {
      // In production, we'd send structured logs to a service like Datadog/Pino
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, context || '');
    } else {
      Sentry.captureMessage(message, { level: 'warning', extra: context });
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: any, context?: LogContext) {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error || '', context || '');
    } else {
      Sentry.captureException(error || new Error(message), { extra: context });
      console.error(this.formatMessage('error', message, { ...context, error: errorDetails }));
    }
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log critical emergency events
   */
  critical(message: string, context?: LogContext) {
    Sentry.captureMessage(`CRITICAL: ${message}`, { level: 'fatal', extra: context });
    console.error(this.formatMessage('error', `CRITICAL: ${message}`, context));
  }
}

export const logger = new Logger();
