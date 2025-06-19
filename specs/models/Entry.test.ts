import Entry from "models/Entry";
import type { Status } from 'types/TEntry';
import { entryFactory } from "../factories/EntryFactory";

const statuses = Object.keys(Entry.STATUS) as Status[]

describe('Expect entry to return the correct status', () => {
	for (const entryStatus of statuses) {
		const entry = entryFactory.build({ status: entryStatus })

		it(`checks the status for ${entryStatus}`, () => {
			expect(entry.status).toBe(entryStatus);
		}) 
	}
});

describe(("it changes the cycles to the next status"), () => {
	it('it starts in the correct status', () => {
		const entry = entryFactory.build()

		expect(entry.status).toBe(Entry.STATUS.unstarted);
	})

  
	it('it goes from unstarted to completed', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.unstarted })

		entry.cycleStatus()

		expect(entry.status).toBe(Entry.STATUS.completed);
	})

  
	it('it goes from completed to failed', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.completed })

		entry.cycleStatus()

		expect(entry.status).toBe(Entry.STATUS.failed);
	})

  
	it('it goes from failed to skip', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.failed })

		entry.cycleStatus()

		expect(entry.status).toBe(Entry.STATUS.skip);
	})

	it('it goes back from skip to unstarted', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.skip })

		entry.cycleStatus()

		expect(entry.status).toBe(Entry.STATUS.unstarted);
	})
})