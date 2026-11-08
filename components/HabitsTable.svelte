<script lang="ts">
	import { habitStore } from 'stores/store'
	import HabitsTableHead from './HabitsTableHead.svelte'
	import HabitsTableBody from './HabitsTableBody.svelte'
	import Icon from './icons/Icon.svelte'
	import { entryDatesOf, visibleDates } from 'models/Cadence'
	import DateValue from 'models/DateValue'
	import type Habit from 'models/Habit'
	import type SourceSettings from 'models/SourceSettings'
	import { CollapseStatus } from 'UI/CollapseStatus'
	import type { THabitRepository } from 'repositories/HabitRepository'
	import { EntrySelection } from 'UI/EntrySelection'
	import { untrack } from 'svelte'

	interface $Props {
		settings: SourceSettings;
		updateEntries: THabitRepository['updateEntries'];
		editHabit: (habit: Habit) => void;
		moveHabit: THabitRepository['moveHabit'];
		loadHabits: (folderPath: string, dateFilter: Set<string>) => void;
	}

	const { updateEntries, editHabit, moveHabit, settings, loadHabits }: $Props = $props()

	const habits = $derived($habitStore[settings.folderPath])

	const cadence = $derived(settings.cadence)

	/** How many days, weeks or months the table is moved from the current one. */
	let currentOffset = $state(0)

	const currentDay = () => new DateValue(new Date().toISOString())

	/** Kept up to date while the note stays open, so the columns move on when a new day, week or month starts. */
	let today = $state(currentDay())

	let table: HTMLTableElement | undefined = $state()

	$effect(() => {
		const timer = setInterval(() => {
			// The host never unmounts a table whose note re-rendered, so a table that left the page stops its own timer.
			if (table != undefined && !table.isConnected) return clearInterval(timer)

			const now = currentDay()
			if (!now.isSameDay(today)) today = now
		}, 60_000)

		return () => clearInterval(timer)
	})

	/** The columns: the first day of each day, week or month, oldest first. */
	const dates = $derived(visibleDates(cadence, currentOffset, today))

	const dateFilter = $derived(entryDatesOf(dates))

	// The table decides which entries it needs: it loads them on mount and whenever its columns change.
	$effect(() => {
		const filter = dateFilter
		untrack(() => loadHabits(settings.folderPath, filter))
	})

	// Cleared whenever the date window moves, so no selected cell is ever out of view.
	let selection = $state(EntrySelection.empty())

	function moveBack() {
		selection = EntrySelection.empty()
		currentOffset -= 1
	}

	function moveForward() {
		selection = EntrySelection.empty()
		currentOffset += 1
	}

	function moveToToday() {
		selection = EntrySelection.empty()
		currentOffset = 0
		today = currentDay()
	}

	const getSettings = () => settings
	let collapseStatus = $state(new CollapseStatus(getSettings().folderPath))
	const toggleCollapse = () => collapseStatus = collapseStatus.toggle()
</script>

{#if habits}
	<table class="purple-theme" bind:this={table}>
		<HabitsTableHead
			title={settings.displayName || settings.folderPath}
			{dates}
			{cadence}
			{toggleCollapse}
		/>

		<HabitsTableBody
			{habits}
			{dates}
			{cadence}
			{updateEntries}
			{editHabit}
			moveHabit={(fromIndex, toIndex) => moveHabit(habits, fromIndex, toIndex)}
			{collapseStatus}
			bind:selection
		/>
	</table>
	<div class="date-controls-container">
		<div class="habits-info-section"></div>
		<button class="date-control" onclick={moveToToday} aria-label="Return to today">
			<Icon icon="lucide-timer-reset" />
		</button>
		<button class="date-control" onclick={moveBack} aria-label="Previous {cadence}">
			<Icon icon="lucide-chevron-left" />
		</button>
		<button class="date-control" onclick={moveForward} aria-label="Next {cadence}">
			<Icon icon="lucide-chevron-right" />
		</button>
	</div>
{/if}

<style>
	table.purple-theme {
		width: 100%;
		/* Column widths come from the cells' own width, not their content, so every date column is the same size. */
		table-layout: fixed;
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
