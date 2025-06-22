<script lang="ts">
  import type Habit from "models/Habit";
  import Entry from "models/Entry";
  import DateValue from "models/DateValue";
  import EntryIcon from "./icons/EntryIcon.svelte";

  // ? Can habit repository be moved to a store?
  interface $Props {
    habits: Habit[];
    dates: DateValue[];
    updateEntry: (habitPath: string, entry: Entry) => void;
  }

  const { habits, dates, updateEntry }: $Props = $props();

  function getEntryByDate(entries: Entry[], date: DateValue, habitPath: Habit['path']): Entry {
  	return entries.find((entry) => entry.date.isSameDay(date)) || Entry.empty({ date, habitPath })
  }
</script>

<tbody>
  {#each habits as habit (habit.id)}
    <tr>
      {@render habitCell(habit.name, habit.path)}
      {#each dates as date (date.toString())}
        {@render entryCell(getEntryByDate(habit.entries, date, habit.path))}
      {/each}
    </tr>
  {/each}
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
    class="disable-text-selection entry-cell"
    data-status={entry.status}
  >
    <EntryIcon status={entry.status} />
  </td>
{/snippet}

<style>
  :root {
    --success-green: #4caf50;
    --failure-red: #f44336;
    --skip-blue: #64b5f6;
  }

  @media screen and (max-width: 768px) {
    /* Hide all date columns except the last one */
    td.entry-cell:not(:last-of-type) {
      display: none;
    }
  }

  td {
    font-size: 16px;
    text-align: center;
    padding: 18px 12px;
    border-collapse: separate;
    border-spacing: 6px;
    border-radius: 6px;
  }

  tbody td {
    cursor: pointer;
    color: var(--text-normal);
  }

  td.entry-cell[data-status="skip"] {
    background-color: var(--skip-blue);
  }
  td.entry-cell[data-status="completed"] {
    background-color: var(--success-green);
  }

  td.entry-cell[data-status="failed"] {
    background-color: var(--failure-red);
  }

  tr:hover td.entry-cell {
    opacity: 0.7;
    transform: translateY(-0.5px);
    transition: all 0.2s ease;
  }

  tr:hover td.entry-cell:hover {
    opacity: 1;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  td.habit-cell {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .disable-text-selection {
    user-select: none;
  }
</style>
