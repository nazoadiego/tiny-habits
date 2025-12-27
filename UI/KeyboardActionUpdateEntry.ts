import type { Status } from 'models/Entry'
import Entry from 'models/Entry'


const STATUS_CHANGE_MAP: Record<string, Status> = {
	1: Entry.STATUS.completed,
	2: Entry.STATUS.failed,
	3: Entry.STATUS.skip,
	4: Entry.STATUS.unstarted
}


export class KeyboardActionUpdateEntry {
	private event
	private key

	constructor(event: KeyboardEvent) {
		this.event = event
		this.key = event.key
	}

	call(updateEntry: (status?: Status) => void) {
		if (!this.isValid()) return

		this.event.preventDefault()

		if (this.isChangeEntryKey()) {
			updateEntry(STATUS_CHANGE_MAP[this.key])
			return
		}

		if (this.isToggleKey()) {
			updateEntry()
			return
		}
	}

	private isValid() {
		return this.isToggleKey() || this.isChangeEntryKey()
	}

	private isToggleKey() {
		return this.key === 'Enter' || this.key === ' '
	}

	private isChangeEntryKey() {
		return this.key === '4' || this.key === '1' || this.key === '2' || this.key === '3'
	}
}
