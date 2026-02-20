<script lang="ts">
	import type Habit from 'models/Habit'
	import Entry from 'models/Entry'
	import DateValue from 'models/DateValue'
	import EntryIcon from './icons/EntryIcon.svelte'
	import NoHabitsMessage from './NoHabitsMessage.svelte'
	import { KeyboardActionNavigateEntry } from 'UI/KeyboardActionNavigateEntry'
	import type { THabitRepository } from 'repositories/HabitRepository'
	import { KeyboardActionUpdateEntry } from 'UI/KeyboardActionUpdateEntry'
	import type { CollapseStatus } from 'UI/CollapseStatus'

	interface $Props {
		habits: Habit[];
		dates: DateValue[];
		updateEntry: THabitRepository['updateEntry'];
		collapseStatus: CollapseStatus;
	}

	const { habits, dates, updateEntry, collapseStatus }: $Props = $props()

	const noHabits = $derived(habits.length === 0)

	function getEntryByDate(entries: Entry[], date: DateValue, habitPath: Habit['path'], habitId: Habit['id']): Entry {
		return entries.find((entry) => entry.date.isSameDay(date)) || Entry.empty({ date, habitPath, habitId })
	}

	let activeEntry: Entry | undefined = $state(undefined)

	function handleHover(target: EventTarget | null, entry: Entry) {
		if (!(target instanceof HTMLElement)) return

		target.focus()
		activeEntry = entry
	}

	function handleMouseLeave() {
		activeEntry = undefined
	}

	function handleKeydown(event: KeyboardEvent) {
		new KeyboardActionUpdateEntry(event).call(
			(status) => {
				if (activeEntry == undefined) return

				const updatedEntry = updateEntry(activeEntry, status || activeEntry.nextStatus())

				activeEntry = updatedEntry
			}
		)

		new KeyboardActionNavigateEntry(event).call(
			habits,
			dates,
			(entry) => { activeEntry = entry })
	}
</script>


<tbody class={collapseStatus.value}>
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
		onclick={() => updateEntry(entry, entry.nextStatus())}
		onmouseenter={(event) => handleHover(event.target, entry)}
		onmouseleave={handleMouseLeave}
		onkeydown={handleKeydown}
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
