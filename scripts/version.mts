export type Bump = 'patch' | 'minor' | 'major';

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseVersion(version: string): [number, number, number] {
  const match = SEMVER.exec(version.trim().replace(/^v/, ''));
  if (!match) throw new Error(`"${version}" is not a version like 1.2.3.`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function bumpVersion(version: string, bump: Bump): string {
  const [major, minor, patch] = parseVersion(version);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i]! - pb[i]!;
  return 0;
}
