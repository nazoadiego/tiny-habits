import type Entry from 'models/Entry'

/** Identifies an entry cell in a table: its habit and its date. */
export type EntryKey = `${string}|${string}`

export type PaintMode = 'add' | 'remove'

/**
 @description
	The entry cells picked with Shift in one habits table, so a status change can apply to all of them.
	Immutable: every change returns a new selection, which keeps Svelte's `$state` reassignments simple.
	Holds keys rather than entries, so a reload of the habits never leaves stale entries behind.
 */
export class EntrySelection {
	private readonly keys: ReadonlySet<EntryKey>

	private constructor(keys: Iterable<EntryKey>) {
		this.keys = new Set(keys)
	}

	static empty() {
		return new EntrySelection([])
	}

	static keyOf(entry: Pick<Entry, 'habitId' | 'frontMatterDate'>): EntryKey {
		return `${entry.habitId}|${entry.frontMatterDate()}`
	}

	get size() {
		return this.keys.size
	}

	get isEmpty() {
		return this.keys.size === 0
	}

	has(key: EntryKey) {
		return this.keys.has(key)
	}

	/** The most recently added key, or undefined when nothing is selected. */
	get last(): EntryKey | undefined {
		return [...this.keys].at(-1)
	}

	add(key: EntryKey) {
		if (this.has(key)) return this

		return new EntrySelection([...this.keys, key])
	}

	remove(key: EntryKey) {
		if (!this.has(key)) return this

		return new EntrySelection([...this.keys].filter(selectedKey => selectedKey !== key))
	}

	toggle(key: EntryKey) {
		return this.has(key) ? this.remove(key) : this.add(key)
	}

	/**
	 @description Applies one step of a Shift+drag: the drag adds cells when it started on an unselected cell, and removes them otherwise.
	 */
	paint(key: EntryKey, mode: PaintMode) {
		return mode === 'add' ? this.add(key) : this.remove(key)
	}

	/** The paint mode a Shift+drag starting on this cell uses. */
	paintModeFor(key: EntryKey): PaintMode {
		return this.has(key) ? 'remove' : 'add'
	}

	/**
	 @description
		The cells a status change acts on: the whole selection when there is one, otherwise just the focused cell.
	 @param focused The key of the cell that has focus.
	 */
	targets(focused: EntryKey): EntryKey[] {
		return this.isEmpty ? [focused] : [...this.keys]
	}

	/**
	 @description
		The cell whose next status the whole selection moves to on Enter or click, so a mixed selection ends up with one status.
		The focused cell when it is selected, otherwise the last one added.
	 */
	anchor(focused: EntryKey): EntryKey {
		if (this.isEmpty || this.has(focused)) return focused

		return this.last ?? focused
	}
}
