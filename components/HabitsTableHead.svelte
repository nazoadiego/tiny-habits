<script lang="ts">
	import type DateValue from 'models/DateValue'

	interface $Props {
		title: string;
		dates: DateValue[];
		toggleCollapse: () => void;
	}

	const { title, dates, toggleCollapse }: $Props = $props()
</script>

<thead>
	<tr>
		<th onclick={toggleCollapse} class="group-title">
			{title || 'Missing Habit Group Header'}
		</th>
		{#each dates as date (date.toDayString())}
			<th
				class="date-cell"
				aria-label={date.toFullDateWithWeekday()}
			>
				<div>
					{date.toDayOfTheWeek()}
				</div>
				<small>{date.toDayString()}</small>
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
