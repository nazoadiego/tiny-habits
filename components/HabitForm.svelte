<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import Habit from 'models/Habit'
	import { CADENCE_NAMES, type Cadence } from 'models/Cadence'
	import { positionLabels } from 'models/HabitOrder'
	import Schedule, { WEEKDAYS, WEEKDAY_NAMES, type Weekday } from 'models/Schedule'
	import type { HabitDetails } from 'repositories/HabitRepository'

	interface $Props {
		/** The habit being edited, or undefined to create one. */
		habit?: Habit;
		/** The folder of the table the form starts on. */
		folderPath: string;
		/** The tables the habit can go to, by folder. */
		habitsByTable: Record<string, Habit[]>;
		/** What one column is in each table, by folder. Tables missing here are daily. */
		cadenceByTable: Record<string, Cadence>;
		/** Saves the form. Resolves to whether it worked; the dialog stays open when it didn't. */
		save: (details: HabitDetails, siblings: Habit[]) => Promise<boolean>;
		close: () => void;
	}

	const { habit, folderPath: startFolder, habitsByTable, cadenceByTable, save, close }: $Props = $props()

	const cadenceOf = (folder: string): Cadence => cadenceByTable[folder] ?? 'day'

	// The form is mounted once per dialog: it starts from what it is given and keeps its own state after that.
	const initial = untrack(() => ({ name: habit?.name ?? '', table: startFolder, schedule: habit?.schedule ?? Schedule.unscheduled(), allTables: Object.keys(habitsByTable), position: habit == undefined ? undefined : habitsByTable[startFolder]?.findIndex(other => other.path === habit.path), isEditing: habit != undefined }))

	const { isEditing, allTables } = initial

	// A habit's cadence is its table's, so an existing habit can only go to a table with the same cadence.
	const tables = isEditing ? allTables.filter(folder => cadenceOf(folder) === cadenceOf(startFolder)) : allTables
	const hasOtherCadences = new Set(allTables.map(folder => cadenceOf(folder))).size > 1

	let name = $state(initial.name)
	let table = $state(initial.table)
	let schedule = $state(initial.schedule)
	const cadence = $derived(cadenceOf(table))
	let isSaving = $state(false)

	/** The other habits of the chosen table, in the order it shows them. */
	const siblings = $derived((habitsByTable[table] ?? []).filter(other => other.path !== habit?.path))

	const originalPosition = initial.position

	/** Undefined leaves the habit where the table's sorting puts it, which is the start for a new habit and for one moved to another table. */
	let position: number | undefined = $state(originalPosition)

	const positions = $derived(positionLabels(siblings.length + 1))

	const nameError = $derived.by(() => {
		if (name.trim() === '') return undefined

		const message = Habit.parseName(name).message
		if (message != undefined) return message

		const isTaken = siblings.some(other => other.name.toLowerCase() === name.trim().toLowerCase())
		return isTaken ? `"${name.trim()}" already exists in ${table}` : undefined
	})

	const canSave = $derived(name.trim() !== '' && nameError == undefined && !isSaving)

	const CADENCE_HINTS: Record<Cadence, string> = {
		day: 'Leave all weekdays off for every day. Other days show as skipped, and you can still mark them.',
		week: 'One entry per week, weeks start on Monday. Set by the table.',
		month: 'One entry per month. Set by the table.'
	}

	let nameInput: HTMLInputElement | undefined = $state()

	onMount(() => nameInput?.focus())

	function changeTable() {
		position = table === startFolder ? originalPosition : undefined
	}

	async function submit() {
		if (!canSave) return

		isSaving = true

		const details = { name: Habit.parseName(name).name ?? name.trim(), folderPath: table, schedule, position }
		const wasSaved = await save(details, siblings)

		if (wasSaved) close()
		else isSaving = false
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.isComposing) return

		event.preventDefault()
		void submit()
	}

	function toggle(day: Weekday) {
		schedule = schedule.toggle(day)
	}
</script>

<form class="habit-form" onsubmit={(event) => event.preventDefault()}>
	<div class="field">
		<label for="habit-name">Name</label>
		<input id="habit-name" type="text" placeholder="Habit name" bind:value={name} bind:this={nameInput} onkeydown={handleKeydown} />
		{#if nameError}
			<small class="error">{nameError}</small>
		{:else if isEditing}
			<small class="faint">Renames the note.</small>
		{/if}
	</div>

	{#if tables.length > 1}
		<div class="field">
			<label for="habit-table">Table</label>
			<select id="habit-table" class="dropdown" bind:value={table} onchange={changeTable}>
				{#each tables as folder (folder)}
					<option value={folder}>{hasOtherCadences ? `${folder} (${CADENCE_NAMES[cadenceOf(folder)]})` : folder}</option>
				{/each}
			</select>
			{#if isEditing}
				<small class="faint">Changing it moves the note to that table's folder.{tables.length < allTables.length ? ` Only ${CADENCE_NAMES[cadence].toLowerCase()} tables are listed.` : ''}</small>
			{/if}
		</div>
	{/if}

	{#if cadence !== 'day'}
		<small class="faint cadence-hint">{CADENCE_HINTS[cadence]}</small>
	{/if}

	{#if cadence === 'day'}
		<div class="field">
			<span class="label" id="habit-weekdays">Weekdays</span>
			<div class="chips" role="group" aria-labelledby="habit-weekdays">
				{#each WEEKDAYS as day (day)}
					<button
						type="button"
						class="chip"
						aria-pressed={schedule.includes(day)}
						aria-label={WEEKDAY_NAMES[day].long}
						onclick={() => toggle(day)}
					>
						{WEEKDAY_NAMES[day].short.slice(0, 2)}
					</button>
				{/each}
			</div>
			<small class="faint">{CADENCE_HINTS.day}</small>
		</div>
	{/if}

	<div class="field">
		<label for="habit-position">Position</label>
		<select id="habit-position" class="dropdown" bind:value={position}>
			<option value={undefined}>Automatic (by name)</option>
			{#each positions as label, index (index)}
				<option value={index}>{label}</option>
			{/each}
		</select>
	</div>

	<div class="modal-button-container">
		<button type="button" onclick={close}>Cancel</button>
		<button type="button" class="mod-cta" disabled={!canSave} onclick={submit}>{isEditing ? 'Save' : 'Add habit'}</button>
	</div>
</form>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 16px;
	}

	.field input,
	.field select {
		width: 100%;
	}

	small.cadence-hint {
		margin: -8px 0 16px;
	}

	small.faint {
		color: var(--text-faint);
	}

	small.error {
		color: var(--text-error);
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
