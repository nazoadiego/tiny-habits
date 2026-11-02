<script lang="ts">
	import type Habit from 'models/Habit'
	import Entry, { type Status } from 'models/Entry'
	import DateValue from 'models/DateValue'
	import EntryIcon from './icons/EntryIcon.svelte'
	import NoHabitsMessage from './NoHabitsMessage.svelte'
	import type { THabitRepository } from 'repositories/HabitRepository'
	import type { CollapseStatus } from 'UI/CollapseStatus'
	import { Cursor } from 'UI/Cursor'
	import type { Direction } from 'UI/Direction'
	import { EntrySelection, type EntryKey, type PaintMode } from 'UI/EntrySelection'
	import { createEntryKeydownHandler } from 'UI/entryKeybindings'

	interface $Props {
		habits: Habit[];
		dates: DateValue[];
		updateEntries: THabitRepository['updateEntries'];
		collapseStatus: CollapseStatus;
		selection: EntrySelection;
	}

	let { habits, dates, updateEntries, collapseStatus, selection = $bindable() }: $Props = $props()

	const noHabits = $derived(habits.length === 0)

	let tableBody: HTMLTableSectionElement | undefined = $state()

	/** Set while a Shift+drag is painting the selection. */
	let paintMode: PaintMode | undefined = undefined

	function getEntryByDate(entries: Entry[], date: DateValue, habitPath: Habit['path'], habitId: Habit['id']): Entry {
		return entries.find((entry) => entry.date.isSameDay(date)) || Entry.empty({ date, habitPath, habitId })
	}

	function entryFor(key: EntryKey): Entry | undefined {
		const separator = key.lastIndexOf('|')
		const habitId = key.slice(0, separator)
		const frontMatterDate = key.slice(separator + 1)

		const habit = habits.find((habit) => habit.id === habitId)
		const date = dates.find((date) => date.toYearMonthDayString() === frontMatterDate)
		if (habit == undefined || date == undefined) return

		return getEntryByDate(habit.entries, date, habit.path, habit.id)
	}

	function cellOf(target: EventTarget | null): HTMLTableCellElement | undefined {
		if (!(target instanceof Element)) return

		const cell = target.closest('td.entry-cell')
		return cell instanceof HTMLTableCellElement ? cell : undefined
	}

	function keyOfCell(cell: HTMLTableCellElement): EntryKey | undefined {
		const { habitId, entryDate } = cell.dataset
		if (!habitId || !entryDate) return

		return `${habitId}|${entryDate}`
	}

	function cellFor(key: EntryKey): HTMLTableCellElement | undefined {
		const separator = key.lastIndexOf('|')
		const habitId = CSS.escape(key.slice(0, separator))
		const entryDate = CSS.escape(key.slice(separator + 1))
		const cell = tableBody?.querySelector(`td[data-habit-id="${habitId}"][data-entry-date="${entryDate}"]`)

		return cell instanceof HTMLTableCellElement ? cell : undefined
	}

	/**
	 @description
		Changes the status of the selected cells, or of the focused cell when nothing is selected.
		Without a status, every target moves to the anchor cell's next status, so a mixed selection ends up with one status.
	 */
	function applyStatus(focusedKey: EntryKey, status?: Status) {
		const nextStatus = status ?? entryFor(selection.anchor(focusedKey))?.nextStatus()
		if (nextStatus == undefined) return

		const entries = selection.targets(focusedKey)
			.map((key) => entryFor(key))
			.filter((entry) => entry != undefined)

		void updateEntries(entries, nextStatus)
	}

	function handleClick(event: MouseEvent, entry: Entry) {
		// Shift+click selects on pointerdown instead of changing the status.
		if (event.shiftKey) return

		const key = EntrySelection.keyOf(entry)
		if (!selection.has(key)) selection = EntrySelection.empty()

		applyStatus(key)
	}

	function handlePointerDown(event: PointerEvent, entry: Entry) {
		if (!event.shiftKey || event.button !== 0) return

		event.preventDefault()

		const key = EntrySelection.keyOf(entry)
		paintMode = selection.paintModeFor(key)
		selection = selection.paint(key, paintMode)
	}

	function handlePointerEnter(event: PointerEvent, entry: Entry) {
		if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus()

		const isPrimaryButtonHeld = (event.buttons & 1) === 1
		if (paintMode == undefined || !isPrimaryButtonHeld) return

		selection = selection.paint(EntrySelection.keyOf(entry), paintMode)
	}

	function stopPainting() {
		paintMode = undefined
	}

	function nextKey(key: EntryKey, direction: Direction): EntryKey | undefined {
		const separator = key.lastIndexOf('|')
		const habitIds = habits.map((habit) => habit.id)
		const frontMatterDates = dates.map((date) => date.toYearMonthDayString())
		const verticalPosition = habitIds.indexOf(key.slice(0, separator))
		const horizontalPosition = frontMatterDates.indexOf(key.slice(separator + 1))
		if (verticalPosition === -1 || horizontalPosition === -1) return

		const cursor = new Cursor({
			verticalPosition,
			horizontalPosition,
			verticalTotal: habitIds.length,
			horizontalTotal: frontMatterDates.length
		})

		cursor.move(direction)

		return `${habitIds[cursor.verticalPosition]}|${frontMatterDates[cursor.horizontalPosition]}`
	}

	const handleKeydown = createEntryKeydownHandler({
		move(event, direction, extend) {
			const cell = cellOf(event.target)
			const key = cell && keyOfCell(cell)
			if (key == undefined) return

			const destination = nextKey(key, direction)
			if (destination == undefined) return

			if (extend) selection = selection.add(key).add(destination)

			cellFor(destination)?.focus()
		},
		setStatus(event, status) {
			const cell = cellOf(event.target)
			const key = cell && keyOfCell(cell)
			if (key == undefined) return

			applyStatus(key, status)
		},
		clearSelection() {
			selection = EntrySelection.empty()
		}
	})
