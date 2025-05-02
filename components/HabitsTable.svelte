<script lang="ts">
	// TODO: Move Types to a different file
	type HabitGroup = {
		id: number;
		name: string;
	};

	type Status = "unstarted" | "completed" | "failed" | "skip";
	type StatusDisplay = "O" | "X" | "-" | "";

	const STATUS = {
		unstarted: "unstarted",
		completed: "completed",
		failed: "failed",
		skip: "skip",
	} as const;

	const STATUS_CYCLE: Status[] = [
		STATUS.unstarted,
		STATUS.completed,
		STATUS.failed,
		STATUS.skip,
	];

	const STATUS_DISPLAY: Record<Status, StatusDisplay> = {
		unstarted: "",
		completed: "O",
		failed: "X",
		skip: "-",
	};

	type Day = number;

	type HabitEntry = {
		id: number;
		groupId: number;
		status: Status;
		day: Day;
	};

	const days: Day[] = Array.from(
		{ length: 7 },
		(_element, index) => index + 1,
	);

	const title = "Habits";

	const habitGroups: HabitGroup[] = [
		{ id: 1, name: "Study" },
		{ id: 2, name: "Breakfast" },
	];

	let entries: HabitEntry[] = [
		{ id: 1, groupId: 1, status: "failed", day: 1 },
		{ id: 2, groupId: 1, status: "failed", day: 2 },
		{ id: 3, groupId: 1, status: "failed", day: 3 },
		{ id: 4, groupId: 1, status: "failed", day: 4 },
		{ id: 5, groupId: 1, status: "failed", day: 5 },
		{ id: 6, groupId: 1, status: "failed", day: 6 },
		{ id: 7, groupId: 1, status: "failed", day: 7 },
		{ id: 8, groupId: 2, status: "completed", day: 1 },
	];

	$: groupedEntries = Object.groupBy(entries, (entry) => entry.groupId);

	function getEntry(groupId: number, day: number): HabitEntry | null {
		return (
			groupedEntries[groupId]?.find(
				(entry) => entry.day === Number(day),
			) ?? null
		);
	}

	function cycleStatuses(currentStatus: Status) {
		const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
		const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
		const newStatus = STATUS_CYCLE[nextIndex];
		return newStatus;
	}

	function addEntry(day: Day, groupId: number) {
		const maxId = Math.max(...entries.map((e) => e.id));
		const newEntry = {
			id: maxId + 1,
			groupId,
			status: STATUS.unstarted,
			day,
		};
		entries = [...entries, newEntry];

		return undefined;
	}

	function toggleHabit(entryToUpdate: HabitEntry) {
		entryToUpdate.status = cycleStatuses(entryToUpdate.status);
		entries = [...entries, entryToUpdate];

		return undefined;
	}
</script>

{#snippet habitGroupHeader(value: string)}
	{#if value}
		<th>{value}</th>
	{:else}
		<th>-</th>
	{/if}
{/snippet}

{#snippet dayHeader(value: Day)}
	{#if value}
		<th>{value}</th>
	{:else}
		<th>-</th>
	{/if}
{/snippet}

{#snippet habitGroupCell(value: string)}
	{#if value}
		<td>{value}</td>
	{:else}
		<td>-</td>
	{/if}
{/snippet}

{#snippet habitEntryCell(entry: HabitEntry | null, day: Day, groupId: number)}
	{#if entry}
		<td onclick={toggleHabit(entry)}>
			{STATUS_DISPLAY[entry.status]}
		</td>
	{:else if entry === null}
		<td onclick={addEntry(day, groupId)}>
			{STATUS_DISPLAY[STATUS.unstarted]}
		</td>
	{:else}
		<td>Invalid</td>
	{/if}
{/snippet}

<table class="blueTable">
	<thead>
		<tr>
			{@render habitGroupHeader(title)}
			{#each days as day}
				{@render dayHeader(day)}
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each habitGroups as habitGroup}
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
	table.blueTable {
		width: 100%;
		text-align: center;
		border-collapse: separate;
		border-spacing: 6px;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
	}

	table.blueTable td,
	table.blueTable th {
		text-align: center;
		width: 32px;
		height: 32px;
		padding: 18px 12px;
		border-radius: 6px;
	}

	table.blueTable tbody td {
		color: var(--text-normal);
		background-color: rgba(74, 43, 112, 0.05);
		border: 1px solid rgba(74, 43, 112, 0.2);
	}

	table.blueTable thead th {
		background: #722aca;
		color: #ffffff;
	}

	table.blueTable tbody tr:hover td {
		background-color: rgba(74, 43, 112, 0.15);
		transform: translateY(-0.5px);
		transition: all 0.4s ease;
	}

	table.blueTable td:hover {
		background-color: rgba(76, 24, 141, 0.3) !important;
		cursor: pointer;
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	table.blueTable td:active {
		transform: scale(0.95);
		transition: transform 0.1s;
	}
</style>
