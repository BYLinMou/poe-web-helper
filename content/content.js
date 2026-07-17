(function startPoeNotes() {
  "use strict";

  if (globalThis.__poeNotesLoaded) {
    return;
  }
  globalThis.__poeNotesLoaded = true;

  const Anchor = globalThis.PoeNotesAnchor;
  const STORAGE_PREFIX = "poe-notes:page:";
  const SETTINGS_KEY = "poe-notes:settings";
  const MESSAGE_SELECTOR = '[id^="message-"]';
  const TEXT_SELECTOR = '[class*="Message_selectableText__"]';
  const COLORS = ["yellow", "green", "blue", "pink", "purple"];
  const CONTEXT_LENGTH = 40;
  const MAX_QUOTE_LENGTH = 12000;
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
      --shadow: 0 18px 48px rgba(31, 36, 43, 0.18), 0 2px 10px rgba(31, 36, 43, 0.12);
      color-scheme: light;
    }

    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .selection-menu {
      position: fixed;
      z-index: 2;
      display: flex;
      padding: 3px;
      color: var(--text);
      background: var(--panel);
      border: 1px solid var(--border);
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

    .selection-action + .selection-action { border-left: 1px solid var(--border); border-radius: 0 4px 4px 0; }
    .selection-action:hover { background: var(--panel-raised); }
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
      left: 50%;
      bottom: 24px;
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

  const host = document.createElement("div");
  host.id = "poe-notes-ui";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${UI_STYLES}</style>
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
      return { error: "Select text within one Poe message." };
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
      return { error: "Select a shorter passage." };
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

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
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
      mark.setAttribute("aria-label", annotation.note ? `Highlighted text. Note: ${annotation.note}` : "Highlighted text");
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
      showToast("Open a Poe conversation with a message box.");
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
    showToast("Quote added to the Poe message box.");
  }

  function startHighlight() {
    if (!draft) {
      return;
    }
    if (draft.overlapsHighlight) {
      closeEditor();
      showToast("This selection overlaps an existing highlight.");
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
  }

  function handleRouteChange() {
    clearTimeout(routeTimer);
    routeTimer = setTimeout(async () => {
      const nextKey = Anchor.canonicalPageKey(location.href);
      if (nextKey === pageKey) {
        return;
      }
      closeEditor();
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
    if (event.key === "Escape" && (!panel.hidden || !selectionMenu.hidden)) {
      event.preventDefault();
      closeEditor();
    }
  }, true);

  shadow.addEventListener("click", (event) => {
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
      sendResponse({ enabled: settings.enabled, count: annotations.length, pageKey });
      return;
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
    restoreAll();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  installRouteWatcher();
  loadState();
})();
