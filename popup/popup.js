(function startPopup() {
  "use strict";

  const status = document.querySelector(".status");
  const statusLabel = document.querySelector(".status-label");
  const summary = document.querySelector(".summary");
  const count = document.querySelector(".count");
  const toggle = document.querySelector(".toggle");
  const clearButton = document.querySelector(".clear");
  let activeTabId = null;

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  }

  function send(message) {
    return chrome.tabs.sendMessage(activeTabId, message);
  }

  function showUnsupported() {
    status.className = "status unsupported";
    statusLabel.textContent = "Open a conversation on poe.com";
    summary.hidden = true;
    toggle.disabled = true;
    clearButton.disabled = true;
  }

  async function refresh() {
    const tab = await getActiveTab();
    if (!tab?.id || !/^https:\/\/(www\.)?poe\.com\//.test(tab.url || "")) {
      showUnsupported();
      return;
    }

    activeTabId = tab.id;
    try {
      const state = await send({ type: "POE_NOTES_GET_STATE" });
      status.className = "status ready";
      statusLabel.textContent = state.enabled ? "Ready on this Poe page" : "Highlights are paused";
      summary.hidden = false;
      count.textContent = String(state.count);
      toggle.checked = state.enabled;
      toggle.disabled = false;
      clearButton.disabled = state.count === 0;
    } catch (_error) {
      showUnsupported();
    }
  }

  toggle.addEventListener("change", async () => {
    if (!activeTabId) {
      return;
    }
    await send({ type: "POE_NOTES_SET_ENABLED", enabled: toggle.checked });
    statusLabel.textContent = toggle.checked ? "Ready on this Poe page" : "Highlights are paused";
  });

  clearButton.addEventListener("click", async () => {
    if (!activeTabId || !confirm("Delete all highlights saved for this page?")) {
      return;
    }
    await send({ type: "POE_NOTES_CLEAR_PAGE" });
    count.textContent = "0";
    clearButton.disabled = true;
  });

  refresh();
})();
