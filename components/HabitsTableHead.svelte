<script lang="ts">
  import type DateValue from "models/DateValue";

  interface $Props {
    title: string;
    dates: DateValue[];
  }

  const { title, dates }: $Props = $props();
</script>

<thead>
  <tr>
    <th>
      {title || "Missing Habit Header"}
    </th>
    {#each dates as date (date.toString())}
      <th class="date-cell">{date.toDayString() || "Missing Date"}</th>
    {/each}
  </tr>
</thead>

<style>
  @media screen and (max-width: 768px) {
    /* Hide all date columns except the last one */
    th.date-cell:not(:last-of-type) {
      display: none;
    }
  }

  th {
    font-size: var(--tiny-table-font-size);
    width: 100%;
    padding: 18px 12px;
    border-radius: var(--radius-m);
    background-color: rgba(var(--mono-rgb-0), 0.2);
    text-align: center;
  }
</style>
