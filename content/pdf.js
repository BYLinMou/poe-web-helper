(function attachPdfHelpers(globalObject, factory) {
  const api = factory(globalObject);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    globalObject.PoeNotesPdf = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createPdfHelpers(globalObject) {
  "use strict";

  const CANVAS_WIDTH = 1240;
  const CANVAS_HEIGHT = 1754;
  const PAGE_WIDTH_PT = 595.28;
  const PAGE_HEIGHT_PT = 841.89;
  const MARGIN_X = 92;
  const MARGIN_TOP = 88;
  const MARGIN_BOTTOM = 86;

  function wrapText(text, measureText, maxWidth) {
    const lines = [];
    let line = "";

    for (const character of String(text || "").replace(/\r\n?/g, "\n")) {
      if (character === "\n") {
        lines.push(line);
        line = "";
        continue;
      }

      const candidate = line + character;
      if (line && measureText(candidate) > maxWidth) {
        lines.push(line.replace(/\s+$/g, ""));
        line = character.replace(/^\s+/g, "");
      } else {
        line = candidate;
      }
    }

    lines.push(line);
    return lines;
  }

  async function createPdfBlob({ title, url, exportedAt, messages }) {
    const JsPdf = globalObject.jspdf?.jsPDF;
    if (!JsPdf || typeof document === "undefined") {
      throw new Error("The PDF exporter is unavailable.");
    }

    const pdf = new JsPdf({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("The browser could not create a PDF canvas.");
    }

    let pageNumber = 1;
    let hasCommittedPage = false;
    let y = MARGIN_TOP;

    function resetPage() {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.textBaseline = "top";
      y = MARGIN_TOP;
    }

    function commitPage() {
      context.fillStyle = "#6b7280";
      context.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif';
      context.textAlign = "center";
      context.fillText(String(pageNumber), CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
      context.textAlign = "left";

      if (hasCommittedPage) {
        pdf.addPage();
      }
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.9),
        "JPEG",
        0,
        0,
        PAGE_WIDTH_PT,
        PAGE_HEIGHT_PT,
        undefined,
        "FAST"
      );
      hasCommittedPage = true;
      pageNumber += 1;
      resetPage();
    }

    function ensureSpace(height) {
      if (y + height > CANVAS_HEIGHT - MARGIN_BOTTOM) {
        commitPage();
      }
    }

    function drawText(text, { font, color, lineHeight, spaceBefore = 0, spaceAfter = 0 }) {
      y += spaceBefore;
      context.font = font;
      context.fillStyle = color;
      const lines = wrapText(
        text,
        (value) => context.measureText(value).width,
        CANVAS_WIDTH - MARGIN_X * 2
      );

      for (const line of lines) {
        ensureSpace(lineHeight);
        if (line) {
          context.fillText(line, MARGIN_X, y);
        }
        y += lineHeight;
      }
      y += spaceAfter;
    }

    resetPage();
    drawText(title, {
      font: '700 38px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif',
      color: "#111827",
      lineHeight: 52,
      spaceAfter: 16
    });
    drawText(`Source: ${url}`, {
      font: '18px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif',
      color: "#4b5563",
      lineHeight: 27
    });
    drawText(`Exported: ${exportedAt}`, {
      font: '18px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif',
      color: "#4b5563",
      lineHeight: 27,
      spaceAfter: 28
    });

    for (const message of messages) {
      drawText(message.author || "Unknown", {
        font: '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif',
        color: "#111827",
        lineHeight: 34,
        spaceBefore: 20,
        spaceAfter: 8
      });
      drawText(message.text || "", {
        font: '20px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", sans-serif',
        color: "#1f2937",
        lineHeight: 31,
        spaceAfter: 18
      });
    }

    commitPage();
    return pdf.output("blob");
  }

  return {
    wrapText,
    createPdfBlob
  };
});
