import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatMessage', () => {
    it('должен возвращать валидный JSON с полями level и message', () => {
      const formatted = logger.formatMessage('log', 'hello world');
      const parsed = JSON.parse(formatted);

      expect(parsed.level).toBe('log');
      expect(parsed.message).toBe('hello world');
    });

    it('должен добавлять optionalParams, если они переданы', () => {
      const formatted = logger.formatMessage('log', 'hello', 'TestContext');
      const parsed = JSON.parse(formatted);

      expect(parsed.optionalParams).toEqual(['TestContext']);
    });

    it('должен возвращать пустой массив optionalParams, если они не переданы', () => {
      const formatted = logger.formatMessage('log', 'hello');
      const parsed = JSON.parse(formatted);

      expect(parsed.optionalParams).toEqual([]);
    });

    it('должен включать timestamp в формате ISO 8601', () => {
      const formatted = logger.formatMessage('log', 'msg');
      const parsed = JSON.parse(formatted);

      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('должен корректно сериализовывать объекты в поле message', () => {
      const formatted = logger.formatMessage('log', { foo: 'bar' });
      const parsed = JSON.parse(formatted);

      expect(parsed.message).toEqual({ foo: 'bar' });
    });
  });

  describe('методы логгера', () => {
    it('log() должен вызывать console.log с отформатированной JSON-строкой', () => {
      logger.log('test message', 'TestContext');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(logSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('log');
      expect(output.message).toBe('test message');
      expect(output.optionalParams).toEqual(['TestContext']);
    });

    it('error() должен вызывать console.error с уровнем error', () => {
      logger.error('something broke');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(errorSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('error');
      expect(output.message).toBe('something broke');
    });

    it('warn() должен вызывать console.warn с уровнем warn', () => {
      logger.warn('be careful');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(warnSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('warn');
    });

    it('debug() должен вызывать console.debug с уровнем debug', () => {
      logger.debug('debugging');

      expect(debugSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(debugSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('debug');
    });

    it('verbose() должен вызывать console.log с уровнем verbose', () => {
      logger.verbose('detailed info');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const output = JSON.parse(logSpy.mock.calls[0][0] as string);
      expect(output.level).toBe('verbose');
    });
  });
});
