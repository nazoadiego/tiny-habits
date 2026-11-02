---
name: Tiny Habits
description: An Obsidian plugin that renders a habit heatmap table inside the user's notes.
colors:
  success-green: "#4caf50"
  failure-red: "#f44336"
  skip-blue: "#64b5f6"
  on-status: "#ffffff"
typography:
  table:
    fontSize: "16px"
spacing:
  cell-gap: "6px"
  cell-y: "18px"
  cell-x: "12px"
  control-size: "48px"
components:
  entry-cell-completed:
    backgroundColor: "{colors.success-green}"
    textColor: "{colors.on-status}"
    padding: "18px 12px"
  entry-cell-failed:
    backgroundColor: "{colors.failure-red}"
    textColor: "{colors.on-status}"
    padding: "18px 12px"
  entry-cell-skip:
    backgroundColor: "{colors.skip-blue}"
    textColor: "{colors.on-status}"
    padding: "18px 12px"
  date-control:
    height: "48px"
    width: "48px"
---

# Design System: Tiny Habits

## Overview

**Creative North Star: "The Native Guest"**

Tiny Habits lives inside someone else's house. Obsidian owns the theme, the fonts, the radii, and the surfaces; the plugin borrows them through Obsidian's CSS variables and adds only what the host cannot supply: three status colors for habit entries. In a light theme, a dark theme, or a community theme, the table should look like it shipped with the app.

The table is a grid of rounded, separated cells, closer to a calendar heatmap than a spreadsheet. Empty cells are translucent surfaces from the host theme; filled cells are flat, saturated blocks of status color with a white icon. Nothing else competes with them.

**Key Characteristics:**
- Host-themed: every neutral, border, radius, and font comes from Obsidian variables.
- Three plugin-owned colors, all for entry status.
- Flat: no shadows; depth comes from translucency and a 6px gap between cells.
- Keyboard-first: focus is visible and the cells are the interaction targets.

## Colors

The palette is Obsidian's, plus three status colors owned by the plugin (`styles.css`).

### Primary
- **Completed Green** (#4caf50): background of a completed entry cell.

### Secondary
- **Failed Red** (#f44336): background of a failed entry cell.
- **Skipped Blue** (#64b5f6): background of a skipped entry cell.

### Neutral
- **Host Surface Wash** (`rgba(var(--mono-rgb-0), 0.2)` to `0.4`): habit-name cells (0.2), header cells, the info bar, and date controls (0.4). Adapts to light and dark themes.
- **Host Border** (`var(--background-modifier-border)`): hairline on the info bar and date controls; also the focus outline color.
- **Host Faint Text** (`var(--text-faint)`): empty and error messages.
- **On-Status White** (#ffffff): icons drawn on status cells.

### Named Rules
**The Host First Rule.** If Obsidian already has a variable for it, use the variable. Add a plugin-owned color only for entry status.
**The Status Is Fill Rule.** Entry status is carried by cell fill and an icon, never by text color.

## Typography

**Font:** inherited from Obsidian. The plugin sets no font family, except the host's `--font-monospace` for the code sample in the error state.

**Character:** the user's own reading font, at a single table size.

### Hierarchy
- **Table** (host weight, 16px via `--tiny-table-font-size`): header, habit names, and entry cells alike. There is no display or headline tier.
- **Message** (host size, `--text-faint`): empty and error states, centered.

## Layout

A full-width table with `border-collapse: separate` and a 6px gap between cells (`border-spacing`). Entry cells are padded 18px vertical, 12px horizontal. Above the table, a 48px-high info bar sits beside 48px square date controls, aligned to the right with a 6px gap.

At 768px and narrower, all date columns hide except the last one, so a phone shows the habit name and today.

## Elevation & Depth

Flat. There are no shadows. Separation comes from the 6px cell gap, translucent surface washes, and a 1px host border on the info bar and controls. Expanding and collapsing a table slides it 10 to 20px vertically while fading.

### Named Rules
**The Flat Cell Rule.** Cells never get shadows or gradients; hover changes opacity only.

## Shapes

Rounded rectangles throughout. Radii come from the host (`--radius-m` for cells, controls, and the info bar; `--radius-s` for the error code sample), so they follow the user's theme. Borders are 1px hairlines in the host border color. No pills, no circles except the Lucide status icons.

## Components

### Entry Cell
- **Shape:** host medium radius, padding 18px 12px, centered content.
- **States:** unstarted (no fill, no icon), completed (green, check icon), skipped (blue, minus-circle icon), failed (red, x-circle icon). Icons are Lucide, white.
- **Hover:** while a row is hovered its entry cells dim to 0.7 opacity; the cell under the pointer returns to full opacity with a pointer cursor.
- **Focus:** 3px outline in the host border color, inset by 2px, shown for keyboard focus only.
- **Transition:** background color 0.3s ease.

### Habit Cell
- **Style:** host medium radius, 0.2 surface wash, contains an internal link to the habit's note.

### Table Header
- **Style:** header cells with 12px padding, 0.4 surface wash, host medium radius, centered. Clicking the header collapses or expands the table.

### Date Control
- **Style:** 48px by 48px button, 0.4 surface wash, 1px host border, host medium radius.
- **Hover:** wash lightens to 0.1 over 0.3s.

### Info Bar
- **Style:** 48px tall, 0.4 wash, 1px host border, 18px left padding, content vertically centered.

### Empty and Error Messages
- **Style:** centered faint text with large vertical padding (8em empty, 4em error). The error state shows a copyable code sample in a host secondary-background block; the copy button appears on hover.

## Do's and Don'ts

### Do:
- **Do** use Obsidian variables for surfaces, borders, text, radii, and fonts.
- **Do** keep the three status colors identical in every theme, with a white icon on top.
- **Do** keep a visible focus outline on entry cells for keyboard users.
- **Do** keep the small-screen rule: last date column only at 768px and below.

### Don't:
- **Don't** hard-code a neutral color, font, or radius the host already provides.
- **Don't** add shadows, gradients, or decorative borders to cells.
- **Don't** signal status with color alone; keep the icon.
- **Don't** introduce a fourth status color without a new entry status.
