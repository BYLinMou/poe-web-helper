# Poe Notes

Poe Notes is a local Chrome extension for highlighting passages in Poe conversations and attaching private notes. Highlights are saved in `chrome.storage.local`; they are not sent to Poe or any other service.

## Install in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository folder.

Open a conversation on `https://poe.com` and select text inside one message. Choose **Highlight** to add a color and optional note, or choose **Quote** to prepend the passage as a Markdown blockquote in Poe's message box without replacing your existing draft. Click a saved highlight to edit or delete it. Notes appear on hover.

Use the bookmark control to the left of the download button to browse highlights in conversation order. Selecting an item loads earlier messages when needed and jumps to the saved passage.

Download controls are added to the left of Poe's header actions and between **Rename** and **Pin chat** in the conversation menu. Either control opens a format picker for Markdown, plain text, PDF, or JSON. Before creating the file, Poe Notes repeatedly loads earlier messages until the beginning of the conversation is reached.

## Development checks

```powershell
node --check content/anchor.js
node --check content/export.js
node --check content/pdf.js
node --check content/content.js
node --check popup/popup.js
node tests/anchor.test.cjs
node tests/export.test.cjs
node tests/pdf.test.cjs
node tests/locales.test.cjs
```

There is no build step and no virtual environment is required.

Vendored dependencies are Turndown 7.2.4, turndown-plugin-gfm 1.0.2, and jsPDF 4.2.1. Their MIT licenses are included in `vendor/`.
