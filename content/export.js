(function attachExportHelpers(globalObject, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    globalObject.PoeNotesExport = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createExportHelpers() {
  "use strict";

  function conversationTitle(documentTitle) {
    const title = String(documentTitle || "")
      .replace(/\s+-\s+Poe\s*$/i, "")
      .trim();
    return title || "Poe conversation";
  }

  function safeFilename(title, extension = "md") {
    const cleaned = conversationTitle(title)
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[. ]+$/g, "")
      .trim()
      .slice(0, 120);
    const safeExtension = /^(md|txt|pdf|json)$/.test(extension) ? extension : "md";
    return `${cleaned || "Poe conversation"}.${safeExtension}`;
  }

  function messageNumber(message) {
    const match = String(message.id || "").match(/^message-(\d+)$/);
    return match ? BigInt(match[1]) : null;
  }

  function sortMessages(messages) {
    const copy = [...messages];
    if (!copy.length || copy.some((message) => messageNumber(message) === null)) {
      return copy;
    }

    return copy.sort((left, right) => {
      const leftNumber = messageNumber(left);
      const rightNumber = messageNumber(right);
      return leftNumber < rightNumber ? -1 : leftNumber > rightNumber ? 1 : 0;
    });
  }

  function renderMarkdown({ title, url, exportedAt, messages }) {
    const resolvedTitle = conversationTitle(title);
    const lines = [
      `# ${resolvedTitle}`,
      "",
      `Source: ${url}`,
      `Exported: ${exportedAt}`,
      ""
    ];

    for (const message of sortMessages(messages)) {
      lines.push(
        `## ${message.author || "Unknown"}`,
        "",
        String(message.markdown || message.text || "").trim(),
        ""
      );
    }

    return `${lines.join("\n").trimEnd()}\n`;
  }

  function renderText({ title, url, exportedAt, messages }) {
    const lines = [
      conversationTitle(title),
      `Source: ${url}`,
      `Exported: ${exportedAt}`,
      ""
    ];

    for (const message of sortMessages(messages)) {
      lines.push(`[${message.author || "Unknown"}]`, String(message.text || "").trim(), "");
    }

    return `${lines.join("\n").trimEnd()}\n`;
  }

  function renderJson({ title, url, exportedAt, messages }) {
    return `${JSON.stringify({
      title: conversationTitle(title),
      url,
      exportedAt,
      messages: sortMessages(messages).map((message) => ({
        id: message.id,
        author: message.author || "Unknown",
        text: String(message.text || ""),
        markdown: String(message.markdown || message.text || "")
      }))
    }, null, 2)}\n`;
  }

  return {
    conversationTitle,
    safeFilename,
    sortMessages,
    renderMarkdown,
    renderText,
    renderJson
  };
});
