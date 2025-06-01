<script lang="ts">
	import { DateValue } from "models/DateValue";
	import Entry from "models/Entry";
	import type Habit from "models/Habit";
	import type HabitRepository from "repositories/HabitRepository";
	import { habitStore } from "stores/store";

	interface $Props {
		habitRepository: HabitRepository;
	}

	const { habitRepository }: $Props = $props();

	// TODO: Move to DateValue class methods! why not
	const dateRange: DateValue[] = Array.from(
		{ length: 7 },
		(_element, index) => {
			const date = new Date();
			date.setDate(date.getDate() + index);
			return new DateValue(date);
		},
	);

	const title = "Habits";

	function getEntryByDate(habitId: string, date: DateValue): Entry | null {
		const habit = $habitStore.find((habit) => habit.id === habitId);

		if (!habit) return null;

		return (
			habit.entries.find((entry) => entry.date.isSameDay(date)) ?? null
		);
	}

	function addEntry(habitPath: Habit["path"], date: DateValue) {
		habitRepository.addEntry(habitPath, date);

		return undefined;
	}

	function toggleHabit(entry: Entry) {
		const entryToUpdate = entry.cycleStatus();
		// Should update the entry in the obsidian file

		return undefined;
	}
</script>

{#snippet habitsHeader(value: string)}
	{#if value}
		<th>
			{value}
		</th>
	{:else}
		<th> Missing Habit Header </th>
	{/if}
{/snippet}

{#snippet dateHeader(date: DateValue)}
	<th>{date.format()}</th>
{/snippet}

{#snippet habitCell({ name, path }: Partial<Habit>)}
	{#if name}
		<td>
			<a aria-label={path} href={path} class="internal-link">
				{name}
			</a>
		</td>
	{:else}
		<td>Missing Habit Name</td>
	{/if}
{/snippet}

{#snippet entryCell(
	entry: Entry | null,
	date: DateValue,
	habitPath: Habit["path"],
)}
	{#if entry}
		<td onclick={toggleHabit(entry)} class="disable-text-selection">
			{entry.display()}
		</td>
	{:else if entry === null}
		<td onclick={addEntry(habitPath, date)} class="disable-text-selection">
			{Entry.STATUS_DISPLAY.unstarted}
		</td>
	{:else}
		<td>Invalid</td>
	{/if}
{/snippet}

<table class="purpleTheme">
	<thead>
		<tr>
			{@render habitsHeader(title)}
			{#each dateRange as day}{@render dateHeader(day)}{/each}
		</tr>
	</thead>
	<tbody>
		{#each $habitStore as habit}
			<tr>
				{@render habitCell({ name: habit.name, path: habit.path })}
				{#each dateRange as date}
					{@render entryCell(
						getEntryByDate(habit.id, date),
						date,
						habit.path,
					)}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table.purpleTheme {
		width: 100%;
		text-align: center;
		border-collapse: separate;
		border-spacing: 6px;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
	}

	table.purpleTheme td,
	table.purpleTheme th {
		text-align: center;
		width: 32px;
		height: 32px;
		padding: 18px 12px;
		border-radius: 6px;
	}

	table.purpleTheme tbody td {
		color: var(--text-normal);
		background-color: rgba(74, 43, 112, 0.05);
		border: 1px solid rgba(74, 43, 112, 0.2);
	}

	table.purpleTheme thead th {
		background: #722aca;
		color: #ffffff;
	}

	table.purpleTheme tbody tr:hover td {
		background-color: rgba(74, 43, 112, 0.15);
		transform: translateY(-0.5px);
		transition: all 0.4s ease;
	}

	table.purpleTheme td:hover {
		background-color: rgba(76, 24, 141, 0.3) !important;
		cursor: pointer;
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	table.purpleTheme td:active {
		transform: scale(0.95);
		transition: transform 0.1s;
	}
	.disable-text-selection {
		user-select: none;
	}
</style>
