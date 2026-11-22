import { describe, expect, it } from 'vitest';
import { creditUrls, parseCredits } from './credits';

const MD = `# Credits

| File | Source | Typeset by | License |
| --- | --- | --- | --- |
| [advanced/Bach - Fugue in C minor, BWV 847.mid](https://m.org/p?id=1941) <!-- mutopia-1941 --> | [The Mutopia Project](https://m.org/) | Urs Metzger | [CC BY-SA 4.0](https://cc.org/by-sa/4.0/) |
| [beginner/Schumann - Album for the Young, Op. 68 No. 1 - Mélodie.mid](https://m.org/p?id=7) <!-- mutopia-7 --> | [The Mutopia Project](https://m.org/) | Someone | Public Domain |
`;

describe('parseCredits', () => {
  it('reads each table row, skipping the header', () => {
    const credits = parseCredits(MD);
    expect(credits).toEqual([
      {
        file: 'advanced/Bach - Fugue in C minor, BWV 847.mid',
        title: 'Bach: Fugue in C minor, BWV 847',
        page: 'https://m.org/p?id=1941',
        source: 'The Mutopia Project',
        sourceUrl: 'https://m.org/',
        credit: 'Urs Metzger',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://cc.org/by-sa/4.0/',
      },
      expect.objectContaining({
        title: 'Schumann: Album for the Young, Op. 68 No. 1 - Mélodie',
        license: 'Public Domain',
        licenseUrl: null,
      }),
    ]);
  });

  it('returns nothing for text without a table', () => {
    expect(parseCredits('# Credits\n\nNone yet.')).toEqual([]);
  });

  it('collects every linkable URL', () => {
    const urls = creditUrls(parseCredits(MD));
    expect(urls.has('https://m.org/p?id=7')).toBe(true);
    expect(urls.has('https://cc.org/by-sa/4.0/')).toBe(true);
    expect(urls.has('https://evil.example/')).toBe(false);
  });
});
