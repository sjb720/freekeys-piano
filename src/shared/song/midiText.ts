const PLACEHOLDER =
  /^(control track|untitled|unnamed|no ?name|new (song|track|sequence)|sequence|song|track|midi|seq)[\s_-]*\d*$/i;

const UTF8 = new TextDecoder('utf-8', { fatal: true });

const codes = (text: string) => Array.from(text, (c) => c.charCodeAt(0));
const isControl = (code: number) => code < 0x20 || code === 0x7f;

// midi-file decodes meta text one byte per character, but most non-Latin files store UTF-8.
export function decodeMidiText(raw: string): string {
  let text = raw;
  const bytes = codes(raw);
  if (bytes.some((b) => b >= 0x80) && bytes.every((b) => b <= 0xff)) {
    try {
      text = UTF8.decode(Uint8Array.from(bytes));
    } catch {
      text = raw;
    }
  }
  return Array.from(text, (c) => (isControl(c.charCodeAt(0)) ? ' ' : c))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

export const isPlaceholderTitle = (title: string): boolean =>
  !/[\p{L}\p{N}]/u.test(title) || PLACEHOLDER.test(title);
