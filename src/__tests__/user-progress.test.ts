import { saveTypingSession } from '../lib/user-progress';
import { supabase } from '../lib/db';
import type { ErredCharacter } from '../lib/types';

// Mock dependencies
jest.mock('../lib/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('user-progress', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('saveTypingSession', () => {
    const mockUserId = 'user123';
    const mockLessonId = 'lesson123';
    const mockWpm = 50;
    const mockAccuracy = 95;
    const mockErrors = 2;
    const mockTimeElapsed = 60;
    const mockErredCharacters: ErredCharacter[] = [
      { char: 'a', count: 1 },
      { char: 'b', count: 1 }
    ];

    it('should successfully save and return a typing session', async () => {
      const mockData = {
        id: 'session1',
        user_id: mockUserId,
        lesson_id: mockLessonId,
        wpm: mockWpm,
        accuracy: mockAccuracy,
        errors: mockErrors,
        time_elapsed: mockTimeElapsed,
        session_timestamp: new Date().toISOString()
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveTypingSession(
        mockUserId,
        mockLessonId,
        mockWpm,
        mockAccuracy,
        mockErrors,
        mockTimeElapsed,
        mockErredCharacters
      );

      expect(supabase.from).toHaveBeenCalledWith('user_progress');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        lesson_id: mockLessonId,
        wpm: mockWpm,
        accuracy: mockAccuracy,
        errors: mockErrors,
        time_elapsed: mockTimeElapsed,
        erred_characters: mockErredCharacters,
      });
      expect(result).toEqual(mockData);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return null and log error if Supabase returns an error', async () => {
      const mockError = new Error('Database error');

      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: mockError });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle });
      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await saveTypingSession(
        mockUserId,
        mockLessonId,
        mockWpm,
        mockAccuracy,
        mockErrors,
        mockTimeElapsed,
        mockErredCharacters
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving typing session:', mockError);
    });

    it('should return null and log exception if an exception is thrown', async () => {
      const mockException = new Error('Network failure');

      (supabase.from as jest.Mock).mockImplementation(() => {
        throw mockException;
      });

      const result = await saveTypingSession(
        mockUserId,
        mockLessonId,
        mockWpm,
        mockAccuracy,
        mockErrors,
        mockTimeElapsed,
        mockErredCharacters
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Exception saving typing session:', mockException);
    });
  });
});
