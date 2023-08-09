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

type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigUint64Array
  | BigInt64Array
  | Float32Array
  | Float64Array;

export class SearchArray<TArray extends TypedArray> {
  #pattern: TArray;
  #lps: number[];

  constructor(pattern: TArray) {
    this.#pattern = pattern;
    this.#lps = this.#getLPS(pattern);
  }

  get pattern() {
    return this.#pattern;
  }

  get lps() {
    return this.#lps;
  }

  /**
   * Knuth-Morris-Pratt algorithm to compute the failure array
   *
   * complexity: O(m) where m is the length of pattern
   *
   * The algorithm is based on the fact that when a mismatch occurs,
   * the pattern itself embodies sufficient information to determine
   * where the next match could begin, thus bypassing re-examination
   * of previously matched characters.
   *
   * The failure array is an array of integers where the value at index i denotes the length
   * of the longest proper prefix of the substring pattern[0..i] which is also a suffix of this substring.
   *
   * The algorithm is described in detail here: https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm
   *
   * @param pattern - the pattern to search for
   * @returns
   */
  #getLPS(pattern: TArray): number[] {
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
  search(source: TArray): number {
    let i = 0;
    let matchingLength = 0;
    const srcLength = source.length;
    while (i < srcLength) {
      if (this.#pattern[matchingLength] === source[i]) {
        matchingLength++;
        i++;
      }
      if (matchingLength === this.#pattern.length) {
        return i - matchingLength;
      } else if (i < srcLength && this.#pattern[matchingLength] !== source[i]) {
        if (matchingLength !== 0) {
          matchingLength = this.#lps[matchingLength - 1];
        } else {
          i++;
        }
      }
    }
    return -1;
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
  searchAll(source: TArray): number[] {
    const result: number[] = [];
    let i = 0;
    let matchingLength = 0;
    const srcLength = source.length;
    while (i < srcLength) {
      if (this.#pattern[matchingLength] === source[i]) {
        matchingLength++;
        i++;
      }
      if (matchingLength === this.#pattern.length) {
        result.push(i - matchingLength);
        matchingLength = this.#lps[matchingLength - 1];
      } else if (i < srcLength && this.#pattern[matchingLength] !== source[i]) {
        if (matchingLength !== 0) {
          matchingLength = this.#lps[matchingLength - 1];
        } else {
          i++;
        }
      }
    }
    return result;
  }
}
