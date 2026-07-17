const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const localesRoot = path.join(__dirname, "..", "_locales");
const localeNames = ["en", "zh_CN", "zh_TW"];
const locales = localeNames.map((locale) => ({
  locale,
  messages: JSON.parse(fs.readFileSync(path.join(localesRoot, locale, "messages.json"), "utf8"))
}));
const expectedKeys = Object.keys(locales[0].messages).sort();

for (const { locale, messages } of locales) {
  assert.deepEqual(Object.keys(messages).sort(), expectedKeys, `${locale} locale keys do not match English`);
  for (const [key, value] of Object.entries(messages)) {
    assert.equal(typeof value.message, "string", `${locale}.${key} must contain a message`);
    assert.ok(value.message.trim(), `${locale}.${key} must not be empty`);
  }
}

console.log("locale tests passed");
