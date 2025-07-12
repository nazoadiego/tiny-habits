<script lang="ts">
	import type Habit from "models/Habit";
	import Entry from "models/Entry";
	import DateValue from "models/DateValue";
	import EntryIcon from "./icons/EntryIcon.svelte";
	import NoHabitsMessage from "./NoHabitsMessage.svelte";
	import type { collapseStatuses } from "types";

	interface $Props {
		habits: Habit[];
		dates: DateValue[];
		updateEntry: (habitPath: string, entry: Entry) => void;
		collapseStatus: collapseStatuses;
	}

	const { habits, dates, updateEntry, collapseStatus }: $Props = $props();

	const noHabits = $derived(habits.length === 0);

	function getEntryByDate(entries: Entry[], date: DateValue, habitPath: Habit['path'], habitId: Habit['id']): Entry {
		return entries.find((entry) => entry.date.isSameDay(date)) || Entry.empty({ date, habitPath, habitId })
	}

	type Direction = 'up' | 'down' | 'left' | 'right';
	type KeyboardMapping = Record<string, Direction>;
	const keyboardMap: KeyboardMapping = {
		'ArrowUp': 'up', 'k': 'up',
		'ArrowDown': 'down', 'j': 'down',
		'ArrowLeft': 'left', 'h': 'left',
		'ArrowRight': 'right', 'l': 'right'
	};

	function getNextIndex(currentIndex: number, total: number, direction: 'up' | 'down' | 'left' | 'right'): number {
		const increment = direction === 'down' || direction === 'right' ? 1 : -1;
		return (currentIndex + increment + total) % total;
	}

	function buildNextCellSelector(entryDay: string, habitId: string): string {
		return `td[data-entry-day="${entryDay}"][data-habit-id="${habitId}"]`;
	}

	function handleKeyboardNavigation(event: KeyboardEvent, target: HTMLTableCellElement): void {
		const direction = keyboardMap[event.key];
		if (!direction) return;

		event.preventDefault();
		const entryDay = target.dataset.entryDay;
		const currentHabitId = target.dataset.habitId;
		if (!entryDay || !currentHabitId) return;

		const habitIds = habits.map(habit => habit.id);
		const currentHabitIndex = habitIds.indexOf(currentHabitId);
		const currentDateIndex = dates.findIndex(date => date.toDayString() === entryDay);

		if (direction === 'up' || direction === 'down') {
			const nextHabitId = habitIds[getNextIndex(currentHabitIndex, habitIds.length, direction)];
			const nextSelector = buildNextCellSelector(entryDay, nextHabitId);
			const nextCell = document.querySelector(nextSelector) as HTMLTableCellElement;

			nextCell?.focus();
			return
		}
		if (direction === 'left' || direction === 'right') {
			const nextDate = dates[getNextIndex(currentDateIndex, dates.length, direction)].toDayString();
			const nextSelector = buildNextCellSelector(nextDate, currentHabitId);
			const nextCell = document.querySelector(nextSelector) as HTMLTableCellElement;

			nextCell?.focus();
			return
		}
		console.warn("something went wrong! We are moving in strange directions partner!")
	}
</script>


<tbody class={collapseStatus}>
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
	<td
		tabindex="0"
		role="button"
		aria-label="Mark habit as {entry.nextStatus()}"
		data-habit-id={entry.habitId}
		data-entry-day={entry.date.toDayString()}
		onclick={() => updateEntry(entry.habitPath, entry)}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				updateEntry(entry.habitPath, entry);
			}

			const target = event.target as HTMLTableCellElement
			if (target == undefined) return

			handleKeyboardNavigation(event, target);
		}}
		class="disable-text-selection entry-cell {entry.status}"
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
		border-radius: var(--radius-m)
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
		transition: all 0.2s ease;
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

	td.entry-cell:focus {
		outline: 2px solid var(--interactive-accent);
		outline-offset: -2px;
	}

	td.entry-cell:focus:not(:focus-visible) {
			outline: none;
	}

	tbody.expanded {
		opacity: 1;
		transform: translateY(0);
		transform-origin: top;
		animation: expand 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	tbody.collapsed {
		opacity: 0;
		transform: translateY(-20px);
		transform-origin: top;
		display: none;
		animation: collapse 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	@keyframes collapse {
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

	@keyframes expand {
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
