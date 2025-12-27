<script lang="ts">
	import DateRange from 'models/DateRange'
	import { habitStore } from 'stores/store'
	import HabitsTableHead from './HabitsTableHead.svelte'
	import HabitsTableBody from './HabitsTableBody.svelte'
	import Icon from './icons/Icon.svelte'
	import type SourceSettings from 'models/SourceSettings'
	import { CollapseStatus } from 'UI/CollapseStatus'
	import type { THabitRepository } from 'repositories/HabitRepository'

	interface $Props {
		settings: SourceSettings;
		updateEntry: THabitRepository['updateEntry'];
	}

	const { updateEntry, settings }: $Props = $props()

	const habits = $derived($habitStore[settings.folderPath])

	const HEADER_NUMBER_OF_DAYS = 7
	let currentOffset = $state(0)

	const dates = $derived(
		DateRange.from(HEADER_NUMBER_OF_DAYS, 'backwards', currentOffset)
			.getDates()
			.toReversed()
	)

	function moveBack() {
		currentOffset -= 1
	}

	function moveForward() {
		currentOffset += 1
	}

	function moveToToday() {
		currentOffset = 0
	}

	const collapseStatus = new CollapseStatus(settings.folderPath)
	let collapseState = $state(collapseStatus.state)
	const toggleCollapse = () => collapseState = collapseStatus.toggle()
</script>

<table class="purple-theme">
	<HabitsTableHead
		title={settings.displayName || settings.folderPath}
		{dates}
		{toggleCollapse}
	/>

	<HabitsTableBody
		{habits}
		{dates}
		{updateEntry}
		{collapseState}
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
		cursor: pointer;
	}

	button.date-control:hover {
		background-color: rgba(var(--mono-rgb-0), 0.1);
		transition: all 0.3s ease-in-out;
	}
</style>
