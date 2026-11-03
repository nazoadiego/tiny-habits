<script lang="ts">
	import { onMount } from 'svelte'
	import type Habit from 'models/Habit'
	import { CADENCES, CADENCE_NAMES, type Cadence } from 'models/Cadence'
	import { WEEKDAYS, WEEKDAY_NAMES, type Weekday } from 'models/Schedule'
	import type { THabitRepository } from 'repositories/HabitRepository'

	interface $Props {
		habit: Habit;
		updateSchedule: THabitRepository['updateSchedule'];
		updateCadence: THabitRepository['updateCadence'];
		close: () => void;
	}

	const { habit, updateSchedule, updateCadence, close }: $Props = $props()

	let editor: HTMLElement | undefined = $state()

	onMount(() => editor?.querySelector('button')?.focus())

	function toggle(day: Weekday) {
		void updateSchedule(habit, habit.schedule.toggle(day))
	}

	const CADENCE_HINTS: Record<Cadence, string> = {
		day: 'Applies on the weekdays you pick. Leave empty for every day. Other days show as skipped, and you can still mark them.',
		week: 'One entry per week, weeks start on Monday. Mark it on any day that week and the whole week counts.',
		month: 'One entry per month. Mark it on any day that month and the whole month counts.'
	}

	function setCadence(cadence: Cadence) {
		if (cadence !== habit.cadence) void updateCadence(habit, cadence)
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close()
	}
</script>

<div bind:this={editor} class="schedule-editor" role="toolbar" aria-label="{habit.name} schedule" onkeydown={handleKeydown} tabindex="-1">
	<div class="schedule-editor-header">
		<span>Repeats</span>
		<small class="faint">{CADENCE_HINTS[habit.cadence]}</small>
	</div>

	<div class="chips" role="group" aria-label="Repeats">
		{#each CADENCES as cadence (cadence)}
			<button
				class="chip cadence"
				aria-pressed={habit.cadence === cadence}
				onclick={() => setCadence(cadence)}
			>
				{CADENCE_NAMES[cadence]}
			</button>
		{/each}
	</div>

	{#if habit.cadence === 'day'}
		<div class="chips" role="group" aria-label="Weekdays">
			{#each WEEKDAYS as day (day)}
				<button
					class="chip"
					aria-pressed={habit.schedule.includes(day)}
					aria-label={WEEKDAY_NAMES[day].long}
					onclick={() => toggle(day)}
				>
					{WEEKDAY_NAMES[day].short.slice(0, 2)}
				</button>
			{/each}
		</div>
	{/if}

</div>

<style>
	.schedule-editor {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		padding: 12px;
	}

	.schedule-editor-header {
		display: flex;
		flex-direction: column;
		margin-inline-end: auto;
	}

	.faint {
		color: var(--text-faint);
	}

	.chips {
		display: flex;
		gap: 4px;
	}

	button.chip {
		width: 36px;
		height: 36px;
		padding: 0;
		border-radius: var(--radius-m);
		border: 1px solid var(--background-modifier-border);
		background-color: rgba(var(--mono-rgb-0), 0.4);
		box-shadow: none;
		cursor: pointer;
	}

	button.chip.cadence {
		width: auto;
		padding-inline: 12px;
	}

	button.chip[aria-pressed="true"] {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
		border-color: transparent;
	}

	button.chip:focus-visible {
		outline: 3px solid var(--background-modifier-border);
		outline-offset: 1px;
	}
</style>
