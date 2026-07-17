(function startPoeNotes() {
  "use strict";

  if (globalThis.__poeNotesLoaded) {
    return;
  }
  globalThis.__poeNotesLoaded = true;

  const Anchor = globalThis.PoeNotesAnchor;
  const Export = globalThis.PoeNotesExport;
  const Pdf = globalThis.PoeNotesPdf;
  const STORAGE_PREFIX = "poe-notes:page:";
  const SETTINGS_KEY = "poe-notes:settings";
  const MESSAGE_SELECTOR = '[id^="message-"]';
  const TEXT_SELECTOR = '[class*="Message_selectableText__"]';
  const SCROLL_CONTAINER_SELECTOR = '[class*="ChatMessagesScrollWrapper_scrollableContainerWrapper__"]';
  const PAGING_TRIGGER_SELECTOR = '[class*="InfiniteScroll_pagingTrigger__"]';
  const BOT_NAME_SELECTOR = '[class*="BotHeader_name__"]';
  const RIGHT_MESSAGE_SELECTOR = '[class*="ChatMessage_rightSideMessageWrapper__"]';
  const HEADER_ACTIONS_SELECTOR = 'header[class*="BaseNavbar_chatTitleNavbar__"] [class*="ChatPageNavbar_rightNavItemWrapper__"]';
  const NATIVE_EXPORT_SELECTOR = "[data-poe-notes-native-export]";
  const DOWNLOAD_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="height:18px;width:18px;display:block;flex:none">
      <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  const COLORS = ["yellow", "green", "blue", "pink", "purple"];
  const CONTEXT_LENGTH = 40;
  const MAX_QUOTE_LENGTH = 12000;
  const EXPORT_PROGRESS_TIMEOUT = 2200;
  const EXPORT_STABLE_ROUNDS = 3;
  const EXPORT_MAX_ROUNDS = 500;
  const markdownConverter = globalThis.TurndownService
    ? new globalThis.TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-"
    })
    : null;
  if (markdownConverter && globalThis.turndownPluginGfm?.gfm) {
    markdownConverter.use(globalThis.turndownPluginGfm.gfm);
  }
  const UI_MESSAGES = {
    en: {
      download: "Download",
      downloadConversation: "Download conversation",
      close: "Close",
      plainText: "Plain text",
      pdfDocument: "PDF document",
      jsonData: "JSON data",
      textActions: "Text actions",
      highlight: "Highlight",
      quote: "Quote",
      editHighlight: "Edit highlight",
      notePlaceholder: "Add a note (optional)",
      note: "Note",
      highlightColor: "Highlight color",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      yellow: "Yellow",
      green: "Green",
      blue: "Blue",
      pink: "Pink",
      purple: "Purple",
      selectWithinOne: "Select text within one Poe message.",
      selectShorter: "Select a shorter passage.",
      exportInProgress: "A conversation export is already in progress.",
      openConversation: "Open a Poe conversation before exporting.",
      highlightedWithNote: "Highlighted text. Note: {note}",
      highlightedText: "Highlighted text",
      composerMissing: "Open a Poe conversation with a message box.",
      quoteAdded: "Quote added to the Poe message box.",
      loadingHistory: "Loading full history... {count} messages found",
      conversationChanged: "The Poe conversation changed during export.",
      historyLoadFailed: "Poe could not load earlier messages. Please retry the export.",
      historyTooLong: "Poe kept loading history for too long. Please try again.",
      creatingPdf: "Creating PDF... {count} messages",
      exported: "Exported {count} messages as {format}.",
      overlap: "This selection overlaps an existing highlight.",
      exportFailed: "Export failed."
    },
    zhHans: {
      download: "下载",
      downloadConversation: "下载对话",
      close: "关闭",
      plainText: "纯文本",
      pdfDocument: "PDF 文件",
      jsonData: "JSON 数据",
      textActions: "文本操作",
      highlight: "高亮",
      quote: "引用",
      editHighlight: "编辑高亮",
      notePlaceholder: "添加笔记（可选）",
      note: "笔记",
      highlightColor: "高亮颜色",
      delete: "删除",
      cancel: "取消",
      save: "保存",
      yellow: "黄色",
      green: "绿色",
      blue: "蓝色",
      pink: "粉色",
      purple: "紫色",
      selectWithinOne: "请在同一条 Poe 消息内选择文本。",
      selectShorter: "请选择较短的文本。",
      exportInProgress: "对话正在导出。",
      openConversation: "请先打开一个 Poe 对话。",
      highlightedWithNote: "已高亮。笔记：{note}",
      highlightedText: "已高亮文本",
      composerMissing: "请打开带有输入框的 Poe 对话。",
      quoteAdded: "引用已添加到 Poe 输入框。",
      loadingHistory: "正在加载完整记录... 已找到 {count} 条消息",
      conversationChanged: "导出期间 Poe 对话发生了变化。",
      historyLoadFailed: "Poe 无法加载更早的消息，请重试导出。",
      historyTooLong: "Poe 加载历史记录时间过长，请重试。",
      creatingPdf: "正在生成 PDF... {count} 条消息",
      exported: "已将 {count} 条消息导出为 {format}。",
      overlap: "所选文本与已有高亮重叠。",
      exportFailed: "导出失败。"
    },
    zhHant: {
      download: "下載",
      downloadConversation: "下載對話",
      close: "關閉",
      plainText: "純文字",
      pdfDocument: "PDF 文件",
      jsonData: "JSON 資料",
      textActions: "文字操作",
      highlight: "螢光標記",
      quote: "引用",
      editHighlight: "編輯標記",
      notePlaceholder: "新增筆記（選填）",
      note: "筆記",
      highlightColor: "標記顏色",
      delete: "刪除",
      cancel: "取消",
      save: "儲存",
      yellow: "黃色",
      green: "綠色",
      blue: "藍色",
      pink: "粉紅色",
      purple: "紫色",
      selectWithinOne: "請在同一則 Poe 訊息內選取文字。",
      selectShorter: "請選取較短的文字。",
      exportInProgress: "對話正在匯出。",
      openConversation: "請先開啟一個 Poe 對話。",
      highlightedWithNote: "已標記文字。筆記：{note}",
      highlightedText: "已標記文字",
      composerMissing: "請開啟含有輸入框的 Poe 對話。",
      quoteAdded: "引用已加入 Poe 輸入框。",
      loadingHistory: "正在載入完整記錄... 已找到 {count} 則訊息",
      conversationChanged: "匯出期間 Poe 對話已變更。",
      historyLoadFailed: "Poe 無法載入更早的訊息，請重試匯出。",
      historyTooLong: "Poe 載入歷史記錄時間過長，請重試。",
      creatingPdf: "正在建立 PDF... {count} 則訊息",
      exported: "已將 {count} 則訊息匯出為 {format}。",
      overlap: "所選文字與現有標記重疊。",
      exportFailed: "匯出失敗。"
    }
  };
  const UI_STYLES = `
    :host {
      --panel: #25272b;
      --panel-raised: #2c2f34;
      --border: #505762;
      --border-strong: #68717e;
      --text: #f4f5f7;
      --muted: #adb3bc;
      --primary: #79bfff;
      --primary-hover: #9bcfff;
      --danger: #ff827a;
      --selection-panel: #383b41;
      --selection-hover: #464a52;
      --selection-border: #737a86;
      --shadow: 0 18px 48px rgba(0, 0, 0, 0.38), 0 2px 10px rgba(0, 0, 0, 0.24);
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      letter-spacing: 0;
    }

    :host([data-theme="light"]) {
      --panel: #ffffff;
      --panel-raised: #f7f8fa;
      --border: #c9ced6;
      --border-strong: #9ca4af;
      --text: #202227;
      --muted: #686f7a;
      --primary: #1677c8;
      --primary-hover: #0f65ad;
      --danger: #c43737;
      --selection-panel: #eef0f3;
      --selection-hover: #e1e4e8;
      --selection-border: #b7bdc6;
      --shadow: 0 18px 48px rgba(31, 36, 43, 0.18), 0 2px 10px rgba(31, 36, 43, 0.12);
      color-scheme: light;
    }

    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .export-backdrop {
      position: fixed;
      z-index: 4;
      inset: 0;
      display: grid;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(0, 0, 0, 0.54);
      pointer-events: auto;
    }

    .export-dialog {
      width: min(360px, calc(100vw - 24px));
      padding: 14px;
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 7px;
      box-shadow: var(--shadow);
    }

    .export-dialog-header {
      display: flex;
      min-height: 34px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .export-dialog-title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.3;
    }

    .export-close {
      display: grid;
      width: 30px;
      height: 30px;
      padding: 0;
      place-items: center;
      color: var(--muted);
      background: transparent;
      border: 0;
      border-radius: 4px;
      outline: none;
      cursor: pointer;
      font: 22px/1 Inter, ui-sans-serif, sans-serif;
    }

    .export-close:hover { color: var(--text); background: var(--panel-raised); }
    .export-close:focus-visible { box-shadow: inset 0 0 0 2px var(--primary); }

    .format-list {
      display: grid;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 6px;
    }

    .format-option {
      display: flex;
      width: 100%;
      min-height: 50px;
      align-items: center;
      gap: 11px;
      padding: 7px 10px;
      color: var(--text);
      background: transparent;
      border: 0;
      border-bottom: 1px solid var(--border);
      outline: none;
      cursor: pointer;
      text-align: left;
      font: 600 13px/1.2 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    .format-option:last-child { border-bottom: 0; }
    .format-option:hover { background: var(--panel-raised); }
    .format-option:focus-visible { box-shadow: inset 0 0 0 2px var(--primary); }

    .format-badge {
      display: grid;
      width: 42px;
      height: 30px;
      flex: 0 0 42px;
      place-items: center;
      color: var(--primary);
      background: var(--panel-raised);
      border: 1px solid var(--border);
      border-radius: 4px;
      font: 700 11px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0;
    }

    .selection-menu {
      position: fixed;
      z-index: 2;
      display: flex;
      padding: 3px;
      color: var(--text);
      background: var(--selection-panel);
      border: 1px solid var(--selection-border);
      border-radius: 7px;
      box-shadow: var(--shadow);
      pointer-events: auto;
    }

    .selection-action {
      min-width: 74px;
      min-height: 32px;
      padding: 6px 11px;
      color: var(--text);
      background: transparent;
      border: 0;
      border-radius: 4px;
      outline: none;
      cursor: pointer;
      font: 600 12px/1.2 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    .selection-action + .selection-action { border-left: 1px solid var(--selection-border); border-radius: 0 4px 4px 0; }
    .selection-action:hover { background: var(--selection-hover); }
    .selection-action:focus-visible { box-shadow: inset 0 0 0 2px var(--primary); }

    .panel {
      position: fixed;
      z-index: 2;
      width: min(328px, calc(100vw - 24px));
      padding: 12px;
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 7px;
      box-shadow: var(--shadow);
      pointer-events: auto;
    }

    .quote {
      max-height: 56px;
      margin: 0 0 10px;
      overflow: auto;
      color: var(--text);
      font-size: 12px;
      line-height: 1.45;
      overflow-wrap: anywhere;
      scrollbar-width: thin;
    }

    .note {
      display: block;
      width: 100%;
      min-height: 76px;
      max-height: 180px;
      resize: vertical;
      padding: 9px 10px;
      color: var(--text);
      caret-color: var(--primary);
      background: var(--panel-raised);
      border: 1px solid var(--border-strong);
      border-radius: 6px;
      outline: none;
      font: inherit;
      line-height: 1.45;
      letter-spacing: 0;
    }

    .note::placeholder { color: var(--muted); }
    .note:focus { border-color: var(--primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 24%, transparent); }

    .color-row {
      display: flex;
      align-items: center;
      gap: 7px;
      min-height: 40px;
    }

    .color-label {
      margin-right: 2px;
      color: var(--muted);
      font-size: 12px;
      white-space: nowrap;
    }

    .swatch {
      position: relative;
      width: 20px;
      height: 20px;
      flex: 0 0 20px;
      padding: 0;
      border: 2px solid transparent;
      border-radius: 50%;
      outline: none;
      cursor: pointer;
    }

    .swatch::after {
      position: absolute;
      inset: 3px;
      content: "";
      border: 2px solid transparent;
      border-top: 0;
      border-left: 0;
      opacity: 0;
      transform: rotate(45deg) translate(-1px, -1px);
    }

    .swatch[aria-checked="true"] { border-color: var(--text); box-shadow: 0 0 0 1px var(--border-strong); }
    .swatch[aria-checked="true"]::after { border-color: #ffffff; opacity: 1; }
    .swatch:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 42%, transparent); }
    .swatch[data-color="yellow"] { background: #efae2f; }
    .swatch[data-color="green"] { background: #35ce91; }
    .swatch[data-color="blue"] { background: #43a8ef; }
    .swatch[data-color="pink"] { background: #eb6ca9; }
    .swatch[data-color="purple"] { background: #ad78e9; }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    .spacer { flex: 1; }

    .button {
      min-height: 30px;
      padding: 5px 11px;
      color: var(--text);
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      font: 600 12px/1.2 Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }

    .button:hover { background: var(--panel-raised); border-color: var(--border-strong); }
    .button:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 34%, transparent); }
    .button.primary { color: #102030; background: var(--primary); border-color: var(--primary); }
    .button.primary:hover { background: var(--primary-hover); border-color: var(--primary-hover); }
    :host([data-theme="light"]) .button.primary { color: #ffffff; }
    .button.danger { color: var(--danger); }

    .tooltip {
      position: fixed;
      z-index: 1;
      max-width: min(280px, calc(100vw - 24px));
      padding: 7px 9px;
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 5px;
      box-shadow: 0 7px 22px rgba(0, 0, 0, 0.24);
      pointer-events: none;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.4;
    }

    .toast {
      position: fixed;
      z-index: 3;
      top: calc(env(safe-area-inset-top, 0px) + 16px);
      left: 50%;
      max-width: min(360px, calc(100vw - 24px));
      padding: 8px 11px;
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 5px;
      box-shadow: var(--shadow);
      pointer-events: none;
      transform: translateX(-50%);
      line-height: 1.4;
    }

    @media (max-width: 480px) {
      .export-backdrop { padding: 12px; }
      .export-dialog { padding: 12px; }
      .panel { padding: 11px; }
      .color-row { gap: 6px; }
      .swatch { width: 22px; height: 22px; flex-basis: 22px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; }
    }
  `;

  let pageKey = Anchor.canonicalPageKey(location.href);
  let annotations = [];
  let settings = { enabled: true };
  let draft = null;
  let observer = null;
  let restoreTimer = null;
  let toastTimer = null;
  let routeTimer = null;
  let nativeInjectionTimer = null;
  let nativeTooltipTimer = null;
  let nativeTooltip = null;
  let exportPromise = null;
  let exportDialogReturnFocus = null;

  const host = document.createElement("div");
  host.id = "poe-notes-ui";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${UI_STYLES}</style>
    <div class="export-backdrop" hidden>
      <section class="export-dialog" role="dialog" aria-modal="true" aria-labelledby="poe-notes-export-title">
        <div class="export-dialog-header">
          <h2 class="export-dialog-title" id="poe-notes-export-title">Download</h2>
          <button class="export-close" type="button" aria-label="Close" title="Close">&times;</button>
        </div>
        <div class="format-list">
          <button class="format-option" type="button" data-format="md"><span class="format-badge">MD</span><span>Markdown</span></button>
          <button class="format-option" type="button" data-format="txt"><span class="format-badge">TXT</span><span>Plain text</span></button>
          <button class="format-option" type="button" data-format="pdf"><span class="format-badge">PDF</span><span>PDF document</span></button>
          <button class="format-option" type="button" data-format="json"><span class="format-badge">{ }</span><span>JSON data</span></button>
        </div>
      </section>
    </div>
    <div class="selection-menu" role="toolbar" aria-label="Text actions" hidden>
      <button class="selection-action highlight-action" type="button">Highlight</button>
      <button class="selection-action quote-action" type="button">Quote</button>
    </div>
    <section class="panel" role="dialog" aria-label="Edit highlight" hidden>
      <p class="quote"></p>
      <textarea class="note" maxlength="4000" placeholder="Add a note (optional)" aria-label="Note"></textarea>
      <div class="color-row" role="radiogroup" aria-label="Highlight color">
        <span class="color-label">Highlight color</span>
        ${COLORS.map((color) => `<button class="swatch" type="button" role="radio" data-color="${color}" aria-label="${color}" aria-checked="false" title="${color}"></button>`).join("")}
      </div>
      <div class="actions">
        <button class="button danger delete" type="button">Delete</button>
        <span class="spacer"></span>
        <button class="button cancel" type="button">Cancel</button>
        <button class="button primary save" type="button">Save</button>
      </div>
    </section>
    <div class="tooltip" role="tooltip" hidden></div>
    <div class="toast" role="status" aria-live="polite" hidden></div>
  `;
  document.documentElement.append(host);

  const exportBackdrop = shadow.querySelector(".export-backdrop");
  const exportDialog = shadow.querySelector(".export-dialog");
  const exportCloseButton = shadow.querySelector(".export-close");
  const selectionMenu = shadow.querySelector(".selection-menu");
  const panel = shadow.querySelector(".panel");
  const quoteElement = shadow.querySelector(".quote");
  const noteElement = shadow.querySelector(".note");
  const deleteButton = shadow.querySelector(".delete");
  const tooltip = shadow.querySelector(".tooltip");
  const toast = shadow.querySelector(".toast");

  function storageKey() {
    return `${STORAGE_PREFIX}${pageKey}`;
  }

  function storageGet(keys) {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  }

  function storageSet(value) {
    return new Promise((resolve) => chrome.storage.local.set(value, resolve));
  }

  async function loadState() {
    const key = storageKey();
    const values = await storageGet([key, SETTINGS_KEY]);
    annotations = Array.isArray(values[key]) ? values[key] : [];
    settings = { enabled: true, ...(values[SETTINGS_KEY] || {}) };
    syncTheme();
    restoreAll();
  }

  async function persistAnnotations() {
    await storageSet({ [storageKey()]: annotations });
  }

  function getMessageRoot(node) {
    return node instanceof Element ? node.closest(MESSAGE_SELECTOR) : node.parentElement?.closest(MESSAGE_SELECTOR);
  }

  function getTextRoot(messageRoot) {
    return messageRoot?.querySelector(TEXT_SELECTOR) || null;
  }

  function messageIdFor(root) {
    return root.closest(MESSAGE_SELECTOR)?.id || "";
  }

  function textNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.data || node.parentElement?.closest("script, style, textarea")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let current = walker.nextNode();

    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }
    return nodes;
  }

  function textOffset(root, node, offset) {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.setEnd(node, offset);
    return range.toString().length;
  }

  function selectionDraft() {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const startMessage = getMessageRoot(range.startContainer);
    const endMessage = getMessageRoot(range.endContainer);
    if (!startMessage || startMessage !== endMessage) {
      return { error: translate("selectWithinOne") };
    }

    const root = getTextRoot(startMessage);
    if (!root || !root.contains(range.startContainer) || !root.contains(range.endContainer)) {
      return null;
    }

    const quote = range.toString();
    if (!quote.trim()) {
      return null;
    }
    if (quote.length > MAX_QUOTE_LENGTH) {
      return { error: translate("selectShorter") };
    }

    const start = textOffset(root, range.startContainer, range.startOffset);
    const end = textOffset(root, range.endContainer, range.endOffset);
    const sourceText = root.textContent || "";
    const overlapsHighlight = annotations.some((annotation) => (
      annotation.messageId === startMessage.id && start < annotation.end && end > annotation.start
    ));

    return {
      mode: "new",
      messageId: startMessage.id,
      start,
      end,
      quote,
      prefix: sourceText.slice(Math.max(0, start - CONTEXT_LENGTH), start),
      suffix: sourceText.slice(end, end + CONTEXT_LENGTH),
      color: "yellow",
      note: "",
      overlapsHighlight,
      rect: range.getBoundingClientRect()
    };
  }

  function setSelectedColor(color) {
    shadow.querySelectorAll(".swatch").forEach((swatch) => {
      swatch.setAttribute("aria-checked", String(swatch.dataset.color === color));
    });
    if (draft) {
      draft.color = color;
    }
  }

  function positionNear(element, rect) {
    element.style.left = "12px";
    element.style.top = "12px";
    element.hidden = false;

    requestAnimationFrame(() => {
      const elementRect = element.getBoundingClientRect();
      const desiredLeft = rect.left + (rect.width - elementRect.width) / 2;
      const left = Math.min(Math.max(12, desiredLeft), innerWidth - elementRect.width - 12);
      const below = rect.bottom + 10;
      const above = rect.top - elementRect.height - 10;
      const top = below + elementRect.height <= innerHeight - 12
        ? below
        : Math.max(12, above);
      element.style.left = `${Math.round(left)}px`;
      element.style.top = `${Math.round(top)}px`;
    });
  }

  function showSelectionMenu(nextDraft) {
    draft = nextDraft;
    panel.hidden = true;
    hideTooltip();
    positionNear(selectionMenu, nextDraft.rect);
  }

  function openEditor(nextDraft) {
    draft = nextDraft;
    selectionMenu.hidden = true;
    quoteElement.textContent = nextDraft.quote;
    noteElement.value = nextDraft.note || "";
    deleteButton.hidden = nextDraft.mode !== "edit";
    setSelectedColor(nextDraft.color || "yellow");
    hideTooltip();
    positionNear(panel, nextDraft.rect);
    requestAnimationFrame(() => noteElement.focus({ preventScroll: true }));
  }

  function closeEditor() {
    selectionMenu.hidden = true;
    panel.hidden = true;
    draft = null;
    document.getSelection()?.removeAllRanges();
  }

  function showToast(message, persistent = false) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    if (!persistent) {
      toastTimer = setTimeout(() => {
        toast.hidden = true;
      }, 2600);
    }
  }

  function interfaceLocale(referenceText = "") {
    const interfaceText = referenceText || document.querySelector(HEADER_ACTIONS_SELECTOR)?.textContent || "";
    if (/重新命名|釘選|邀請/.test(interfaceText)) {
      return "zhHant";
    }
    if (/重命名|置顶|钉选|邀请/.test(interfaceText)) {
      return "zhHans";
    }
    const language = document.documentElement.lang.toLowerCase();
    if (language.startsWith("zh-hant") || language.startsWith("zh-tw") || language.startsWith("zh-hk")) {
      return "zhHant";
    }
    if (language.startsWith("zh")) {
      return "zhHans";
    }
    return "en";
  }

  function translate(key, variables = {}, referenceText = "") {
    const messages = UI_MESSAGES[interfaceLocale(referenceText)] || UI_MESSAGES.en;
    const template = messages[key] || UI_MESSAGES.en[key] || key;
    return template.replace(/\{(\w+)\}/g, (_match, name) => String(variables[name] ?? ""));
  }

  function downloadLabel(referenceText = "") {
    return translate("download", {}, referenceText);
  }

  function applyUiTranslations() {
    const setText = (selector, key) => {
      const element = shadow.querySelector(selector);
      if (element) {
        element.textContent = translate(key);
      }
    };

    setText(".export-dialog-title", "downloadConversation");
    setText('[data-format="txt"] span:last-child', "plainText");
    setText('[data-format="pdf"] span:last-child', "pdfDocument");
    setText('[data-format="json"] span:last-child', "jsonData");
    setText(".highlight-action", "highlight");
    setText(".quote-action", "quote");
    setText(".color-label", "highlightColor");
    setText(".delete", "delete");
    setText(".cancel", "cancel");
    setText(".save", "save");

    exportCloseButton.setAttribute("aria-label", translate("close"));
    exportCloseButton.setAttribute("title", translate("close"));
    selectionMenu.setAttribute("aria-label", translate("textActions"));
    panel.setAttribute("aria-label", translate("editHighlight"));
    noteElement.placeholder = translate("notePlaceholder");
    noteElement.setAttribute("aria-label", translate("note"));
    shadow.querySelector(".color-row")?.setAttribute("aria-label", translate("highlightColor"));
    shadow.querySelectorAll(".swatch").forEach((swatch) => {
      const label = translate(swatch.dataset.color);
      swatch.setAttribute("aria-label", label);
      swatch.setAttribute("title", label);
    });
  }

  function hideNativeTooltip() {
    clearTimeout(nativeTooltipTimer);
    nativeTooltipTimer = null;
    nativeTooltip?.remove();
    nativeTooltip = null;
    document.querySelectorAll(`${NATIVE_EXPORT_SELECTOR}[aria-describedby="poe-notes-download-tooltip"]`)
      .forEach((control) => control.removeAttribute("aria-describedby"));
  }

  function showNativeTooltip(control, delay = 320) {
    hideNativeTooltip();
    nativeTooltipTimer = setTimeout(() => {
      nativeTooltipTimer = null;
      if (!document.contains(control) || control.disabled) {
        return;
      }

      const tooltip = document.createElement("div");
      tooltip.id = "poe-notes-download-tooltip";
      tooltip.dataset.poeNotesNativeTooltip = "true";
      tooltip.setAttribute("role", "tooltip");
      tooltip.textContent = downloadLabel();
      document.body.append(tooltip);
      nativeTooltip = tooltip;
      control.setAttribute("aria-describedby", tooltip.id);

      const controlRect = control.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const left = Math.min(
        Math.max(8, controlRect.left + (controlRect.width - tooltipRect.width) / 2),
        innerWidth - tooltipRect.width - 8
      );
      const top = Math.min(controlRect.bottom + 8, innerHeight - tooltipRect.height - 8);
      tooltip.style.left = `${Math.round(left)}px`;
      tooltip.style.top = `${Math.round(top)}px`;
    }, delay);
  }

  function attachNativeTooltip(control) {
    control.addEventListener("pointerenter", () => showNativeTooltip(control));
    control.addEventListener("pointerleave", hideNativeTooltip);
    control.addEventListener("focus", () => showNativeTooltip(control, 0));
    control.addEventListener("blur", hideNativeTooltip);
  }

  function closeExportDialog() {
    if (exportBackdrop.hidden) {
      return;
    }
    exportBackdrop.hidden = true;
    exportDialogReturnFocus?.focus?.({ preventScroll: true });
    exportDialogReturnFocus = null;
  }

  function openExportDialog() {
    if (exportPromise) {
      showToast(translate("exportInProgress"));
      return;
    }
    if (!document.querySelector(`${MESSAGE_SELECTOR} ${TEXT_SELECTOR}`)) {
      showToast(translate("openConversation"));
      return;
    }

    closeEditor();
    hideTooltip();
    exportDialogReturnFocus = document.activeElement;
    applyUiTranslations();
    exportBackdrop.hidden = false;
    requestAnimationFrame(() => exportCloseButton.focus({ preventScroll: true }));
  }

  function prepareNativeExportControl(control) {
    control.dataset.poeNotesNativeExport = "true";
    control.removeAttribute("id");
    control.removeAttribute("aria-controls");
    control.removeAttribute("aria-expanded");
    control.removeAttribute("data-state");
    control.removeAttribute("title");
    control.setAttribute("aria-label", downloadLabel());
    if (exportPromise) {
      control.setAttribute("aria-disabled", "true");
      if (control instanceof HTMLButtonElement) {
        control.disabled = true;
      }
    }
    control.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideNativeTooltip();
      const expandedButton = [...document.querySelectorAll('button[aria-expanded="true"]')]
        .find((button) => !button.matches(NATIVE_EXPORT_SELECTOR));
      expandedButton?.click();
      openExportDialog();
    });
    return control;
  }

  function setNativeExportBusy(busy) {
    if (busy) {
      hideNativeTooltip();
    }
    document.querySelectorAll(NATIVE_EXPORT_SELECTOR).forEach((control) => {
      control.toggleAttribute("aria-busy", busy);
      control.setAttribute("aria-disabled", String(busy));
      if (control instanceof HTMLButtonElement) {
        control.disabled = busy;
      }
    });
  }

  function installHeaderExportControl() {
    const actionGroup = document.querySelector(HEADER_ACTIONS_SELECTOR);
    if (!actionGroup) {
      return;
    }

    const existingButton = actionGroup.querySelector(NATIVE_EXPORT_SELECTOR);
    if (existingButton) {
      existingButton.dataset.poeNotesHeaderExport = "true";
      existingButton.removeAttribute("title");
      existingButton.querySelectorAll("span").forEach((label) => {
        label.classList.add("poe-notes-header-export-label");
      });
      return;
    }

    const template = [...actionGroup.children].find((child) => child instanceof HTMLButtonElement) ||
      actionGroup.querySelector("button");
    if (!template) {
      return;
    }

    const button = prepareNativeExportControl(template.cloneNode(false));
    button.dataset.poeNotesHeaderExport = "true";
    button.type = "button";
    button.innerHTML = DOWNLOAD_ICON;
    const nativeLabel = document.createElement("span");
    nativeLabel.className = template.querySelector('[class*="Button_label__"]')?.className || "";
    nativeLabel.classList.add("poe-notes-header-export-label");
    nativeLabel.textContent = downloadLabel();
    button.append(nativeLabel);
    attachNativeTooltip(button);
    actionGroup.insertBefore(button, actionGroup.firstElementChild);
  }

  function normalizedLabel(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function matchesAnyLabel(element, labels) {
    const text = normalizedLabel(element);
    return labels.some((label) => text === label || text.startsWith(`${label} `));
  }

  function installMenuExportControl() {
    const candidates = [...document.querySelectorAll(
      '[role="menuitem"], [role="menu"] button, [class*="DropdownMenu"] button'
    )].filter((element) => !element.matches(NATIVE_EXPORT_SELECTOR));
    const renameLabels = ["重新命名", "重新命名對話", "重命名", "重命名对话", "Rename", "Rename chat"];
    const pinLabels = [
      "釘選對話", "取消釘選對話", "置頂對話", "置顶对话", "钉选对话",
      "Pin chat", "Pin conversation", "Unpin chat", "Unpin conversation"
    ];
    const renameItem = candidates.find((element) => matchesAnyLabel(element, renameLabels));
    const pinItem = candidates.find((element) => matchesAnyLabel(element, pinLabels));
    if (!renameItem || !pinItem || renameItem.parentElement !== pinItem.parentElement) {
      return;
    }
    if (renameItem.parentElement.querySelector(NATIVE_EXPORT_SELECTOR)) {
      return;
    }

    const item = prepareNativeExportControl(renameItem.cloneNode(true));
    const menuDownloadLabel = translate("downloadConversation", {}, normalizedLabel(renameItem));
    item.removeAttribute("title");
    item.setAttribute("aria-label", menuDownloadLabel);
    item.querySelectorAll("[id], [aria-controls], [aria-expanded], [data-state]").forEach((element) => {
      element.removeAttribute("id");
      element.removeAttribute("aria-controls");
      element.removeAttribute("aria-expanded");
      element.removeAttribute("data-state");
    });
    const icon = item.querySelector("svg");
    if (icon) {
      icon.outerHTML = DOWNLOAD_ICON;
    }
    const textWalker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
    let textNode = textWalker.nextNode();
    let replacedLabel = false;
    while (textNode) {
      if (renameLabels.includes(textNode.data.trim())) {
        textNode.data = menuDownloadLabel;
        replacedLabel = true;
        break;
      }
      textNode = textWalker.nextNode();
    }
    if (!replacedLabel) {
      const label = item.querySelector("span") || item;
      label.textContent = menuDownloadLabel;
    }
    renameItem.parentElement.insertBefore(item, pinItem);
  }

  function scheduleNativeExportControls() {
    if (nativeInjectionTimer) {
      return;
    }
    nativeInjectionTimer = setTimeout(() => {
      nativeInjectionTimer = null;
      installHeaderExportControl();
      installMenuExportControl();
    }, 40);
  }

  function showTooltip(annotation, target) {
    if (!annotation.note || !panel.hidden || !selectionMenu.hidden) {
      return;
    }
    tooltip.textContent = annotation.note;
    tooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    requestAnimationFrame(() => {
      const tipRect = tooltip.getBoundingClientRect();
      const left = Math.min(Math.max(12, rect.left), innerWidth - tipRect.width - 12);
      const top = rect.top - tipRect.height - 7 >= 8
        ? rect.top - tipRect.height - 7
        : rect.bottom + 7;
      tooltip.style.left = `${Math.round(left)}px`;
      tooltip.style.top = `${Math.round(top)}px`;
    });
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function unwrapMarks(annotationId) {
    const selector = annotationId
      ? `[data-poe-notes-id="${CSS.escape(annotationId)}"]`
      : "[data-poe-notes-id]";
    document.querySelectorAll(selector).forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) {
        return;
      }
      parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
      parent.normalize();
    });
  }

  function locateTextRoot(annotation) {
    const message = annotation.messageId ? document.getElementById(annotation.messageId) : null;
    if (message) {
      return getTextRoot(message);
    }

    const candidates = document.querySelectorAll(`${MESSAGE_SELECTOR} ${TEXT_SELECTOR}`);
    for (const candidate of candidates) {
      const text = candidate.textContent || "";
      if (text.includes(annotation.quote)) {
        return candidate;
      }
    }
    return null;
  }

  function wrapOffsets(root, annotation, resolved) {
    const segments = [];
    let position = 0;

    for (const node of textNodes(root)) {
      const nodeStart = position;
      const nodeEnd = position + node.data.length;
      position = nodeEnd;

      if (nodeEnd <= resolved.start || nodeStart >= resolved.end) {
        continue;
      }

      segments.push({
        node,
        start: Math.max(0, resolved.start - nodeStart),
        end: Math.min(node.data.length, resolved.end - nodeStart)
      });
    }

    segments.forEach((segment, segmentIndex) => {
      if (segment.start >= segment.end || segment.node.parentElement?.closest("[data-poe-notes-id]")) {
        return;
      }
      const range = document.createRange();
      range.setStart(segment.node, segment.start);
      range.setEnd(segment.node, segment.end);
      const mark = document.createElement("mark");
      mark.dataset.poeNotesId = annotation.id;
      mark.dataset.poeNotesHighlight = annotation.color;
      mark.tabIndex = segmentIndex === 0 ? 0 : -1;
      mark.setAttribute(
        "aria-label",
        annotation.note
          ? translate("highlightedWithNote", { note: annotation.note })
          : translate("highlightedText")
      );
      range.surroundContents(mark);
    });
  }

  function applyAnnotation(annotation) {
    if (!settings.enabled || document.querySelector(`[data-poe-notes-id="${CSS.escape(annotation.id)}"]`)) {
      return;
    }

    const root = locateTextRoot(annotation);
    if (!root) {
      return;
    }

    const resolved = Anchor.resolveOffsets(root.textContent || "", annotation);
    if (!resolved) {
      return;
    }

    annotation.start = resolved.start;
    annotation.end = resolved.end;
    annotation.messageId = messageIdFor(root) || annotation.messageId;
    wrapOffsets(root, annotation, resolved);
  }

  function restoreAll() {
    clearTimeout(restoreTimer);
    restoreTimer = setTimeout(() => {
      if (!settings.enabled) {
        unwrapMarks();
        return;
      }
      annotations.forEach(applyAnnotation);
    }, 90);
  }

  async function saveDraft() {
    if (!draft) {
      return;
    }

    const now = new Date().toISOString();
    if (draft.mode === "edit") {
      const annotation = annotations.find((item) => item.id === draft.id);
      if (!annotation) {
        closeEditor();
        return;
      }
      annotation.note = noteElement.value.trim();
      annotation.color = draft.color;
      annotation.updatedAt = now;
      unwrapMarks(annotation.id);
      applyAnnotation(annotation);
    } else {
      const annotation = {
        id: crypto.randomUUID(),
        messageId: draft.messageId,
        start: draft.start,
        end: draft.end,
        quote: draft.quote,
        prefix: draft.prefix,
        suffix: draft.suffix,
        color: draft.color,
        note: noteElement.value.trim(),
        createdAt: now,
        updatedAt: now
      };
      annotations.push(annotation);
      applyAnnotation(annotation);
    }

    await persistAnnotations();
    closeEditor();
  }

  async function deleteDraft() {
    if (!draft || draft.mode !== "edit") {
      return;
    }
    const id = draft.id;
    annotations = annotations.filter((annotation) => annotation.id !== id);
    unwrapMarks(id);
    await persistAnnotations();
    closeEditor();
  }

  function markdownQuote(text) {
    return text
      .trim()
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line ? `> ${line}` : ">")
      .join("\n");
  }

  function findComposer() {
    const candidates = document.querySelectorAll(
      'textarea[class*="GrowingTextArea_textArea__"], [class*="ChatMessageInputContainer_inputContainer__"] textarea'
    );

    return [...candidates].find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return !candidate.disabled && !candidate.readOnly && rect.width > 0 && rect.height > 0;
    }) || null;
  }

  function prependQuoteToComposer() {
    if (!draft) {
      return;
    }

    const composer = findComposer();
    if (!composer) {
      showToast(translate("composerMissing"));
      return;
    }

    const quoteBlock = markdownQuote(draft.quote);
    const insertion = `${quoteBlock}\n\n`;
    const currentValue = composer.value;
    const selectionStart = composer.selectionStart ?? currentValue.length;
    const selectionEnd = composer.selectionEnd ?? selectionStart;
    const scrollTop = composer.scrollTop;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;

    if (valueSetter) {
      valueSetter.call(composer, insertion + currentValue);
    } else {
      composer.value = insertion + currentValue;
    }

    composer.closest('[class*="GrowingTextArea_growWrap__"]')
      ?.setAttribute("data-replicated-value", composer.value);
    composer.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: insertion
    }));

    closeEditor();
    requestAnimationFrame(() => {
      composer.focus({ preventScroll: true });
      composer.setSelectionRange(selectionStart + insertion.length, selectionEnd + insertion.length);
      composer.scrollTop = scrollTop;
    });
    showToast(translate("quoteAdded"));
  }

  function findScrollContainer() {
    const preferred = document.querySelector(SCROLL_CONTAINER_SELECTOR);
    if (preferred) {
      return preferred;
    }

    const message = document.querySelector(MESSAGE_SELECTOR);
    let candidate = message?.parentElement || null;
    while (candidate && candidate !== document.body) {
      const style = getComputedStyle(candidate);
      if (/auto|scroll/.test(style.overflowY) && candidate.scrollHeight > candidate.clientHeight) {
        return candidate;
      }
      candidate = candidate.parentElement;
    }
    return null;
  }

  function messageAuthor(messageRoot) {
    if (messageRoot.querySelector(RIGHT_MESSAGE_SELECTOR)) {
      return interfaceLocale() === "en" ? "You" : "你";
    }

    const botName = messageRoot.querySelector(BOT_NAME_SELECTOR)?.textContent?.trim();
    if (botName) {
      return botName;
    }

    const avatarName = messageRoot.querySelector('img[alt*=" Bot"]')?.alt
      ?.replace(/\s+Bot(?:\s+avatar)?\s*$/i, "")
      .trim();
    return avatarName || (interfaceLocale() === "zhHant" ? "助理" : interfaceLocale() === "zhHans" ? "助手" : "Assistant");
  }

  function collectExportMessages(records) {
    const roots = [...document.querySelectorAll(MESSAGE_SELECTOR)];
    for (const root of roots) {
      const textRoot = getTextRoot(root);
      const text = textRoot?.innerText?.trim() || textRoot?.textContent?.trim();
      if (!text) {
        continue;
      }
      records.set(root.id, {
        id: root.id,
        author: messageAuthor(root),
        text,
        markdown: markdownConverter
          ? markdownConverter.turndown(textRoot.innerHTML).trim()
          : text
      });
    }
    return roots.filter((root) => getTextRoot(root));
  }

  function historySignature() {
    const messages = [...document.querySelectorAll(MESSAGE_SELECTOR)]
      .filter((root) => getTextRoot(root));
    return `${messages[0]?.id || "none"}:${messages.length}`;
  }

  function waitForHistoryProgress(previousSignature, scrollContainer) {
    return new Promise((resolve) => {
      let observer;
      let pollTimer;
      let timeoutTimer;

      const finish = (changed) => {
        observer?.disconnect();
        clearInterval(pollTimer);
        clearTimeout(timeoutTimer);
        resolve(changed);
      };
      const check = () => {
        if (!document.contains(scrollContainer)) {
          finish(false);
        } else if (historySignature() !== previousSignature) {
          finish(true);
        }
      };

      observer = new MutationObserver(check);
      observer.observe(scrollContainer, { childList: true, subtree: true });
      pollTimer = setInterval(check, 120);
      timeoutTimer = setTimeout(() => finish(false), EXPORT_PROGRESS_TIMEOUT);
    });
  }

  function captureScrollPosition(scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const anchor = [...document.querySelectorAll(MESSAGE_SELECTOR)].find((message) => {
      const rect = message.getBoundingClientRect();
      return rect.bottom > containerRect.top && rect.top < containerRect.bottom;
    });
    return {
      id: anchor?.id || "",
      offset: anchor ? anchor.getBoundingClientRect().top - containerRect.top : 0,
      scrollTop: scrollContainer.scrollTop
    };
  }

  function restoreScrollPosition(scrollContainer, position) {
    const anchor = position.id ? document.getElementById(position.id) : null;
    if (!anchor) {
      scrollContainer.scrollTop = position.scrollTop;
      return;
    }

    anchor.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
    const delta = anchor.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top - position.offset;
    scrollContainer.scrollBy({ top: delta, left: 0, behavior: "instant" });
  }

  function scrollToHistoryStart(scrollContainer) {
    const trigger = scrollContainer.querySelector(PAGING_TRIGGER_SELECTOR) ||
      document.querySelector(PAGING_TRIGGER_SELECTOR);
    const firstMessage = document.querySelector(MESSAGE_SELECTOR);
    const target = trigger || firstMessage;
    target?.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
  }

  function hasHistoryLoadError(scrollContainer) {
    return Boolean(scrollContainer.querySelector('[class*="PaginationNetworkError_"]'));
  }

  function isHistoryLoading(scrollContainer) {
    return Boolean(scrollContainer.querySelector(
      '[aria-busy="true"], [class*="InfiniteScroll_"] [class*="LoadingIndicator_"]'
    ));
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  async function exportFullConversation(format = "md") {
    format = ["md", "txt", "pdf", "json"].includes(format) ? format : "md";
    const scrollContainer = findScrollContainer();
    if (!scrollContainer) {
      throw new Error(translate("openConversation"));
    }

    const records = new Map();
    const originalPosition = captureScrollPosition(scrollContainer);
    const exportPageKey = Anchor.canonicalPageKey(location.href);
    let stableRounds = 0;
    let rounds = 0;

    closeEditor();
    collectExportMessages(records);
    showToast(translate("loadingHistory", { count: records.size }), true);

    try {
      while (stableRounds < EXPORT_STABLE_ROUNDS && rounds < EXPORT_MAX_ROUNDS) {
        if (
          !document.contains(scrollContainer) ||
          Anchor.canonicalPageKey(location.href) !== exportPageKey
        ) {
          throw new Error(translate("conversationChanged"));
        }
        const signature = historySignature();
        const progressPromise = waitForHistoryProgress(signature, scrollContainer);
        scrollToHistoryStart(scrollContainer);
        const changed = await progressPromise;
        collectExportMessages(records);
        if (hasHistoryLoadError(scrollContainer)) {
          throw new Error(translate("historyLoadFailed"));
        }
        stableRounds = changed || isHistoryLoading(scrollContainer) ? 0 : stableRounds + 1;
        rounds += 1;
        showToast(translate("loadingHistory", { count: records.size }), true);
      }

      if (rounds >= EXPORT_MAX_ROUNDS) {
        throw new Error(translate("historyTooLong"));
      }

      collectExportMessages(records);
      const title = Export.conversationTitle(document.title);
      const exportedAt = new Date().toISOString();
      const messages = Export.sortMessages([...records.values()]);
      const payload = {
        title,
        url: location.href,
        exportedAt,
        messages
      };
      const filename = Export.safeFilename(title, format);
      let blob;

      if (format === "pdf") {
        showToast(translate("creatingPdf", { count: records.size }), true);
        blob = await Pdf.createPdfBlob(payload);
      } else if (format === "txt") {
        blob = new Blob([Export.renderText(payload)], { type: "text/plain;charset=utf-8" });
      } else if (format === "json") {
        blob = new Blob([Export.renderJson(payload)], { type: "application/json;charset=utf-8" });
      } else {
        blob = new Blob([Export.renderMarkdown(payload)], { type: "text/markdown;charset=utf-8" });
      }

      downloadBlob(blob, filename);
      showToast(translate("exported", { count: records.size, format: format.toUpperCase() }));
      return { ok: true, count: records.size, filename, format };
    } finally {
      if (document.contains(scrollContainer)) {
        restoreScrollPosition(scrollContainer, originalPosition);
      }
    }
  }

  function requestConversationExport(format = "md") {
    if (!exportPromise) {
      exportPromise = exportFullConversation(format).finally(() => {
        exportPromise = null;
        setNativeExportBusy(false);
      });
      setNativeExportBusy(true);
    }
    return exportPromise;
  }

  function startHighlight() {
    if (!draft) {
      return;
    }
    if (draft.overlapsHighlight) {
      closeEditor();
      showToast(translate("overlap"));
      return;
    }
    openEditor(draft);
  }

  function editAnnotation(annotationId, target) {
    const annotation = annotations.find((item) => item.id === annotationId);
    if (!annotation) {
      return;
    }
    const rects = document.querySelectorAll(`[data-poe-notes-id="${CSS.escape(annotationId)}"]`);
    const firstRect = rects[0]?.getBoundingClientRect() || target.getBoundingClientRect();
    const lastRect = rects[rects.length - 1]?.getBoundingClientRect() || firstRect;
    const rect = {
      left: Math.min(firstRect.left, lastRect.left),
      right: Math.max(firstRect.right, lastRect.right),
      top: Math.min(firstRect.top, lastRect.top),
      bottom: Math.max(firstRect.bottom, lastRect.bottom),
      width: Math.max(firstRect.right, lastRect.right) - Math.min(firstRect.left, lastRect.left),
      height: Math.max(firstRect.bottom, lastRect.bottom) - Math.min(firstRect.top, lastRect.top)
    };
    openEditor({ ...annotation, mode: "edit", rect });
  }

  function syncTheme() {
    const background = getComputedStyle(document.body).backgroundColor;
    const channels = background.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [];
    const luminance = channels.length === 3
      ? (channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722)
      : 0;
    const dark = document.documentElement.classList.contains("dark") ||
      document.documentElement.dataset.immersiveTranslatePageTheme === "dark" ||
      (channels.length === 3 ? luminance < 140 : matchMedia("(prefers-color-scheme: dark)").matches);
    host.dataset.theme = dark ? "dark" : "light";
    applyUiTranslations();
  }

  function handleRouteChange() {
    clearTimeout(routeTimer);
    routeTimer = setTimeout(async () => {
      const nextKey = Anchor.canonicalPageKey(location.href);
      if (nextKey === pageKey) {
        return;
      }
      closeEditor();
      closeExportDialog();
      hideNativeTooltip();
      hideTooltip();
      unwrapMarks();
      pageKey = nextKey;
      await loadState();
    }, 120);
  }

  function installRouteWatcher() {
    for (const methodName of ["pushState", "replaceState"]) {
      const original = history[methodName];
      history[methodName] = function wrappedHistoryMethod(...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event("poe-notes-route-change"));
        return result;
      };
    }
    addEventListener("popstate", handleRouteChange);
    addEventListener("poe-notes-route-change", handleRouteChange);
  }

  document.addEventListener("pointerup", (event) => {
    if (!settings.enabled || event.button !== 0 || event.composedPath().includes(host)) {
      return;
    }
    if (
      event.target instanceof Element &&
      event.target.closest("[data-poe-notes-id]") &&
      document.getSelection()?.isCollapsed
    ) {
      return;
    }
    setTimeout(() => {
      const nextDraft = selectionDraft();
      if (nextDraft?.error) {
        showToast(nextDraft.error);
      } else if (nextDraft) {
        showSelectionMenu(nextDraft);
      }
    }, 0);
  }, true);

  document.addEventListener("click", (event) => {
    const mark = event.target instanceof Element ? event.target.closest("[data-poe-notes-id]") : null;
    if (mark) {
      event.preventDefault();
      event.stopPropagation();
      editAnnotation(mark.dataset.poeNotesId, mark);
      return;
    }
    if ((!panel.hidden || !selectionMenu.hidden) && !event.composedPath().includes(host)) {
      closeEditor();
    }
  }, true);

  document.addEventListener("pointerover", (event) => {
    const mark = event.target instanceof Element ? event.target.closest("[data-poe-notes-id]") : null;
    if (!mark) {
      return;
    }
    const annotation = annotations.find((item) => item.id === mark.dataset.poeNotesId);
    if (annotation) {
      showTooltip(annotation, mark);
    }
  }, true);

  document.addEventListener("pointerout", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-poe-notes-id]")) {
      hideTooltip();
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    const mark = event.target instanceof Element ? event.target.closest("[data-poe-notes-id]") : null;
    if (mark && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      editAnnotation(mark.dataset.poeNotesId, mark);
      return;
    }
    if (event.key === "Escape" && !exportBackdrop.hidden) {
      event.preventDefault();
      closeExportDialog();
      return;
    }
    if (event.key === "Escape" && (!panel.hidden || !selectionMenu.hidden)) {
      event.preventDefault();
      closeEditor();
    }
  }, true);

  shadow.addEventListener("click", (event) => {
    const formatOption = event.target.closest(".format-option");
    if (formatOption) {
      const format = formatOption.dataset.format;
      closeExportDialog();
      requestConversationExport(format).catch((error) => {
        const reason = error instanceof Error ? error.message : translate("exportFailed");
        showToast(reason);
      });
      return;
    }
    if (event.target.closest(".export-close") || event.target === exportBackdrop) {
      closeExportDialog();
      return;
    }
    if (event.target.closest(".highlight-action")) {
      startHighlight();
      return;
    }
    if (event.target.closest(".quote-action")) {
      prependQuoteToComposer();
      return;
    }
    const swatch = event.target.closest(".swatch");
    if (swatch) {
      setSelectedColor(swatch.dataset.color);
      return;
    }
    if (event.target.closest(".save")) {
      saveDraft();
    } else if (event.target.closest(".cancel")) {
      closeEditor();
    } else if (event.target.closest(".delete")) {
      deleteDraft();
    }
  });

  shadow.addEventListener("keydown", (event) => {
    if (!exportBackdrop.hidden && event.key === "Escape") {
      event.preventDefault();
      closeExportDialog();
      return;
    }
    if (!exportBackdrop.hidden && event.key === "Tab") {
      const focusable = [...exportDialog.querySelectorAll("button:not(:disabled)")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && shadow.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && shadow.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      saveDraft();
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }
    if (changes[SETTINGS_KEY]) {
      settings = { enabled: true, ...(changes[SETTINGS_KEY].newValue || {}) };
      if (!settings.enabled) {
        closeEditor();
        unwrapMarks();
      } else {
        restoreAll();
      }
    }
    const key = storageKey();
    if (changes[key]) {
      annotations = Array.isArray(changes[key].newValue) ? changes[key].newValue : [];
      unwrapMarks();
      restoreAll();
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "POE_NOTES_GET_STATE") {
      sendResponse({
        enabled: settings.enabled,
        count: annotations.length,
        messageCount: document.querySelectorAll(`${MESSAGE_SELECTOR} ${TEXT_SELECTOR}`).length,
        exporting: Boolean(exportPromise),
        pageKey
      });
      return;
    }
    if (message?.type === "POE_NOTES_OPEN_EXPORT_DIALOG") {
      openExportDialog();
      sendResponse({ ok: true });
      return;
    }
    if (message?.type === "POE_NOTES_EXPORT_CONVERSATION") {
      requestConversationExport(message.format || "md")
        .then(sendResponse)
        .catch((error) => {
          const reason = error instanceof Error ? error.message : translate("exportFailed");
          showToast(reason);
          sendResponse({ ok: false, error: reason });
        });
      return true;
    }
    if (message?.type === "POE_NOTES_CLEAR_PAGE") {
      annotations = [];
      unwrapMarks();
      persistAnnotations().then(() => sendResponse({ ok: true }));
      return true;
    }
    if (message?.type === "POE_NOTES_SET_ENABLED") {
      settings.enabled = Boolean(message.enabled);
      if (!settings.enabled) {
        closeEditor();
        unwrapMarks();
      } else {
        restoreAll();
      }
      storageSet({ [SETTINGS_KEY]: settings }).then(() => sendResponse({ ok: true }));
      return true;
    }
  });

  observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => (
      mutation.target instanceof Element && mutation.target.closest("#poe-notes-ui")
    ))) {
      return;
    }
    handleRouteChange();
    syncTheme();
    scheduleNativeExportControls();
    restoreAll();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  installRouteWatcher();
  scheduleNativeExportControls();
  loadState();
})();
