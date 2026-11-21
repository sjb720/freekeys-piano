# UI primitives — `src/renderer/ui/`

The only place raw interactive/text elements are allowed (enforced by `piano/no-raw-elements`). Components take no `className`/`style`; extend via props.

Shared types: `Space` = `none|xs|sm|md|lg|xl`, `Variant` = `primary|secondary|ghost|danger`, `ControlSize` = `md|lg`.

| Component             | Key props                                                                                        | Description                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `Button`              | `variant='secondary'`, `size='md'`, `icon?`, `fullWidth?`, native button attrs                   | Touch-sized labeled button. `lg` for primary actions.                                        |
| `IconButton`          | `icon`, `label` (required, used for aria-label/title), `variant='ghost'`, `size`                 | Round icon-only button.                                                                      |
| `Icon`                | `icon: LucideIcon`, `size='md'` (`sm                                                             | md                                                                                           | lg`)               | Decorative icon, inherits text color.                      |
| `Stack`               | `direction='column'`, `gap='md'`, `padding='none'`, `align`, `justify`, `wrap`, `grow`, `scroll` | Flex layout primitive. `grow` fills remaining space; `scroll` makes it scrollable.           |
| `Text`                | `variant='body'` (`display                                                                       | title                                                                                        | heading            | body                                                       | caption`), `tone`, `align`, `as?`, `truncate?` | All text. Variant picks a semantic tag; override with `as`. |
| `Slider`              | `label`, `value`, `min`, `max`, `step=1`, `size='full'` (`sm                                     | md                                                                                           | full`), `onChange` | Touch-sized range input; the filled track shows the value. |
| `Field`               | `label`, `description?`, `value?`, `trailing?`, `children?`                                      | Label row (with value text or a `trailing` control), optional description, then the control. |
| `Toggle`              | `label`, `checked`, `onChange`                                                                   | On/off switch (`role=switch`).                                                               |
| `ListItem`            | `title`, `subtitle?`, `icon?`, `trailing?` (defaults to chevron), `onPress`                      | Full-width pressable row.                                                                    |
| `SegmentedControl<T>` | `label`, `options: {value,label,icon?}[]`, `value`, `onChange`                                   | Single-choice radio group rendered as segments.                                              |

Shared styles: `interactive.module.css` (base + variant classes used by every pressable component).
