# Poe Notes

Poe Notes is a local Chrome extension for highlighting passages in Poe conversations and attaching private notes. Highlights are saved in `chrome.storage.local`; they are not sent to Poe or any other service.

## Install in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository folder.

Open a conversation on `https://poe.com` and select text inside one message. Choose **Highlight** to add a color and optional note, or choose **Quote** to prepend the passage as a Markdown blockquote in Poe's message box without replacing your existing draft. Click a saved highlight to edit or delete it. Notes appear on hover, and the toolbar popup can pause the extension or clear the current page.

## Development checks

```powershell
node --check content/anchor.js
node --check content/content.js
node --check popup/popup.js
node tests/anchor.test.cjs
```

There is no build step and no virtual environment is required.
