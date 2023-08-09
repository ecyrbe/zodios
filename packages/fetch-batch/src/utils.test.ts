import { SearchArray, concat } from "./utils";

describe("utils", () => {
  describe("concat", () => {
    it("should concat two arrays", () => {
      let a = new Uint8Array([1, 2, 3]);
      let b = new Uint8Array([4, 5, 6]);
      let result = concat([a, b]);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
    });

    it("should concat three arrays", () => {
      let a = new Uint8Array([1, 2, 3]);
      let b = new Uint8Array([4, 5, 6]);
      let c = new Uint8Array([7, 8, 9]);
      let result = concat([a, b, c]);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    });

    it("should concat empty arrays", () => {
      let a = new Uint8Array([]);
      let b = new Uint8Array([]);
      let result = concat([a, b]);
      expect(result).toEqual(new Uint8Array([]));
    });

    it("should concat empty array with non-empty array", () => {
      let a = new Uint8Array([]);
      let b = new Uint8Array([1, 2, 3]);
      let result = concat([a, b]);
      expect(result).toEqual(new Uint8Array([1, 2, 3]));
    });
  });

  describe("Knuth-Morris-Pratt algorithm", () => {
    describe("findIndexOf", () => {
      it("should match simple pattern", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([2, 3, 4]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toBe(1);
      });

      it("should match pattern at the end", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([6, 7]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toBe(5);
      });

      it("should match pattern at the beginning", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([1, 2]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toBe(0);
      });

      it("should match first when pattern appears more than once", () => {
        let text = new Uint8Array([3, 4, 5, 1, 2, 6, 7, 1, 2]);
        let pattern = new Uint8Array([1, 2]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toBe(3);
      });

      it("should match first when pattern is self repeating", () => {
        let text = new Uint8Array([
          1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1,
          1,
        ]);
        let pattern = new Uint8Array([1, 1, 1]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toBe(10);
      });

      it("should match long pattern and text almost matches multiple times", () => {
        let text = new Uint8Array([
          1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 1, 3, 4,
          5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 3, 4, 5,
        ]);
        let pattern = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 1, 3]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toEqual(13);
      });

      it("should not match when pattern not in source", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([8, 9]);
        const search = new SearchArray(pattern);
        let result = search.findIndexOf(text);
        expect(result).toBe(-1);
      });
    });

    describe("findAllIndexOf", () => {
      it("should match simple pattern", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([2, 3, 4]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([1]);
      });

      it("should match pattern at the end", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([6, 7]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([5]);
      });

      it("should match pattern at the beginning", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([1, 2]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([0]);
      });

      it("should match multiple occurrences", () => {
        let text = new Uint8Array([3, 4, 5, 1, 2, 6, 7, 1, 2]);
        let pattern = new Uint8Array([1, 2]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([3, 7]);
      });

      it("should match overlapping occurrences", () => {
        let text = new Uint8Array([1, 2, 1, 2, 1, 2]);
        let pattern = new Uint8Array([1, 2, 1, 2]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([0, 2]);
      });

      it("should match overlapping occurrences at the end", () => {
        let text = new Uint8Array([1, 2, 1, 2, 1, 2]);
        let pattern = new Uint8Array([1, 2, 1]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([0, 2]);
      });

      it("should match long pattern and text almost matches multiple times", () => {
        let text = new Uint8Array([
          1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 7, 1, 3, 4,
          5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 3, 4, 5,
        ]);
        let pattern = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 1, 3]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([13, 26]);
      });

      it("should match first when pattern is self repeating", () => {
        let text = new Uint8Array([
          1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1,
          1,
        ]);
        let pattern = new Uint8Array([1, 1, 1]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([10, 16, 17, 18, 19, 20, 21]);
      });

      it("should not match when pattern not in source", () => {
        let text = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let pattern = new Uint8Array([8, 9]);
        const search = new SearchArray(pattern);
        let result = search.findAllIndexOf(text);
        expect(result).toEqual([]);
      });
    });

    describe("getLSP", () => {
      it("should return one item 0 array for empty pattern", () => {
        let pattern = new Uint8Array([]);
        let result = new SearchArray(pattern).lps;
        expect(result).toEqual([0]);
      });

      it("should return zero filled array for pattern without repeated sequences", () => {
        let pattern = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
        let result = new SearchArray(pattern).lps;
        expect(result).toEqual([0, 0, 0, 0, 0, 0, 0]);
      });

      it("should return non zero filled array for pattern with repeated sequences", () => {
        let pattern = new Uint8Array([1, 2, 1, 2, 1, 2]);
        let result = new SearchArray(pattern).lps;
        expect(result).toEqual([0, 0, 1, 2, 3, 4]);
      });

      it("should return non zero filled array for pattern with repeated sequences within repeated sequences", () => {
        let pattern = new Uint8Array([1, 2, 1, 2, 1, 2, 3, 2]);
        let result = new SearchArray(pattern).lps;
        expect(result).toEqual([0, 0, 1, 2, 3, 4, 0, 0]);
      });
    });
  });
});
