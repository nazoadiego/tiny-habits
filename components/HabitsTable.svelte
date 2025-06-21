<script lang="ts">
	import DateRange from "models/DateRange";
	import { habitStore } from "stores/store";
	import HabitsTableHead from "./HabitsTableHead.svelte";
	import HabitsTableBody from "./HabitsTableBody.svelte";
    import type Entry from "models/Entry";
    import type Habit from "models/Habit";

	interface $Props {
		updateEntry: (habitPath: Habit['path'], entry: Entry) => void;
		folderPath: string;
		displayName: string | undefined;
	}

	const { updateEntry, folderPath, displayName }: $Props = $props();

	const habits = $derived($habitStore[folderPath]);

	const HEADER_NUMBER_OF_DAYS = 7;
	const dates = DateRange.from(HEADER_NUMBER_OF_DAYS, "backwards")
		.getDates()
		.toReversed();
</script>

<table class="purple-theme">
	<HabitsTableHead title={displayName || folderPath} {dates} />
	<HabitsTableBody {habits} {dates} {updateEntry} />
</table>

<style>
	table.purple-theme {
		width: 100%;
		border-collapse: separate;
		border-spacing: 6px;
		border-radius: 6px;
	}
</style>
