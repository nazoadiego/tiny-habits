<script lang="ts">
	import type DateValue from 'models/DateValue'
	import { columnLabel, periodLabel, type Cadence } from 'models/Cadence'

	interface $Props {
		title: string;
		dates: DateValue[];
		cadence: Cadence;
		toggleCollapse: () => void;
	}

	const { title, dates, cadence, toggleCollapse }: $Props = $props()
</script>

<thead>
	<tr>
		<th onclick={toggleCollapse} class="group-title">
			{title || 'Missing Habit Group Header'}
		</th>
		{#each dates as date (date.toYearMonthDayString())}
			{@const label = columnLabel(date, cadence)}
			<th
				class="date-cell"
				aria-label={cadence === 'day' ? date.toFullDateWithWeekday() : periodLabel(date, cadence)}
			>
				<div>
					{label.top}
				</div>
				<small>{label.bottom}</small>
			</th>
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

	th.date-cell {
		box-sizing: border-box;
		width: var(--tiny-cell-size);
		min-width: 0; /* Obsidian gives table cells a min-width in ch */
		height: var(--tiny-cell-size);
		padding: 0;
	}

	th {
		vertical-align: middle;
		padding: 12px;
		font-size: var(--tiny-table-font-size);
		border-radius: var(--radius-m);
		background-color: rgba(var(--mono-rgb-0), 0.4);
		text-align: center;
	}

	.group-title {
		white-space: nowrap;
		text-overflow: ellipsis;
		align-content: center;
		cursor: pointer;
	}
</style>
