<script lang="ts">
  import type { DateValue } from "models/DateValue";

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
    font-size: 16px;
    width: 100%;
    padding: 18px 12px;
    border-radius: 6px;
    border-spacing: 6px;
    border: 1px solid rgba(74, 43, 112, 0.2);
    background-color: rgba(0, 0, 0, 0.2);
    text-align: center;
  }
</style>
