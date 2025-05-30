<script lang="ts">
	import type { THabitGroup } from "types/THabitGroup";
	import type { TEntry } from "types/TEntry";
	import type { TDay } from "types/TDay";
	import Entry from "models/Entry";

	interface $$Props {
		hasHabits: boolean;
		habitGroupList: THabitGroup[];
		entryList: TEntry[];
	}

	const { habitGroupList, entryList }: $$Props = $props();

	const days: TDay[] = Array.from(
		{ length: 7 },
		(_element, index) => index + 1,
	);

	const title = "Habits";

	const groupedEntries = Object.groupBy(entryList, (entry) => entry.groupId);

	function getEntry(groupId: number, day: number): TEntry | null {
		return (
			groupedEntries[groupId]?.find(
				(entry) => entry.day === Number(day),
			) ?? null
		);
	}

	function addEntry(day: TDay, groupId: number) {
		// Should add entry to obsidian file
		return undefined;
	}

	function toggleHabit(entry: Entry) {
		const entryToUpdate = entry.cycleStatus();
		// Should update the entry in the obsidian file

		return undefined;
	}
</script>

{#snippet habitGroupHeader(value: string)}
	{#if value}
		<th>
			{value}
		</th>
	{:else}
		<th> Missing Habit Header </th>
	{/if}
{/snippet}

{#snippet dayHeader(value: TDay)}
	{#if value}
		<th>{value}</th>
	{:else}
		<th>Date missing</th>
	{/if}
{/snippet}

{#snippet habitGroupCell(value: string)}
	{#if value}
		<td>
			{value}
		</td>
	{:else}
		<td>Missing Habit Name</td>
	{/if}
{/snippet}

{#snippet habitEntryCell(entry: Entry | null, day: TDay, groupId: number)}
	{#if entry}
		<td onclick={toggleHabit(entry)} class="disable-text-selection">
			{entry.display()}
		</td>
	{:else if entry === null}
		<td onclick={addEntry(day, groupId)} class="disable-text-selection">
			{Entry.STATUS_DISPLAY.unstarted}
		</td>
	{:else}
		<td>Invalid</td>
	{/if}
{/snippet}

<table class="purpleTheme">
	<thead>
		<tr>
			{@render habitGroupHeader(title)}
			{#each days as day}
				{@render dayHeader(day)}
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each habitGroupList as habitGroup}
			<tr>
				{@render habitGroupCell(habitGroup.name)}
				{#each days as day}
					{@render habitEntryCell(
						getEntry(habitGroup.id, day),
						day,
						habitGroup.id,
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
