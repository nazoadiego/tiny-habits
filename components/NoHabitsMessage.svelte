<script lang="ts">
	interface $Props { numberOfDates: number; createHabit: () => void }
	const { numberOfDates, createHabit }: $Props = $props()
</script>
<tr>
	<td class="no-habits-message" colspan={numberOfDates + 1}>
		<p>No habits yet</p>
		<button type="button" class="mod-cta" onclick={createHabit}>Create habit</button>
	</td>
</tr>

<style>
  td {
    border-radius: var(--radius-m);
  }

  .no-habits-message {
    text-align: center;
    color: var(--text-faint);
    padding: 4em 0;
  }

  p {
    margin: 0 0 1em;
  }
</style>