</script>

<svelte:window onpointerup={stopPainting} onpointercancel={stopPainting} />

<tbody class={collapseStatus.value} bind:this={tableBody}>
	{#if noHabits}
		<NoHabitsMessage numberOfDates={dates.length}/>
	{:else}
		{#each habits as habit (habit.id)}
			<tr>
				{@render habitCell(habit.name, habit.path)}
				{#each dates as date (date.toDayString())}
					{@render entryCell(getEntryByDate(habit.entries, date, habit.path, habit.id))}
				{/each}
			</tr>
		{/each}
	{/if}
</tbody>

{#snippet habitCell(name: Habit['name'], path: Habit['path'])}
	<td class="habit-cell">
		<a aria-label={path} href={path} class="internal-link">
			{name}
		</a>
	</td>
{/snippet}

{#snippet entryCell(entry: Entry)}
	{@const isSelected = selection.has(EntrySelection.keyOf(entry))}
	<td
		tabindex="0"
		role="button"
		aria-label="Mark habit as {entry.nextStatus()}{isSelected ? ', selected' : ''}"
		data-habit-id={entry.habitId}
		data-entry-date={entry.frontMatterDate()}
		onclick={(event) => handleClick(event, entry)}
		onpointerdown={(event) => handlePointerDown(event, entry)}
		onpointerenter={(event) => handlePointerEnter(event, entry)}
		onkeydown={handleKeydown}
		class="disable-text-selection entry-cell {entry.status}"
		class:selected={isSelected}
	>
		<EntryIcon status={entry.status} />
	</td>
{/snippet}

<style>
	@media screen and (max-width: 768px) {
		/* Hide all date columns except the last one */
		td.entry-cell:not(:last-of-type) {
			display: none;
		}
	}

	td {
		font-size: var(--tiny-table-font-size);
		text-align: center;
		padding: 18px 12px;
		border-collapse: separate;
		border-spacing: 6px;
		border-radius: var(--radius-m);
		transition: background-color 0.3s ease;
	}

	td.entry-cell.skip {
		background-color: var(--skip-blue);
	}
	td.entry-cell.completed {
		background-color: var(--success-green);
	}

	td.entry-cell.failed {
		background-color: var(--failure-red);
	}

	tr:hover td.entry-cell {
		opacity: 0.7;
	}

	tr:hover td.entry-cell:hover {
		opacity: 1;
		cursor: pointer;
	}

	td.habit-cell {
		background-color: rgba(var(--mono-rgb-0), 0.2)
	}

	.disable-text-selection {
		user-select: none;
	}

	/* Outside the cell, so it stays visible next to the inset focus outline. */
	td.entry-cell.selected {
		box-shadow: 0 0 0 3px var(--interactive-accent);
	}

	td.entry-cell:focus {
		outline: 3px solid var(--background-modifier-border);
		outline-offset: -2px;
	}

	td.entry-cell:focus:not(:focus-visible) {
			outline: none;
	}

	tbody.expanded {
		opacity: 1;
		transform: translateY(0);
		transform-origin: top;
		animation: expandRow 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	tbody.collapsed {
		opacity: 0;
		transform: translateY(-20px);
		transform-origin: top;
		display: none;
		animation: collapseRow 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes collapseRow {
		0% {
			opacity: 1;
			transform: translateY(0);
			display: table-row-group;
		}
		99% {
			opacity: 0;
			transform: translateY(-10px);
			display: table-row-group;
		}
		100% {
			opacity: 0;
			transform: translateY(-10px);
			display: none;
		}
	}

	@keyframes expandRow {
		0% {
			opacity: 0;
			transform: translateY(-10px);
		}
		1% {
			display: table-row-group;
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
