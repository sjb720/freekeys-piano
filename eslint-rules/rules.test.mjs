import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noColorLiterals from './no-color-literals.mjs';
import noRawElements from './no-raw-elements.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

tester.run('no-color-literals', noColorLiterals, {
  valid: [
    "const route = '#/library';",
    "const key = { color: 'white' === kind };",
    "type = 'white';",
    "const style = { color: 'var(--color-text)' };",
    'const mask = 0xff;',
    "const s = 'red herring';",
  ],
  invalid: [
    { code: "const c = '#ff0000';", errors: [{ messageId: 'literal' }] },
    { code: "const c = 'rgba(0, 0, 0, 0.5)';", errors: [{ messageId: 'literal' }] },
    { code: 'const c = `oklch(${l} 0.1 200)`;', errors: [{ messageId: 'literal' }] },
    { code: 'const tint = 0xff8800;', errors: [{ messageId: 'literal' }] },
    { code: "const s = { backgroundColor: 'red' };", errors: [{ messageId: 'literal' }] },
    { code: "const s = { border: '1px solid black' };", errors: [{ messageId: 'literal' }] },
    { code: '<svg fill="white" />;', errors: [{ messageId: 'literal' }] },
  ],
});

tester.run('no-raw-elements', noRawElements, {
  valid: ['<div />;', '<Button />;', '<span>hi</span>;'],
  invalid: [
    { code: '<button>go</button>;', errors: [{ messageId: 'raw' }] },
    { code: '<input />;', errors: [{ messageId: 'raw' }] },
    {
      code: '<div />;',
      options: [{ elements: ['div'] }],
      errors: [{ messageId: 'raw' }],
    },
  ],
});
