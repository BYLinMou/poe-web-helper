const assert = require("node:assert/strict");
const { wrapText } = require("../content/pdf.js");

const measure = (text) => text.length * 10;

assert.deepEqual(wrapText("abcd", measure, 20), ["ab", "cd"]);
assert.deepEqual(wrapText("ab\ncd", measure, 50), ["ab", "cd"]);
assert.deepEqual(wrapText("中文測試", measure, 20), ["中文", "測試"]);

console.log("pdf tests passed");
