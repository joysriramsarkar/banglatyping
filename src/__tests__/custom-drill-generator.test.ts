import { generateCustomDrill } from '../lib/custom-drill-generator';
import { createRequestClient } from '../lib/db';
import { generateDrills } from '../lib/lessons';

// Mock dependencies
const mockFrom = jest.fn();

jest.mock('../lib/db', () => ({
  createRequestClient: jest.fn(() => ({ from: mockFrom })),
}));

jest.mock('../lib/lessons', () => ({
  generateDrills: jest.fn(),
}));

describe('generateCustomDrill', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should return null and warn when weakCharacters array is empty', async () => {
    const result = await generateCustomDrill('user123', []);

    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith('No weak characters found for custom drill generation');
    expect(mockFrom).not.toHaveBeenCalled();
    expect(generateDrills).not.toHaveBeenCalled();
  });

  it('forwards the access token when creating the database client', async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'drill-1' }, error: null }) }),
      }),
    });

    const result = await generateCustomDrill(
      'user123',
      [{ character: '\u0995', accuracy_rate: 40 } as never],
      10,
      'caller-token'
    );

    expect(result).toEqual({ id: 'drill-1' });
    expect(createRequestClient).toHaveBeenCalledWith('caller-token');
  });
});
