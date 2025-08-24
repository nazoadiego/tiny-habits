<script lang="ts">
	import DateRange from "models/DateRange";
	import { habitStore } from "stores/store";
	import HabitsTableHead from "./HabitsTableHead.svelte";
	import HabitsTableBody from "./HabitsTableBody.svelte";
	import type Entry from "models/Entry";
	import type Habit from "models/Habit";
	import type { collapseStatuses } from "types/ui";
	import Icon from "./icons/Icon.svelte";

	interface $Props {
		updateEntry: (habitPath: Habit["path"], entry: Entry) => void;
		folderPath: string;
		displayName: string | undefined;
	}

	const { updateEntry, folderPath, displayName }: $Props = $props();

	const habits = $derived($habitStore[folderPath]);

	const HEADER_NUMBER_OF_DAYS = 7;
	let currentOffset = $state(0);

	const dates = $derived(
		DateRange.from(HEADER_NUMBER_OF_DAYS, "backwards", currentOffset)
			.getDates()
			.toReversed()
	);

	function moveBack() {
		currentOffset -= 1;
	}

	function moveForward() {
		currentOffset += 1;
	}

	function moveToToday() {
		currentOffset = 0;
	}

	let collapseStatus: collapseStatuses = $state("init")

	const toggleCollapse = () => {
		if(collapseStatus === "init") {
			collapseStatus = "collapsed"
			return
		}

		collapseStatus = collapseStatus === "collapsed" ? "expanded" : "collapsed"
	};
</script>

<table class="purple-theme">
	<HabitsTableHead
		title={displayName || folderPath}
		{dates}
		{toggleCollapse}
	/>

	<HabitsTableBody
		{habits}
		{dates}
		{updateEntry}
		{collapseStatus}
	/>
</table>
<div class="date-controls-container">
	<div class="habits-info-section"></div>
	<button class="date-control" onclick={moveToToday} aria-label="Return to today">
		<Icon icon="lucide-timer-reset" />
	</button>
	<button class="date-control" onclick={moveBack} aria-label="Previous day">
		<Icon icon="lucide-chevron-left" />
	</button>
	<button class="date-control" onclick={moveForward} aria-label="Next day">
		<Icon icon="lucide-chevron-right" />
	</button>
</div>

<style>
	table.purple-theme {
		width: 100%;
		border-collapse: separate;
		border-spacing: 6px;
		border-radius: var(--radius-m);
		margin-bottom: 0;
	}

	div.date-controls-container {
		display: flex;
		justify-content: end;
		gap: 6px;
		padding-left: 6px;
		padding-right: 6px;
	}

	div.habits-info-section {
		width: 100%;
		height: 48px;
		display: flex;
		align-items: center;
		padding-left: 18px;
		background-color: rgba(var(--mono-rgb-0), 0.4);
		border: 1px solid var(--background-modifier-border);
		border-radius: var(--radius-m);
	}

	button.date-control {
		width: 48px;
		height: 48px;
		background-color: rgba(var(--mono-rgb-0), 0.4);
		border: 1px solid var(--background-modifier-border);
		border-radius: var(--radius-m);
	}

	button.date-control:hover {
		background-color: rgba(var(--mono-rgb-0), 0.1);
		transition: all 0.3s ease-in-out;
	}
</style>
