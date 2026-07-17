const assert = require("node:assert/strict");
const { canonicalPageKey, resolveOffsets } = require("../content/anchor.js");

assert.equal(
  canonicalPageKey("https://poe.com/chat/example/?share=1#answer"),
  "https://poe.com/chat/example"
);

assert.deepEqual(
  resolveOffsets("alpha beta gamma", { start: 6, end: 10, quote: "beta" }),
  { start: 6, end: 10, strategy: "offset" }
);

assert.deepEqual(
  resolveOffsets("new alpha beta gamma", { start: 6, end: 10, quote: "beta" }),
  { start: 10, end: 14, strategy: "quote" }
);

assert.deepEqual(
  resolveOffsets("red blue red blue", {
    start: 99,
    end: 102,
    quote: "red",
    prefix: "blue ",
    suffix: " blue"
  }),
  { start: 9, end: 12, strategy: "context" }
);

assert.equal(
  resolveOffsets("same and same", { start: 99, end: 103, quote: "same" }),
  null
);

console.log("anchor tests passed");
