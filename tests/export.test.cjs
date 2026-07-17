const assert = require("node:assert/strict");
const {
  conversationTitle,
  safeFilename,
  sortMessages,
  renderMarkdown,
  renderText,
  renderJson
} = require("../content/export.js");

assert.equal(conversationTitle("Research notes - Poe"), "Research notes");
assert.equal(safeFilename('A <long>: chat? - Poe'), "A long chat.md");
assert.equal(safeFilename("Research notes", "pdf"), "Research notes.pdf");
assert.deepEqual(
  sortMessages([
    { id: "message-100", text: "later" },
    { id: "message-9", text: "earlier" }
  ]).map((message) => message.id),
  ["message-9", "message-100"]
);

const markdown = renderMarkdown({
  title: "Research notes - Poe",
  url: "https://poe.com/chat/example",
  exportedAt: "2026-07-17T00:00:00.000Z",
  messages: [
    { id: "message-12", author: "Assistant", text: "Answer", markdown: "**Answer**" },
    { id: "message-11", author: "You", text: "Question", markdown: "Question" }
  ]
});

assert.match(markdown, /^# Research notes/m);
assert.ok(markdown.indexOf("## You") < markdown.indexOf("## Assistant"));
assert.match(markdown, /\*\*Answer\*\*/);
assert.match(markdown, /Source: https:\/\/poe\.com\/chat\/example/);

const payload = {
  title: "Research notes - Poe",
  url: "https://poe.com/chat/example",
  exportedAt: "2026-07-17T00:00:00.000Z",
  messages: [{ id: "message-1", author: "Assistant", text: "Plain answer", markdown: "**Answer**" }]
};
const plainText = renderText(payload);
assert.match(plainText, /\[Assistant\]\nPlain answer/);
assert.doesNotMatch(plainText, /\*\*/);

const json = JSON.parse(renderJson(payload));
assert.equal(json.title, "Research notes");
assert.equal(json.messages[0].markdown, "**Answer**");

console.log("export tests passed");
