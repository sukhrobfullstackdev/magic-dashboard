function clipboardSupported() {
  return navigator.clipboard != null;
}

function clipboardCopySupported() {
  return document.queryCommandSupported?.('copy') ?? false;
}

function isIOS() {
  return navigator.userAgent.match(/ipad|iphone/i) != null;
}

function copy(text: string) {
  const focusingContainer = document.body;

  const textArea = document.createElement('textArea') as HTMLTextAreaElement;
  textArea.value = text;
  textArea.contentEditable = 'true';
  textArea.readOnly = false;
  textArea.style.userSelect = 'text';
  textArea.style.webkitUserSelect = 'text';
  focusingContainer.insertBefore(textArea, focusingContainer.firstChild);
  if (isIOS()) {
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection();

    if (selection !== null) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    textArea.setSelectionRange(0, 999999);
  } else {
    textArea.select();
  }
  document.execCommand('copy');
  focusingContainer.removeChild(textArea);
}

function copyToClipboard(text: string): boolean {
  if (!clipboardCopySupported()) {
    return false;
  }

  copy(text);
  return true;
}

async function writeText(text = ''): Promise<boolean> {
  if (!clipboardSupported()) {
    return copyToClipboard(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyToClipboard(text);
  }
}

export const clipboard = {
  writeText,
};
