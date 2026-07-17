(function attachAnchorHelpers(globalObject, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    globalObject.PoeNotesAnchor = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createAnchorHelpers() {
  "use strict";

  function canonicalPageKey(urlValue) {
    const url = new URL(urlValue);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.origin}${pathname}`;
  }

  function findOccurrences(text, quote) {
    const results = [];
    let cursor = 0;

    while (quote && cursor <= text.length - quote.length) {
      const index = text.indexOf(quote, cursor);
      if (index === -1) {
        break;
      }

      results.push(index);
      cursor = index + 1;
    }

    return results;
  }

  function commonSuffixLength(left, right) {
    let count = 0;
    const limit = Math.min(left.length, right.length);

    while (count < limit && left[left.length - 1 - count] === right[right.length - 1 - count]) {
      count += 1;
    }

    return count;
  }

  function commonPrefixLength(left, right) {
    let count = 0;
    const limit = Math.min(left.length, right.length);

    while (count < limit && left[count] === right[count]) {
      count += 1;
    }

    return count;
  }

  function resolveOffsets(text, annotation) {
    const start = Number(annotation.start);
    const end = Number(annotation.end);

    if (
      Number.isInteger(start) &&
      Number.isInteger(end) &&
      start >= 0 &&
      end > start &&
      text.slice(start, end) === annotation.quote
    ) {
      return { start, end, strategy: "offset" };
    }

    const occurrences = findOccurrences(text, annotation.quote);
    if (occurrences.length === 0) {
      return null;
    }

    if (occurrences.length === 1) {
      return {
        start: occurrences[0],
        end: occurrences[0] + annotation.quote.length,
        strategy: "quote"
      };
    }

    const prefix = annotation.prefix || "";
    const suffix = annotation.suffix || "";
    const ranked = occurrences.map((candidate) => {
      const before = text.slice(Math.max(0, candidate - prefix.length), candidate);
      const after = text.slice(
        candidate + annotation.quote.length,
        candidate + annotation.quote.length + suffix.length
      );

      return {
        start: candidate,
        score: commonSuffixLength(before, prefix) + commonPrefixLength(after, suffix)
      };
    }).sort((left, right) => right.score - left.score || left.start - right.start);

    if (ranked.length > 1 && ranked[0].score === ranked[1].score && ranked[0].score === 0) {
      return null;
    }

    return {
      start: ranked[0].start,
      end: ranked[0].start + annotation.quote.length,
      strategy: "context"
    };
  }

  return {
    canonicalPageKey,
    resolveOffsets
  };
});
