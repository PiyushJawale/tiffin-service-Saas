# Tiffin Service — Design System

A single source of truth for the UI. Plain CSS only — no new dependencies.
The brand stays warm and food-forward: saffron orange primary, fresh green for
success, teal for secondary actions, warm yellow accents.

---

## 1. Design Principles

1. **Appetite first** — warm colors, generous whitespace, food imagery leads.
2. **Calm data** — admin tables/stats use neutral grays; color only for status.
3. **One elevation language** — cards float subtly; nothing screams.
4. **Mobile is not an afterthought** — every screen works at 375px.
5. **Accessible by default** — WCAG AA contrast, visible focus rings.

## 2. Color Tokens

| Token                   | Value     | Usage                                |
| ----------------------- | --------- | ------------------------------------ |
| `--primary-orange`      | `#FF6B35` | Primary actions, brand, highlights   |
| `--primary-orange-dark` | `#E55A2B` | Hover/active on primary              |
| `--primary-orange-soft` | `#FFF0E8` | Primary tint backgrounds             |
| `--warm-yellow`         | `#F7C548` | Accents, ratings, highlights         |
| `--warm-yellow-soft`    | `#FFF8E1` | Hero/section tint                    |
| `--fresh-green`         | `#2E7D32` | Success, delivered, paid             |
| `--fresh-green-soft`    | `#E8F5E9` | Success tint                         |
| `--teal`                | `#00796B` | Secondary actions                    |
| `--red`                 | `#C62828` | Danger, delete, overdue              |
| `--red-soft`            | `#FDECEA` | Danger tint                          |
| `--info-blue`           | `#1565C0` | Info states (e.g. awaiting approval) |
| `--info-blue-soft`      | `#E3F2FD` | Info tint                            |
| `--ink`                 | `#212121` | Headings, primary text               |
| `--gray-700`            | `#424242` | Body text                            |
| `--medium-gray`         | `#757575` | Secondary text, labels               |
| `--border`              | `#E0E0E0` | Dividers, card borders               |
| `--light-gray`          | `#F5F5F5` | Page background                      |
| `--surface`             | `#FFFFFF` | Cards, sheets                        |

## 3. Typography

Font: **Poppins** (already loaded). Scale (rem):

| Level   | Size/Weight           | Usage                                           |
| ------- | --------------------- | ----------------------------------------------- |
| Display | 48/700 (32 on mobile) | Home hero title                                 |
| H1      | 28/700                | Page titles                                     |
| H2      | 20/600                | Section headers, card titles                    |
| H3      | 16/600                | Sub-sections, stat labels (as 13/600 uppercase) |
| Body    | 15/400                | Default text                                    |
| Small   | 13/400                | Meta, table secondary                           |
| Caption | 12/500                | Badges, tags                                    |

## 4. Spacing & Layout

- Spacing scale: **4 / 8 / 12 / 16 / 24 / 32 / 48** px — never arbitrary values.
- Container: max-width 1200px, 20px side padding (24px ≥768px).
- Card padding: 20px (16px on mobile). Section gaps: 32px.
- Radii: inputs/buttons **8px**, cards **12px**, modals/pills **16px**/999px.

## 5. Elevation

| Level        | Shadow                        | Usage            |
| ------------ | ----------------------------- | ---------------- |
| `--shadow-1` | `0 1px 3px rgba(0,0,0,.08)`   | Resting cards    |
| `--shadow-2` | `0 4px 16px rgba(0,0,0,.10)`  | Hover, dropdowns |
| `--shadow-3` | `0 12px 32px rgba(0,0,0,.14)` | Modals           |

## 6. Components

### Buttons

- `.btn` base: 12px/24px padding, 8px radius, 500 weight, 180ms ease.
- Variants: `.btn-primary` (orange, hover darker + translateY(-1px)),
  `.btn-secondary` (teal), `.btn-outline` (orange border, fills on hover),
  `.btn-danger` (red), `.btn-success` (green), `.btn-sm` (8px/16px, 13px),
  `.btn-large` (16px/32px, 18px). Disabled: 0.55 opacity, no transform.
- Focus: `outline: 3px solid rgba(255,107,53,.35)` on `:focus-visible`.

### Cards

- `.card`: white surface, 1px `--border`, 12px radius, `--shadow-1`;
  hover lifts to `--shadow-2` where interactive.

### Badges & Tags

- Pills: 999px radius, 12px/500, soft-tint background with dark text:
  `badge-success` (green), `badge-warning` (yellow tint), `badge-info` (blue),
  `badge-danger` (red), `tag-veg`/`tag-non-veg`/`tag-jain` keep meal colors.

### Forms

- Inputs/textareas/selects: 10px/12px padding, 8px radius, 1px `--border`;
  focus: orange border + 3px orange-soft ring. Labels 13px/500 `--gray-700`.
- Field errors: 12px `--red` under the field. Success notes: 13px `--fresh-green`.

### Stat Tiles

- White card, label = 13px/500 uppercase `--medium-gray`, value = 28/700 `--ink`.
- Colored variants only for status (green = paid/delivered, red = pending/overdue).

### Tables / List Rows

- Zebra-free; 1px row dividers; 12px/16px cell padding; header row
  12px uppercase letter-spaced gray. On mobile, rows stack via CSS grid.

### Modals

- Overlay `rgba(0,0,0,.45)`, surface 16px radius, `--shadow-3`, max-width 480px.

### Navigation

- Fixed top, 64px, white surface + `--shadow-1`; active link = orange + 2px
  underline offset; CTA button on the right.

## 7. Motion

- Durations: 150ms (hover/press), 250ms (expand/collapse), 300ms (modals).
- Easing: `ease`; transforms only (`translateY`, `scale`) — no layout animations.

## 8. Responsive Breakpoints

- **≤480px**: single-column grids, hero stacks, tables become stacked rows,
  nav collapses (hamburger at ≤768px).
- **481–768px**: 2-col grids, side paddings 24px.
- **>1024px**: full layout.

## 9. Accessibility

- Text contrast ≥ 4.5:1 (gray-700 on white; white on orange-checked).
- Visible `:focus-visible` rings on all interactive elements.
- Status is never color-only — badges carry text labels too.
- Touch targets ≥ 40px on mobile.

## 10. Page Notes

- **Home**: hero on `--warm-yellow-soft` gradient, display title with orange
  highlight line, stat tiles beneath, feature cards row.
- **Menu**: meal-type cards with tinted headers per meal tag; price pill
  bottom-right; availability badge top-right.
- **User Dashboard**: stat tiles row, subscription card with status badge,
  bills list with per-bill status pill + actions.
- **Admin Dashboard**: tab bar with underline active state; section cards;
  billing rows with aligned right amounts; menu editor grid cards.
- **Auth**: centered card on warm tint, inline validation text.
- **Contact**: two-column info/form split, stacked on mobile.
