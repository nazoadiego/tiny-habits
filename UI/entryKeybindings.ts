import { createKeybindingsHandler, type KeybindingsMap } from 'tinykeys'
import Entry, { type Status } from 'models/Entry'
import type { Direction } from './Direction'

export type EntryKeyActions = {
	/** Moves focus to the next cell; `extend` also selects the cell left and the cell reached. */
	move(event: KeyboardEvent, direction: Direction, extend: boolean): void
	/** Sets the target cells to `status`, or to the anchor cell's next status when undefined. */
	setStatus(event: KeyboardEvent, status?: Status): void
	clearSelection(event: KeyboardEvent): void
}

const DIRECTION_KEYS: Record<Direction, string[]> = {
	up: ['ArrowUp', 'k'],
	down: ['ArrowDown', 'j'],
	left: ['ArrowLeft', 'h'],
	right: ['ArrowRight', 'l']
}

const STATUS_KEYS: Record<string, Status> = {
	1: Entry.STATUS.completed,
	2: Entry.STATUS.failed,
	3: Entry.STATUS.skip,
	4: Entry.STATUS.unstarted
}

function handled(action: (event: KeyboardEvent) => void) {
	return (event: KeyboardEvent) => {
		event.preventDefault()
		action(event)
	}
}

/**
 @description
	The keyboard shortcuts of the entry cells, as one tinykeys map.
	Bindings match their modifiers exactly, so Ctrl/Cmd/Alt combinations fall through to Obsidian.
	Every handled key prevents the default (page scroll, Space click).
 @returns A keydown listener for the element that contains the entry cells.
 */
export function createEntryKeydownHandler(actions: EntryKeyActions) {
	const bindings: KeybindingsMap = {
		Enter: handled((event) => actions.setStatus(event)),
		Space: handled((event) => actions.setStatus(event)),
		Escape: handled((event) => actions.clearSelection(event))
	}

	for (const [key, status] of Object.entries(STATUS_KEYS)) {
		bindings[key] = handled((event) => actions.setStatus(event, status))
	}

	for (const [direction, keys] of Object.entries(DIRECTION_KEYS) as [Direction, string[]][]) {
		for (const key of keys) {
			bindings[key] = handled((event) => actions.move(event, direction, false))
			bindings[`Shift+${key}`] = handled((event) => actions.move(event, direction, true))
		}
	}

	// tinykeys ignores held-down keys by default; holding j or an arrow should keep moving.
	return createKeybindingsHandler(bindings, { ignore: (event) => event.isComposing })
}
