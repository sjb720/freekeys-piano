import { NAMED_COLORS } from './named-colors.mjs';

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\s*\(/i;
const HEX_NUMBER = /^0x(?:[0-9a-f]{6}|[0-9a-f]{8})$/i;
const COLOR_KEY = /color|background|fill|stroke|tint|border|outline|shadow/i;

function hasNamedColor(text) {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .some((word) => NAMED_COLORS.has(word));
}

function keyName(node) {
  if (!node) return undefined;
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'Literal') return String(node.value);
  return undefined;
}

function colorKeyOf(node) {
  const parent = node.parent;
  if (parent?.type === 'Property' && parent.value === node) return keyName(parent.key);
  if (parent?.type === 'JSXAttribute') return keyName(parent.name);
  if (parent?.type === 'JSXExpressionContainer' && parent.parent?.type === 'JSXAttribute') {
    return keyName(parent.parent.name);
  }
  return undefined;
}

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow color literals outside the themes module.' },
    messages: {
      literal: 'Color literal "{{value}}" — use a theme token instead.',
    },
    schema: [],
  },
  create(context) {
    function checkText(node, text) {
      const match = text.match(HEX) ?? text.match(COLOR_FN);
      if (match) {
        context.report({ node, messageId: 'literal', data: { value: match[0] } });
        return;
      }
      const key = colorKeyOf(node);
      if (key && COLOR_KEY.test(key) && hasNamedColor(text)) {
        context.report({ node, messageId: 'literal', data: { value: text } });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') checkText(node, node.value);
        else if (typeof node.value === 'number' && HEX_NUMBER.test(node.raw)) {
          context.report({ node, messageId: 'literal', data: { value: node.raw } });
        }
      },
      TemplateElement(node) {
        checkText(node, node.value.raw);
      },
    };
  },
};
