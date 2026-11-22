import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { creditUrls, parseCredits, type SongCredit } from '@shared/credits';
import { resourcesDir } from './paths';

let cached: Promise<SongCredit[]> | null = null;

export const loadCredits = (): Promise<SongCredit[]> =>
  (cached ??= readFile(join(resourcesDir(), 'songs', 'CREDITS.md'), 'utf8')
    .then(parseCredits)
    .catch(() => []));

export const isCreditUrl = async (url: string): Promise<boolean> =>
  creditUrls(await loadCredits()).has(url);
