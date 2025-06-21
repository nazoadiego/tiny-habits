<script lang="ts">
	import DateValue from "models/DateValue";
	import Entry from "models/Entry";
	import Habit from "models/Habit";
	import DateRange from "models/DateRange";
	import HabitRepository from "repositories/HabitRepository";
	import { habitStore } from "stores/store";
	import HabitsTableHead from "./HabitsTableHead.svelte";
	import HabitsTableBody from "./HabitsTableBody.svelte";

	interface $Props {
		habitRepository: HabitRepository;
		folderPath: string;
		displayName: string | undefined;
	}

	const { habitRepository, folderPath, displayName }: $Props = $props();

	const habits = $derived($habitStore[folderPath]);

	const HEADER_NUMBER_OF_DAYS = 7;
	const dates = DateRange.from(HEADER_NUMBER_OF_DAYS, "backwards")
		.getDates()
		.toReversed();

	function addEntry(habitPath: Habit["path"], date: DateValue) {
		habitRepository.addEntry(habitPath, date);

		return undefined;
	}

	function updateEntry(habitPath: Habit["path"], entry: Entry) {
		habitRepository.updateEntry(habitPath, entry);

		return undefined;
	}
</script>

<table class="purple-theme">
	<HabitsTableHead title={displayName || folderPath} {dates} />
	<HabitsTableBody {habits} {dates} {addEntry} {updateEntry} />
</table>

<style>
	table.purple-theme {
		width: 100%;
		border-collapse: separate;
		border-spacing: 6px;
		border-radius: 6px;
	}
</style>
