export type SongCredit = {
  file: string;
  title: string;
  page: string;
  source: string;
  sourceUrl: string;
  credit: string;
  license: string;
  licenseUrl: string | null;
};

export const SAMPLE_CREDIT = {
  title: 'Salamander Grand Piano V3',
  credit: 'Alexander Holm',
  license: 'CC BY 3.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
} as const;

const LINK = /^\[(.+)\]\((\S+)\)$/;
const COMMENT = /\s*<!--.*?-->\s*/g;

const link = (cell: string) => {
  const match = cell.replace(COMMENT, '').trim().match(LINK);
  return match ? { text: match[1]!, url: match[2]! } : { text: cell.trim(), url: null };
};

// "advanced/Bach - Fugue in C major.mid" reads as "Bach: Fugue in C major", matching the embedded title.
const titleOf = (file: string) =>
  file
    .replace(/^.*\//, '')
    .replace(/\.midi?$/i, '')
    .replace(' - ', ': ');

export function parseCredits(markdown: string): SongCredit[] {
  const credits: SongCredit[] = [];
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1);
    if (cells.length !== 4) continue;
    const [file, source, credit, license] = cells.map(link) as [
      ReturnType<typeof link>,
      ReturnType<typeof link>,
      ReturnType<typeof link>,
      ReturnType<typeof link>,
    ];
    if (!file.url || !source.url) continue;
    credits.push({
      file: file.text,
      title: titleOf(file.text),
      page: file.url,
      source: source.text,
      sourceUrl: source.url,
      credit: credit.text,
      license: license.text,
      licenseUrl: license.url,
    });
  }
  return credits;
}

export const creditUrls = (credits: readonly SongCredit[]): Set<string> =>
  new Set([
    SAMPLE_CREDIT.licenseUrl,
    ...credits.flatMap((c) => [c.page, c.sourceUrl, ...(c.licenseUrl ? [c.licenseUrl] : [])]),
  ]);
