<script lang="ts">
  import type Habit from "models/Habit";
  import Entry from "models/Entry";
  import { DateValue } from "models/DateValue";
  import EntryIcon from "./icons/EntryIcon.svelte";
  import type { MouseEventHandler } from "svelte/elements";

  interface $Props {
    habits: Habit[];
    dates: DateValue[];
    addEntry: (
      habitPath: string,
      date: DateValue,
    ) => MouseEventHandler<HTMLTableCellElement> | undefined;
    updateEntry: (
      habitPath: string,
      entry: Entry,
    ) => MouseEventHandler<HTMLTableCellElement> | undefined;
  }

  const { habits, dates, addEntry, updateEntry }: $Props = $props();

  // ? Can habit repository be moved to a store?
  // TODO: This could be simplified, and also done in parallel
  function getEntryByDate(habitId: string, date: DateValue): Entry | undefined {
    const habit = habits.find((habit) => habit.id === habitId);

    if (!habit) return undefined;

    return habit.entries.find((entry) => entry.date.isSameDay(date));
  }
</script>

{#snippet habitCell({ name, path }: Partial<Habit>)}
  <td>
    <a aria-label={path} href={path} class="internal-link">
      {name}
    </a>
  </td>
{/snippet}

{#snippet entryCell(
  entry: Entry | undefined,
  date: DateValue,
  habitPath: Habit["path"],
)}
  <td
    onclick={entry ? updateEntry(habitPath, entry) : addEntry(habitPath, date)}
    class="disable-text-selection entry-cell"
    data-status={entry ? entry.status : Entry.STATUS.unstarted}
  >
    <EntryIcon status={entry ? entry.status : Entry.STATUS.unstarted} />
  </td>
{/snippet}

<tbody>
  {#each habits as habit (habit.id)}
    <tr>
      {@render habitCell({ name: habit.name, path: habit.path })}
      {#each dates as date (date.toString())}
        {@render entryCell(getEntryByDate(habit.id, date), date, habit.path)}
      {/each}
    </tr>
  {/each}
</tbody>

<style>
  :root {
    --success-green: #4caf50;
    --failure-red: #f44336;
    --skip-blue: #64b5f6;
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

  td {
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

  .disable-text-selection {
    user-select: none;
  }
</style>
