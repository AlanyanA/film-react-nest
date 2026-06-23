import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  formatMessage(
    level: string,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    const fields: Record<string, string> = {
      timestamp: new Date().toISOString(),
      level,
      message: this.serialize(message),
    };

    if (optionalParams.length > 0) {
      fields.optionalParams = this.serialize(optionalParams);
    }

    return Object.entries(fields)
      .map(([key, value]) => `${key}=${this.escape(value)}`)
      .join('\t');
  }

  private serialize(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === undefined) return '';
    return JSON.stringify(value);
  }

  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n');
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    console.log(this.formatMessage('verbose', message, ...optionalParams));
  }
}
