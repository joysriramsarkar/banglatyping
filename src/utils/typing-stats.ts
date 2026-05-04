/**
 * Calculates WPM, accuracy, and error count based on current typing state
 * Uses standard typing test methodology:
 * - Gross WPM = (Total Keystrokes / 5) / Time in minutes
 * - Net WPM = Gross WPM - (Uncorrected Errors / Time in minutes)
 *
 * Standard formula ensures accurate speed calculation even when words are skipped or mistyped.
 */
export function calculateStatsHelper(
  words: string[],
  charInputPerWord: Record<number, string>,
  currentWordIndex: number,
  time: number
) {
  let totalKeystrokesTyped = 0;
  let uncorrectedErrors = 0;

  // Process all words up to and including current word
  for (let i = 0; i <= currentWordIndex; i++) {
    const typedWord = (charInputPerWord[i] || '').normalize('NFC');
    const expectedWord = words[i]?.normalize('NFC') || '';

    // Add each typed character to keystroke count
    totalKeystrokesTyped += typedWord.length;

    // Add space between words (except for current incomplete word)
    if (i < currentWordIndex) {
      totalKeystrokesTyped += 1;
    }

    // Count character-by-character differences for error tracking
    const expectedLength = expectedWord.length;
    const typedLength = typedWord.length;

    // Compare character by character up to the longer length
    for (let j = 0; j < Math.max(expectedLength, typedLength); j++) {
      const expectedChar = expectedWord[j] || '';
      const typedChar = typedWord[j] || '';

      if (expectedChar !== typedChar) {
        uncorrectedErrors++;
      }
    }
  }

  // Calculate accuracy: (characters correct) / (total characters typed) * 100
  const totalCharsTyped = totalKeystrokesTyped;
  const correctChars = totalCharsTyped - uncorrectedErrors;
  const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 100;

  // Calculate WPM using standard typing test formula
  const timeInMinutes = time / 60;
  const grossWpm = timeInMinutes > 0 ? (totalKeystrokesTyped / 5) / timeInMinutes : 0;
  const netWpm = timeInMinutes > 0 ? grossWpm - (uncorrectedErrors / timeInMinutes) : 0;

  // Use Net WPM (with minimum of 0)
  const wpm = Math.round(Math.max(0, netWpm));

  return { totalCharsTyped, errors: uncorrectedErrors, accuracy, wpm };
}
