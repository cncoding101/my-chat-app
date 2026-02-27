# Design System

## Source of Truth

- **Figma**: https://www.figma.com/design/aiVc32NU065x8ERyv5oOf5/My-Chat-App?node-id=0-1&p=f&t=yAms9FT5IOTB3XGX-0
- **Code tokens**: `app/tokens.json` (generates the `@theme` block in `app/src/index.css`)

## Design Tokens

### Colors

| Token                      | Value       | Usage                  |
| -------------------------- | ----------- | ---------------------- |
| `--color-base-100`         | `#ffffff`   | Page background        |
| `--color-primary`          | `#0a569a`   | Primary actions / links |
| `--color-primary-content`  | `#ffffff`   | Text on primary        |
| `--color-secondary`        | `#e6ffdc`   | Secondary surfaces     |
| `--color-secondary-content`| `#000000`   | Text on secondary      |
| `--color-accent`           | `#ff5b66`   | Accent / highlights    |
| `--color-accent-content`   | `#000000`   | Text on accent         |
| `--color-neutral`          | `#f9f9f9`   | Neutral backgrounds    |
| `--color-neutral-content`  | `#000000`   | Text on neutral        |
| `--color-info`             | `#c1e0fa`   | Informational          |
| `--color-info-content`     | `#000000`   | Text on info           |
| `--color-success`          | `#a4ff80`   | Success states         |
| `--color-success-content`  | `#3d5434`   | Text on success        |
| `--color-warning`          | `#ffed65`   | Warning states         |
| `--color-warning-content`  | `#544e21`   | Text on warning        |
| `--color-error`            | `#ff0000`   | Error states           |
| `--color-error-content`    | `#540000`   | Text on error          |
| `--color-backdrop`         | `#c1e0fa66` | Modal backdrop overlay |

### Radius & Border

| Token               | Value      |
| -------------------- | ---------- |
| `--radius-selector`  | `0.5rem`   |
| `--radius-box`       | `0.5rem`   |
| `--border`           | `1px`      |

## Rules

1. All colors, spacing, and radius **must** come from design tokens — never hardcode color values.
2. To add or change a token, edit `app/tokens.json` then run `cd app && npm run generate:tokens` to update `index.css`.
3. Use **shadcn/ui** components for all UI elements.
4. When implementing a new Figma design, check if existing components can be reused before creating new ones.
5. If a Figma design introduces a new token, add it to `app/tokens.json` first.
6. Use Tailwind utility classes that reference theme tokens (e.g., `bg-primary`, `text-error-content`, `rounded-box`) rather than arbitrary values.
