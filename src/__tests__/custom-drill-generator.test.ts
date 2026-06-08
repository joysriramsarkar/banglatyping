import { generateCustomDrill } from '../lib/custom-drill-generator';
import { supabase } from '../lib/db';
import { generateDrills } from '../lib/lessons';

// Mock dependencies
jest.mock('../lib/db', () => ({
  supabase: {
    from: jest.fn(),
  },
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
    expect(supabase.from).not.toHaveBeenCalled();
    expect(generateDrills).not.toHaveBeenCalled();
  });
});
