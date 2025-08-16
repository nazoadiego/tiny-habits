import Entry from "models/Entry";
import { entryFactory } from "../factories/EntryFactory";

describe(("it changes the cycles to the next status"), () => {
	it('it starts in the correct status', () => {
		const entry = entryFactory.build()

		expect(entry.status).toBe(Entry.STATUS.unstarted);
	})

  
	it('it goes from unstarted to completed', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.unstarted })

		expect(entry.nextStatus()).toBe(Entry.STATUS.completed);
	})

  
	it('it goes from completed to failed', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.completed })

		expect(entry.nextStatus()).toBe(Entry.STATUS.failed);
	})

  
	it('it goes from failed to skip', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.failed })

		expect(entry.nextStatus()).toBe(Entry.STATUS.skip);
	})

	it('it goes back from skip to unstarted', () => {
		const entry = entryFactory.build({ status: Entry.STATUS.skip })

		expect(entry.nextStatus()).toBe(Entry.STATUS.unstarted);
	})
})