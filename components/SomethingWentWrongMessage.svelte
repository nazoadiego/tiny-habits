<script lang="ts">
	import { Notice } from 'obsidian'

	const exampleCode = '{\n"folderPath": "habits",\n"displayName": "My Habits"\n}'

	async function copyToClipboard() {
		new Notice('Copied to clipboard!')
		await navigator.clipboard.writeText(exampleCode)
	}
</script>

<div class="error-container">
	<p>Something went wrong, perhaps the settings are not in the right format? Here is an example:</p>

	<div class="code-block">
		<pre>{exampleCode}</pre>
		<button on:click={copyToClipboard} class="copy-button">
			Copy
		</button>
	</div>
</div>

<style>
    .error-container {
        border-radius: var(--radius-m);
        text-align: center;
        color: var(--text-faint);
        padding: 4em 0;
    }

    .code-block {
        position: relative;
        max-width: 300px;
        margin: 2em auto;
    }

    pre {
        background: var(--background-secondary);
        padding: 1em;
        border-radius: var(--radius-s);
        text-align: left;
        font-family: var(--font-monospace);
        font-size: 0.9em;
    }

    .copy-button {
        background-color: rgba(var(--mono-rgb-0), 0.4);
        position: absolute;
        top: 0.5em;
        right: 0.5em;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .code-block:hover .copy-button {
        opacity: 1;
    }
</style>
