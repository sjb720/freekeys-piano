import noColorLiterals from './no-color-literals.mjs';
import noRawElements from './no-raw-elements.mjs';

export default {
  meta: { name: 'eslint-plugin-piano' },
  rules: {
    'no-color-literals': noColorLiterals,
    'no-raw-elements': noRawElements,
  },
};
