export const DEFAULT_ELEMENTS = [
  'a',
  'button',
  'dialog',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'input',
  'label',
  'option',
  'p',
  'select',
  'textarea',
];

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw elements that have a ui/ component equivalent.' },
    messages: {
      raw: '<{{name}}> is only allowed inside src/renderer/ui — use or create a ui component.',
    },
    schema: [
      {
        type: 'object',
        properties: { elements: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const elements = new Set(context.options[0]?.elements ?? DEFAULT_ELEMENTS);
    return {
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && elements.has(node.name.name)) {
          context.report({ node, messageId: 'raw', data: { name: node.name.name } });
        }
      },
    };
  },
};
