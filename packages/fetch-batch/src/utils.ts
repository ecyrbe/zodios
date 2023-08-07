export function concat(arrays: Uint8Array[]) {
  let length = 0;
  for (const arr of arrays) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Knuth-Morris-Pratt algorithm that finds all occurrences of pattern in a Uint8Array
 *
 * complexity: O(n + m) where n is the length of text and m is the length of pattern
 *
 * The algorithm is based on the fact that when a mismatch occurs, the pattern itself
 * embodies sufficient information to determine where the next match could begin, thus
 * bypassing re-examination of previously matched characters.
 *
 * The algorithm is described in detail here: https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm
 *
 * @param source - the array to search in
 * @param pattern - the pattern to search for
 * @returns the array of indices where the pattern occurs in the source array
 */
export function findAllIndexOf(
  source: Uint8Array,
  pattern: Uint8Array
): number[] {
  const result: number[] = [];
  let i = 0;
  let matchingLength = 0;
  const patternLength = pattern.length;
  const srcLength = source.length;
  const lps = getLPS(pattern);
  while (i < srcLength) {
    if (pattern[matchingLength] === source[i]) {
      matchingLength++;
      i++;
    }
    if (matchingLength === patternLength) {
      result.push(i - matchingLength);
      matchingLength = lps[matchingLength - 1];
    } else if (i < srcLength && pattern[matchingLength] !== source[i]) {
      if (matchingLength !== 0) {
        matchingLength = lps[matchingLength - 1];
      } else {
        i++;
      }
    }
  }
  return result;
}

/**
 * Knuth-Morris-Pratt algorithm that finds the first occurrence of pattern in a Uint8Array
 *
 * complexity: O(n + m) where n is the length of text and m is the length of pattern
 *
 * The algorithm is based on the fact that when a mismatch occurs, the pattern itself
 * embodies sufficient information to determine where the next match could begin, thus
 * bypassing re-examination of previously matched characters.
 *
 * The algorithm is described in detail here: https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm
 *
 * @param source - the array to search in
 * @param pattern - the pattern to search for
 * @returns the index where the pattern occurs in the source array or -1 if it does not occur
 */
export function findIndexOf(source: Uint8Array, pattern: Uint8Array): number {
  let i = 0;
  let matchingLength = 0;
  const patternLength = pattern.length;
  const srcLength = source.length;
  const lps = getLPS(pattern);
  while (i < srcLength) {
    if (pattern[matchingLength] === source[i]) {
      matchingLength++;
      i++;
    }
    if (matchingLength === patternLength) {
      return i - matchingLength;
    } else if (i < srcLength && pattern[matchingLength] !== source[i]) {
      if (matchingLength !== 0) {
        matchingLength = lps[matchingLength - 1];
      } else {
        i++;
      }
    }
  }
  return -1;
}

/**
 * Knuth-Morris-Pratt algorithm to compute the longest prefix that is also a suffix
 *
 * complexity: O(m) where m is the length of pattern
 *
 * The longest prefix that is also a suffix is used to determine where the next match
 * could begin, thus bypassing re-examination of previously matched characters.
 *
 * The algorithm is described in detail here: https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm
 *
 * @param pattern - the pattern to search for
 * @returns an array of length where the value at index i is the length of the longest prefix that is also a suffix of pattern[0..i]
 */
export function getLPS(pattern: Uint8Array): number[] {
  const result = [0];
  let selfMatchingLength = 0;
  let i = 1;
  const patternLength = pattern.length;
  while (i < patternLength) {
    if (pattern[i] === pattern[selfMatchingLength]) {
      selfMatchingLength++;
      result[i] = selfMatchingLength;
      i++;
    } else if (selfMatchingLength !== 0) {
      selfMatchingLength = result[selfMatchingLength - 1];
    } else {
      result[i] = 0;
      i++;
    }
  }
  return result;
}
