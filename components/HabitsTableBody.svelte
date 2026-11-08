<script lang="ts">
	import type Habit from 'models/Habit'
	import Entry, { type Status } from 'models/Entry'
	import DateValue from 'models/DateValue'
	import { periodLabel, segmentsOf } from 'models/Cadence'
	import EntryIcon from './icons/EntryIcon.svelte'
	import NoHabitsMessage from './NoHabitsMessage.svelte'
	import ScheduleEditor from './ScheduleEditor.svelte'
	import Icon from './icons/Icon.svelte'
	import type { THabitRepository } from 'repositories/HabitRepository'
	import type { CollapseStatus } from 'UI/CollapseStatus'
	import { Cursor } from 'UI/Cursor'
	import type { Direction } from 'UI/Direction'
	import { EntrySelection, type EntryKey, type PaintMode } from 'UI/EntrySelection'
	import { createEntryKeydownHandler } from 'UI/entryKeybindings'
	import { dropSlot, destinationOf } from 'UI/habitDrag'
	import { tick } from 'svelte'

	interface $Props {
		habits: Habit[];
		dates: DateValue[];
		updateEntries: THabitRepository['updateEntries'];
		updateSchedule: THabitRepository['updateSchedule'];
		updateCadence: THabitRepository['updateCadence'];
		moveHabit: (fromIndex: number, toIndex: number) => Promise<void>;
		collapseStatus: CollapseStatus;
		selection: EntrySelection;
	}

	let { habits, dates, updateEntries, updateSchedule, updateCadence, moveHabit, collapseStatus, selection = $bindable() }: $Props = $props()

	const noHabits = $derived(habits.length === 0)

	let tableBody: HTMLTableSectionElement | undefined = $state()

	/** The habit whose schedule editor is open. Only one at a time. */
	let editingHabitId: Habit['id'] | undefined = $state()

	function toggleScheduleEditor(habit: Habit) {
		editingHabitId = editingHabitId === habit.id ? undefined : habit.id
	}


	/** On a phone the table shows only the last date, so every habit shows just its current day, week or month. */
	let isNarrow = $state(false)

	$effect(() => {
		const query = globalThis.matchMedia('(max-width: 768px)')
		const update = () => isNarrow = query.matches

		update()
		query.addEventListener('change', update)

		return () => query.removeEventListener('change', update)
	})

	/** The cells of a habit's row: one per visible day, or one per week or month, spanning the days it covers. */
	function segmentsFor(habit: Habit) {
		return segmentsOf(isNarrow ? dates.slice(-1) : dates, habit.cadence)
	}

	const canReorder = $derived(habits.length > 1)

	/** The habit being dragged and the slot (0 to habits.length) it would drop into. */
	let dragging: { habitId: Habit['id'], slot: number, startY: number, offsetY: number } | undefined = $state()

	function habitRows(): HTMLTableRowElement[] {
		return [...(tableBody?.querySelectorAll<HTMLTableRowElement>('tr[data-habit-row]') ?? [])]
	}

	function startDrag(event: PointerEvent, habit: Habit) {
		if (event.button !== 0) return

		event.preventDefault()
		const grip = event.currentTarget
		if (grip instanceof HTMLElement) grip.setPointerCapture(event.pointerId)

		dragging = { habitId: habit.id, slot: habits.indexOf(habit), startY: event.clientY, offsetY: 0 }
	}

	function moveDrag(event: PointerEvent) {
		if (dragging == undefined) return

		const rects = habitRows().map(row => row.getBoundingClientRect())
		dragging = { ...dragging, slot: dropSlot(rects, event.clientY), offsetY: event.clientY - dragging.startY }
	}

	function endDrag(commit: boolean) {
		if (dragging == undefined) return

		const { habitId, slot } = dragging
		dragging = undefined

		const fromIndex = habits.findIndex(habit => habit.id === habitId)
		if (!commit || fromIndex === -1) return

		const toIndex = destinationOf(fromIndex, slot)
		if (toIndex !== fromIndex) void moveAndKeepFocus(habitId, fromIndex, toIndex)
	}

	/** The grip keeps focus while its row moves, so Alt+Arrow can be pressed again. */
	let focusGripOf: Habit['id'] | undefined = undefined

	async function moveAndKeepFocus(habitId: Habit['id'], fromIndex: number, toIndex: number) {
		focusGripOf = habitId
		await moveHabit(fromIndex, toIndex)
	}

	$effect(() => {
		void habits
		const habitId = focusGripOf
		if (habitId == undefined) return

		void tick().then(() => {
			const grip = tableBody?.querySelector(`button.grip[data-habit-id="${CSS.escape(habitId)}"]`)
			if (grip instanceof HTMLElement) grip.focus()
		})
	})

	function handleGripKeydown(event: KeyboardEvent, habit: Habit) {
		if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return

		event.preventDefault()
		event.stopPropagation()

		const fromIndex = habits.indexOf(habit)
		const toIndex = fromIndex + (event.key === 'ArrowUp' ? -1 : 1)
		if (toIndex < 0 || toIndex >= habits.length) return

		void moveAndKeepFocus(habit.id, fromIndex, toIndex)
	}

	/** Which side of the row the drop line goes on, while a drag is over it. */
	function dropEdge(index: number): 'before' | 'after' | undefined {
		if (dragging == undefined) return
		if (dragging.slot === index) return 'before'
		if (dragging.slot === habits.length && index === habits.length - 1) return 'after'
	}

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
		if (habit == undefined) return

		return getEntryByDate(habit.entries, new DateValue(frontMatterDate), habit.path, habit.id)
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
		const verticalPosition = habitIds.indexOf(key.slice(0, separator))
		if (verticalPosition === -1) return

		// A weekly or monthly cell covers several dates: leave it from the side the cursor moves toward.
		const columns = dates.map((date) => habits[verticalPosition].entryDate(date).toYearMonthDayString())
		const entryDate = key.slice(separator + 1)
		const horizontalPosition = direction === 'right' ? columns.lastIndexOf(entryDate) : columns.indexOf(entryDate)
		if (horizontalPosition === -1) return

		const cursor = new Cursor({
			verticalPosition,
			horizontalPosition,
			verticalTotal: habitIds.length,
			horizontalTotal: dates.length
		})

		cursor.move(direction)

		const destination = habits[cursor.verticalPosition]

		return `${destination.id}|${destination.entryDate(dates[cursor.horizontalPosition]).toYearMonthDayString()}`
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
		{#each habits as habit, index (habit.id)}
			<tr data-habit-row class:dragging={dragging?.habitId === habit.id} style:--drag-offset={dragging?.habitId === habit.id ? `${dragging.offsetY}px` : undefined} class:drop-before={dropEdge(index) === 'before'} class:drop-after={dropEdge(index) === 'after'}>
				{@render habitCell(habit)}
				{#each segmentsFor(habit) as segment (segment.start.toYearMonthDayString())}
					{@const entry = getEntryByDate(habit.entries, segment.start, habit.path, habit.id)}
					{@render entryCell(entry, habit.isOffDay(entry), segment.span, habit.cadence === 'day' ? undefined : periodLabel(segment.start, habit.cadence))}
				{/each}
			</tr>
			{#if editingHabitId === habit.id}
				<tr class="schedule-row">
					<td colspan={dates.length + 1}>
						<ScheduleEditor {habit} {updateSchedule} {updateCadence} close={() => editingHabitId = undefined} />
					</td>
				</tr>
			{/if}
		{/each}
	{/if}
</tbody>

{#snippet habitCell(habit: Habit)}
	<td class="habit-cell">
		{#if canReorder}
			<button
				class="clickable-icon grip"
				aria-label="Move {habit.name}. Drag, or press Alt and an arrow key"
				data-habit-id={habit.id}
				onpointerdown={(event) => startDrag(event, habit)}
				onpointermove={moveDrag}
				onpointerup={() => endDrag(true)}
				onpointercancel={() => endDrag(false)}
				onkeydown={(event) => handleGripKeydown(event, habit)}
			>
				<Icon icon="lucide-grip-vertical" />
			</button>
		{/if}
		<a aria-label={habit.path} href={habit.path} class="internal-link">
			{habit.name}
		</a>
		<button
			class="clickable-icon schedule-button"
			aria-label="Edit schedule for {habit.name}"
			aria-expanded={editingHabitId === habit.id}
			onclick={() => toggleScheduleEditor(habit)}
		>
			<Icon icon="lucide-calendar-days" />
		</button>
	</td>
{/snippet}

{#snippet entryCell(entry: Entry, isOffDay: boolean, span: number, period?: string)}
	{@const isSelected = selection.has(EntrySelection.keyOf(entry))}
	<td
		tabindex="0"
		role="button"
		colspan={span}
		aria-label="Mark habit as {entry.nextStatus()}{period ? `, ${period}` : ''}{isOffDay ? ', off day' : ''}{isSelected ? ', selected' : ''}"
		data-habit-id={entry.habitId}
		data-entry-date={entry.frontMatterDate()}
		onclick={(event) => handleClick(event, entry)}
		onpointerdown={(event) => handlePointerDown(event, entry)}
		onpointerenter={(event) => handlePointerEnter(event, entry)}
		onkeydown={handleKeydown}
		class="disable-text-selection entry-cell {entry.status}"
		class:off-day={isOffDay}
		class:selected={isSelected}
	>
		<EntryIcon status={isOffDay ? Entry.STATUS.skip : entry.status} />
		{#if period && span > 1}
			<span class="period-label">{period}</span>
		{/if}
	</td>
{/snippet}

<style>
	td {
		font-size: var(--tiny-table-font-size);
		text-align: center;
		padding: 18px 12px;
		border-collapse: separate;
		border-spacing: 6px;
		border-radius: var(--radius-m);
		transition: background-color 0.3s ease;
	}

	td.entry-cell {
		box-sizing: border-box;
		width: var(--tiny-cell-size);
		min-width: 0; /* Obsidian gives table cells a min-width in ch */
		height: var(--tiny-cell-size);
		padding: 0;
		vertical-align: middle;
		position: relative;
	}

	/* Names the week or month a wide cell covers, in the corner so the icon stays centered. */
	span.period-label {
		position: absolute;
		inset-inline-start: 10px;
		bottom: 6px;
		font-size: var(--font-ui-smaller);
		line-height: 1;
		white-space: nowrap;
		color: white;
		opacity: 0.9;
		pointer-events: none;
	}

	td.entry-cell.unstarted span.period-label {
		color: var(--text-faint);
	}

	td.entry-cell.skip {
		background-color: var(--skip-blue);
	}
	/* A day the schedule skips: the skip color, paler, with the same icon. Nothing is stored for it. */
	td.entry-cell.off-day {
		background-color: color-mix(in srgb, var(--skip-blue) 35%, transparent);
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
		position: relative;
		background-color: rgba(var(--mono-rgb-0), 0.2);
		overflow-wrap: anywhere;
		vertical-align: middle;
		/* Room for the schedule button on both sides, so the name stays centered. */
		padding-inline: 36px;
	}

	/* A flat icon in the corner of the cell. Obsidian's clickable-icon class supplies its hover look. */
	button.schedule-button {
		position: absolute;
		inset-inline-end: 6px;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
	}

	/* The grip mirrors the schedule button, on the other side of the name. */
	button.grip {
		position: absolute;
		inset-inline-start: 6px;
		top: 50%;
		transform: translateY(-50%);
		opacity: 0;
		cursor: grab;
		touch-action: none;
	}

	tr:hover button.grip,
	button.grip:focus-visible {
		opacity: 1;
	}

	tr.dragging button.grip {
		opacity: 1;
		cursor: grabbing;
	}

	/* The row follows the pointer, lifted above the others. The drop line shows where it lands. */
	tr.dragging {
		position: relative;
		z-index: 1;
		transform: translateY(var(--drag-offset, 0));
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
	}

	tr.dragging td.habit-cell {
		outline: 2px solid var(--interactive-accent);
		background-color: var(--background-secondary);
	}

	tr.dragging td.entry-cell {
		opacity: 1;
	}

	/* The drop line, inside the row's edge so the 6px gap between rows doesn't move. */
	tr.drop-before > td {
		box-shadow: inset 0 3px 0 var(--interactive-accent);
	}

	tr.drop-after > td {
		box-shadow: inset 0 -3px 0 var(--interactive-accent);
	}

	/* Always reachable by touch and keyboard; the hover reveal only declutters pointer use. */
	tr:hover button.schedule-button,
	button.schedule-button:focus-visible,
	button.schedule-button[aria-expanded="true"] {
		opacity: 1;
	}

	@media (hover: none) {
		button.schedule-button,
		button.grip {
			opacity: 1;
		}
	}

	tr.schedule-row > td {
		padding: 0;
		background-color: rgba(var(--mono-rgb-0), 0.2);
		text-align: start;
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
