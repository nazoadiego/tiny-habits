<script lang="ts">
	import DateRange from "models/DateRange";
	import { habitStore } from "stores/store";
	import HabitsTableHead from "./HabitsTableHead.svelte";
	import HabitsTableBody from "./HabitsTableBody.svelte";
	import type Entry from "models/Entry";
	import type Habit from "models/Habit";
	import type { collapseStatuses } from "types";

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
	<button class="date-control" onclick={moveBack}>Back</button>
	<button class="date-control" onclick={moveForward}>Next</button>
</div>

<style>
	table.purple-theme {
		width: 100%;
		border-collapse: separate;
		border-spacing: 6px;
		border-radius: var(--radius-m);
	}

	div.date-controls-container {
		display: flex;
		justify-content: end;
		gap: 0.5rem;
		padding-right: 6px;
	}
</style>
