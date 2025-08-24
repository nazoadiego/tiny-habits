<script lang="ts">
	interface $Props { numberOfDates: number }
	const { numberOfDates }: $Props = $props()
</script>
<tr>
	<td class="no-habits-message" colspan={numberOfDates + 1}>
		No habits found, add a new note!
	</td>
</tr>

<style>
  td {
    border-radius: var(--radius-m);
  }

  .no-habits-message {
    text-align: center;
    color: var(--text-faint);
    padding: 8em 0;
  }
</style>
