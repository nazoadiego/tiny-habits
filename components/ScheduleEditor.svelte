<script lang="ts">
	import { onMount } from 'svelte'
	import type Habit from 'models/Habit'
	import { WEEKDAYS, WEEKDAY_NAMES, type Weekday } from 'models/Schedule'
	import type { THabitRepository } from 'repositories/HabitRepository'

	interface $Props {
		habit: Habit;
		updateSchedule: THabitRepository['updateSchedule'];
		close: () => void;
	}

	const { habit, updateSchedule, close }: $Props = $props()

	let hint = $state('')
	let editor: HTMLElement | undefined = $state()

	onMount(() => editor?.querySelector('button')?.focus())

	function toggle(day: Weekday) {
		const schedule = habit.schedule.toggle(day)

		if (schedule == undefined) {
			hint = 'A habit needs at least one day.'
			return
		}

		hint = ''
		void updateSchedule(habit, schedule)
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close()
	}
</script>

<div bind:this={editor} class="schedule-editor" role="toolbar" aria-label="{habit.name} schedule" onkeydown={handleKeydown} tabindex="-1">
	<div class="schedule-editor-header">
		<span>Applies on</span>
		<small class="faint">Other days show as skipped. You can still mark them.</small>
	</div>

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

	<small class="faint" aria-live="polite">{hint}</small>
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
