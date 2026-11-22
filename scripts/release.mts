import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { bumpVersion, compareVersions, parseVersion, type Bump } from './version.mts';

const BUMPS: Bump[] = ['patch', 'minor', 'major'];
const args = process.argv.slice(2);
const skipChecks = args.includes('--skip-checks');
const choiceArg = args.find((a) => !a.startsWith('--'));

const git = (...a: string[]) =>
  execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const run = (cmd: string, ...a: string[]) =>
  execFileSync(cmd, a, { stdio: 'inherit', shell: process.platform === 'win32' });
const fail = (message: string): never => {
  console.error(`\n✖ ${message}`);
  process.exit(1);
};
const tagExists = (tag: string) => git('tag', '--list', tag) === tag;

const rl = createInterface({ input: stdin, output: stdout });
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string): Promise<string> {
  stdout.write(question);
  const { value, done } = await lines.next();
  return done ? '' : String(value).trim();
}

async function pickVersion(current: string): Promise<string> {
  const options = [
    ...(tagExists(`v${current}`) ? [] : [{ key: 'current', version: current }]),
    ...BUMPS.map((b) => ({ key: b, version: bumpVersion(current, b) })),
  ];
  if (choiceArg) {
    const hit = options.find((o) => o.key === choiceArg);
    return hit ? hit.version : choiceArg;
  }
  console.log(`\nCurrent version: ${current}\n`);
  options.forEach((o, i) => console.log(`  ${i + 1}) ${o.key.padEnd(8)} ${o.version}`));
  console.log(`  ${options.length + 1}) custom`);
  const answer = await ask('\nRelease which version? ');
  const index = Number(answer) - 1;
  if (options[index]) return options[index].version;
  if (index === options.length) return await ask('Version (x.y.z): ');
  return answer;
}

async function main(): Promise<void> {
  if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main') fail('Switch to main first.');
  if (git('status', '--porcelain')) fail('Commit or stash your changes first.');
  git('fetch', 'origin', 'main', '--tags');
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) {
    fail('main is not in sync with origin/main. Pull or push first.');
  }

  const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
  const current = pkg.version;
  const next = (await pickVersion(current)).replace(/^v/, '');
  parseVersion(next);
  if (compareVersions(next, current) < 0) fail(`${next} is lower than ${current}.`);
  const tag = `v${next}`;
  if (tagExists(tag)) fail(`Tag ${tag} already exists.`);

  if (!skipChecks) {
    console.log('\nRunning checks…');
    run('pnpm', 'lint');
    run('pnpm', 'typecheck');
    run('pnpm', 'test');
  }

  if (next !== current) {
    writeFileSync(
      'package.json',
      readFileSync('package.json', 'utf8').replace(
        `"version": "${current}"`,
        `"version": "${next}"`,
      ),
    );
    git('add', 'package.json');
    git('commit', '-m', `Release ${tag}`);
  }
  git('tag', '-a', tag, '-m', `Release ${tag}`);
  console.log(`\nCreated ${tag}${next === current ? '' : ' and its release commit'}.`);

  const confirm = await ask(`Push main and ${tag} to origin to publish? (y/N) `);
  if (!/^y(es)?$/i.test(confirm)) {
    console.log(`Not pushed. Push later with: git push origin main ${tag}`);
    console.log(
      `Or undo with: git tag -d ${tag}${next === current ? '' : ' && git reset --hard HEAD~1'}`,
    );
    return;
  }
  run('git', 'push', '--atomic', 'origin', 'main', tag);
  console.log(`\n✔ Pushed ${tag}. The Release workflow will publish it on GitHub.`);
}

main()
  .catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)))
  .finally(() => rl.close());
