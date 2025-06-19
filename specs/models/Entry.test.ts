import { expect, test } from 'vitest'
import DateValue from "models/DateValue";
import Entry from "models/Entry";
import type { Status } from 'types/TEntry';

test('Expect entry to return the correct status', () => {
	const dateValue = new DateValue(new Date) 

	const statuses = Object.keys(Entry.STATUS) as Status[]

	for (const entryStatus of statuses) {
		const entry = new Entry(dateValue, entryStatus);
		expect(entry.status).toBe(entryStatus);
	}
});