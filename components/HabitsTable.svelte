<script lang="ts">
	import { DateValue } from "models/DateValue";
	import Entry from "models/Entry";
	import Habit from "models/Habit";
	import HabitRepository from "repositories/HabitRepository";
	import EntryIcon from "./icons/EntryIcon.svelte";
	import { habitStore } from "stores/store";

	interface $Props {
		habitRepository: HabitRepository;
		folderPath: string;
	}

	const { habitRepository, folderPath }: $Props = $props();

	const habits = $derived($habitStore[folderPath]);

	const HEADER_NUMBER_OF_DAYS = 7;

	// TODO: Move to DateValue class methods! why not, or even better a DateRange
	const dateRange: DateValue[] = Array.from(
		{ length: HEADER_NUMBER_OF_DAYS },
		(_element, index) => {
			const date = new Date();
			date.setDate(date.getDate() - index);
			return new DateValue(date);
		},
	).toReversed();

	// TODO: Move when headers are a component
	const title = folderPath;

	// TODO: This could be simplified, and also done in parallel
	function getEntryByDate(habitId: string, date: DateValue): Entry | undefined {
		const habit = habits.find((habit) => habit.id === habitId);

		if (!habit) return undefined;

		return habit.entries.find((entry) => entry.date.isSameDay(date));
	}

	function addEntry(habitPath: Habit["path"], date: DateValue) {
		habitRepository.addEntry(habitPath, date);

		return undefined;
	}

	function updateEntry(habitPath: Habit["path"], entry: Entry) {
		habitRepository.updateEntry(habitPath, entry);

		return undefined;
	}
</script>

{#snippet habitsHeader(title: string)}
	<th>
		{title || "Missing Habit Header"}
	</th>
{/snippet}

{#snippet dateHeader(date: DateValue)}
	<th>{date.toDayString()}</th>
{/snippet}

{#snippet habitCell({ name, path }: Partial<Habit>)}
	<td>
		<a aria-label={path} href={path} class="internal-link">
			{name}
		</a>
	</td>
{/snippet}

{#snippet entryCell(
	entry: Entry | undefined,
	date: DateValue,
	habitPath: Habit["path"],
)}
	<td
		onclick={entry ? updateEntry(habitPath, entry) : addEntry(habitPath, date)}
		class="disable-text-selection entry-cell"
		data-status={entry ? entry.status : Entry.STATUS.unstarted}
	>
		<EntryIcon status={entry ? entry.status : Entry.STATUS.unstarted} />
	</td>
{/snippet}

<table class="purple-theme">
	<thead>
		<tr>
			{@render habitsHeader(title)}
			{#each dateRange as date (date.toString())}
				{@render dateHeader(date)}
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each habits as habit (habit.id)}
			<tr>
				{@render habitCell({ name: habit.name, path: habit.path })}
				{#each dateRange as date (date.toString())}
					{@render entryCell(getEntryByDate(habit.id, date), date, habit.path)}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	:root {
		--success-green: #4caf50;
		--failure-red: #f44336;
		--skip-blue: #64b5f6;
	}

	table.purple-theme {
		width: 100%;
		border-collapse: separate;
		border-spacing: 6px;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
	}

	table.purple-theme td[data-status="skip"] {
		background-color: var(--skip-blue);
	}
	table.purple-theme td[data-status="completed"] {
		background-color: var(--success-green);
	}

	table.purple-theme td[data-status="failed"] {
		background-color: var(--failure-red);
	}

	table.purple-theme td,
	table.purple-theme th {
		text-align: center;
		padding: 18px 12px;
		border-radius: 6px;
	}

	table.purple-theme tbody td {
		cursor: pointer;
		color: var(--text-normal);
		border: 1px solid rgba(74, 43, 112, 0.2);
	}

	table.purple-theme thead th {
		border: 1px solid rgba(74, 43, 112, 0.2);
	}

	table.purple-theme tr:hover td.entry-cell {
		opacity: 0.7;
		transform: translateY(-0.5px);
		transition: all 0.2s ease;
	}

	table.purple-theme tr:hover td.entry-cell:hover {
		opacity: 1;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.disable-text-selection {
		user-select: none;
	}
</style>
