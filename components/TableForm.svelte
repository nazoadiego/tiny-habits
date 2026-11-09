<script lang="ts">
	import { onMount } from 'svelte'
	import { CADENCES, CADENCE_NAMES, type Cadence } from 'models/Cadence'
	import { suggestFolder, type TableDetails } from 'models/TableBlock'

	interface $Props {
		/** The vault's existing folders. */
		folders: string[];
		/** Adds the table. Resolves to whether it worked; the dialog stays open when it didn't. */
		save: (details: TableDetails) => Promise<boolean>;
		close: () => void;
	}

	const { folders, save, close }: $Props = $props()

	const NEW_FOLDER = ''

	const CADENCE_HINTS: Record<Cadence, string> = {
		day: 'One column per day. Every habit in the table follows it.',
		week: 'One column per week, starting on Monday.',
		month: 'One column per month.'
	}

	let name = $state('')
	let cadence: Cadence = $state('day')
	// svelte-ignore state_referenced_locally
	let folder = $state(folders[0] ?? NEW_FOLDER)
	let newFolder = $state('')
	let isNewFolderEdited = $state(false)
	let isSaving = $state(false)

	const isNew = $derived(folder === NEW_FOLDER)
	const folderPath = $derived((isNew ? newFolder : folder).trim().replaceAll(/^\/+|\/+$/g, ''))
	const canSave = $derived(folderPath !== '' && !isSaving)

	let nameInput: HTMLInputElement | undefined = $state()

	onMount(() => nameInput?.focus())

	// The new folder follows the name until the user types a folder of their own.
	function changeName() {
		if (!isNewFolderEdited) newFolder = suggestFolder(name)
	}

	async function submit() {
		if (!canSave) return

		isSaving = true

		const wasSaved = await save({ folderPath, displayName: name, cadence })

		if (wasSaved) close()
		else isSaving = false
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.isComposing) return

		event.preventDefault()
		void submit()
	}
</script>

<form class="table-form" onsubmit={(event) => event.preventDefault()}>
	<div class="field">
		<label for="table-name">Name</label>
		<input id="table-name" type="text" placeholder="My Habits" bind:value={name} bind:this={nameInput} oninput={changeName} onkeydown={handleKeydown} />
		<small class="faint">Shown above the table. Optional.</small>
	</div>

	<div class="field">
		<label for="table-folder">Folder</label>
		<select id="table-folder" class="dropdown" bind:value={folder}>
			{#each folders as existing (existing)}
				<option value={existing}>{existing}</option>
			{/each}
			<option value={NEW_FOLDER}>New folder…</option>
		</select>
		{#if isNew}
			<input type="text" aria-label="New folder path" placeholder="habits/reading" bind:value={newFolder} oninput={() => (isNewFolderEdited = true)} onkeydown={handleKeydown} />
			<small class="faint">Created when you add the table.</small>
		{:else}
			<small class="faint">The habit notes of this table live here.</small>
		{/if}
	</div>

	<div class="field">
		<span class="label" id="table-cadence">Repeats</span>
		<div class="segments" role="group" aria-labelledby="table-cadence">
			{#each CADENCES as option (option)}
				<button type="button" class="segment" aria-pressed={cadence === option} onclick={() => (cadence = option)}>{CADENCE_NAMES[option]}</button>
			{/each}
		</div>
		<small class="faint">{CADENCE_HINTS[cadence]}</small>
	</div>

	<div class="modal-button-container">
		<button type="button" onclick={close}>Cancel</button>
		<button type="button" class="mod-cta" disabled={!canSave} onclick={submit}>Add table</button>
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

	small.faint {
		color: var(--text-faint);
	}

	.segments {
		display: flex;
		border: 1px solid var(--background-modifier-border);
		border-radius: var(--radius-m);
		overflow: hidden;
	}

	button.segment {
		flex: 1;
		border: none;
		border-radius: 0;
		box-shadow: none;
		cursor: pointer;
		background-color: rgba(var(--mono-rgb-0), 0.4);
	}

	button.segment[aria-pressed="true"] {
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	button.segment:focus-visible {
		outline: 3px solid var(--background-modifier-border);
		outline-offset: -3px;
	}
</style>
