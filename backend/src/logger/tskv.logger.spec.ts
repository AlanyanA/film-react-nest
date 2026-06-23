import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('должен возвращать поля, разделённые табуляцией, в формате key=value', () => {
      const formatted = logger.formatMessage('log', 'hello');
      const fields = formatted.split('\t');

      expect(fields).toContain('level=log');
      expect(fields).toContain('message=hello');
    });

    it('должен включать поле timestamp в формате ISO 8601', () => {
      const formatted = logger.formatMessage('log', 'msg');

      expect(formatted).toMatch(
        /timestamp=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });

    it('должен экранировать символ табуляции внутри значения', () => {
      const formatted = logger.formatMessage('log', 'before\tafter');

      expect(formatted).toContain('message=before\\tafter');
      expect(formatted.split('\t').length).toBe(3);
    });

    it('должен экранировать символ переноса строки внутри значения', () => {
      const formatted = logger.formatMessage('log', 'line1\nline2');

      expect(formatted).toContain('message=line1\\nline2');
      expect(formatted).not.toContain('\n');
    });

    it('должен сериализовывать нестроковые значения через JSON', () => {
      const formatted = logger.formatMessage('log', { key: 'value', n: 42 });

      expect(formatted).toContain('message={"key":"value","n":42}');
    });

    it('должен добавлять поле optionalParams, если они переданы', () => {
      const formatted = logger.formatMessage('log', 'msg', 'ContextName');

      expect(formatted).toContain('optionalParams=["ContextName"]');
    });

    it('не должен добавлять поле optionalParams, если они не переданы', () => {
      const formatted = logger.formatMessage('log', 'msg');

      expect(formatted).not.toContain('optionalParams=');
    });
  });

  describe('методы логгера', () => {
    it('log() должен вызывать console.log с TSKV-строкой', () => {
      logger.log('hello');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('level=log');
      expect(logSpy.mock.calls[0][0]).toContain('message=hello');
    });

    it('error() должен вызывать console.error с уровнем error', () => {
      logger.error('boom');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('level=error');
      expect(errorSpy.mock.calls[0][0]).toContain('message=boom');
    });

    it('warn() должен вызывать console.warn с уровнем warn', () => {
      logger.warn('careful');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('level=warn');
    });

    it('debug() должен вызывать console.debug с уровнем debug', () => {
      logger.debug('details');

      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy.mock.calls[0][0]).toContain('level=debug');
    });

    it('verbose() должен вызывать console.log с уровнем verbose', () => {
      logger.verbose('trace');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain('level=verbose');
    });
  });
});
