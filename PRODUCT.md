# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
People who already keep notes in Obsidian, often daily notes, and want to track habits without leaving them. They read and update the table inside a note, on desktop or mobile (the plugin is not desktop-only), with mouse or keyboard.

## Product Purpose
An Obsidian plugin that renders a habit-tracking table from a `habits` code block. Each habit entry is stored in the frontmatter of the notes in a configured folder, so everything stays local and inside plain markdown. Success is a quick glance showing how consistent you have been, and a one-keystroke way to record today.

## Positioning
Habit data lives in the user's own notes, not in a separate database or service. The tracker is a view over notes the user already owns, in the heatmap format familiar from GitHub and Anki.

## Operating Context
- Runs inside Obsidian's markdown view as a code block processor; the host app owns the theme, fonts, and window.
- Configured by JSON in the code block (`folderPath`); several blocks may appear in one file, and a block can be collapsed by clicking its table header.
- Entries are marked completed, failed, skipped, or not started. Navigation covers past and future entries.
- Keyboard support: arrow keys or hjkl to move, Enter to mark the focused entry.

## Capabilities and Constraints
- Svelte 5 components built with esbuild and distributed as an Obsidian community plugin (id `tiny-habits`, min app version 0.15.0).
- No network or backend; data is read from and written to note frontmatter.
- Empty and error states exist (`NoHabitsMessage`, `SomethingWentWrongMessage`).
- Undecided: audience beyond existing Obsidian users, and any further settings UI.

## Brand Commitments
Name "Tiny Habits". Existing logo at `tiny-habit.png`. Status colors currently defined in `styles.css` as success green, failure red, and skip blue; treat these as incumbent, not as a binding decision.

## Evidence on Hand
- `preview.png` and the README screenshot of the plugin in use.
- No testimonials, usage numbers, or user research exist in the repo; do not invent any.

## Product Principles
1. The user's notes are the source of truth; the plugin never holds data of its own.
2. Fit the host: behave like part of Obsidian, not a foreign app inside it.
3. Recording a habit should take one keystroke or click.
4. A glance should answer "how am I doing", before any detail.
5. Stay small and local; no accounts, no network.

## Accessibility & Inclusion
No specific standard was stated. Keyboard operation is a shipped feature and must be preserved; status must not rely on color alone (to be verified in audit).
