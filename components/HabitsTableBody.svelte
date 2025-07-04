<script lang="ts">
  import type Habit from "models/Habit";
  import Entry from "models/Entry";
  import DateValue from "models/DateValue";
  import EntryIcon from "./icons/EntryIcon.svelte";
  import NoHabitsMessage from "./NoHabitsMessage.svelte";

  interface $Props {
    habits: Habit[];
    dates: DateValue[];
    updateEntry: (habitPath: string, entry: Entry) => void;
  }

  const { habits, dates, updateEntry }: $Props = $props();

  const noHabits = $derived(habits.length === 0);

  function getEntryByDate(entries: Entry[], date: DateValue, habitPath: Habit['path']): Entry {
  	return entries.find((entry) => entry.date.isSameDay(date)) || Entry.empty({ date, habitPath })
  }
</script>


<tbody>
  {#if noHabits}
    <NoHabitsMessage numberOfDates={dates.length}/>
  {:else}
    {#each habits as habit (habit.id)}
      <tr>
        {@render habitCell(habit.name, habit.path)}
        {#each dates as date (date.toString())}
          {@render entryCell(getEntryByDate(habit.entries, date, habit.path))}
        {/each}
      </tr>
    {/each}
  {/if}
</tbody>

{#snippet habitCell(name: Habit['name'], path: Habit['path'])}
  <td class="habit-cell">
    <a aria-label={path} href={path} class="internal-link">
      {name}
    </a>
  </td>
{/snippet}

{#snippet entryCell(entry: Entry)}
  <td
    onclick={() => updateEntry(entry.habitPath, entry)}
    class="disable-text-selection entry-cell {entry.status}"
  >
    <EntryIcon status={entry.status} />
  </td>
{/snippet}

<style>
  @media screen and (max-width: 768px) {
    /* Hide all date columns except the last one */
    td.entry-cell:not(:last-of-type) {
      display: none;
    }
  }

  td {
    font-size: var(--tiny-table-font-size);
    text-align: center;
    padding: 18px 12px;
    border-collapse: separate;
    border-spacing: 6px;
    border-radius: var(--radius-m)
  }

  td.entry-cell.skip {
    background-color: var(--skip-blue);
  }
  td.entry-cell.completed {
    background-color: var(--success-green);
  }

  td.entry-cell.failed {
    background-color: var(--color-red);
  }

  tr:hover td.entry-cell {
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  tr:hover td.entry-cell:hover {
    opacity: 1;
    cursor: pointer;
  }

  td.habit-cell {
    background-color: rgba(var(--mono-rgb-0), 0.2)
  }

  .disable-text-selection {
    user-select: none;
  }
</style>
