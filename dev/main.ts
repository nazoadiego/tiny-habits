import TinyHabits from 'app/TinyHabits'
import InMemoryPlatform from 'platform/memory/InMemoryPlatform'
import { EMPTY_FOLDER, HABITS_FOLDER, seedHabitFiles } from './seedHabits'
import { setIcon } from './icons'
import '../styles.css'
import './obsidian-theme.css'

function showNotice(message: string) {
	const notice = document.createElement('div')
	notice.className = 'notice'
	notice.textContent = message
	document.querySelector('.notice-container')?.append(notice)
	setTimeout(() => notice.remove(), 4000)
}

const platform = new InMemoryPlatform({
	folders: [HABITS_FOLDER, EMPTY_FOLDER],
	files: seedHabitFiles(),
	notify: showNotice,
	// The dev page has no command palette, so plain browser prompts stand in for the dialogs.
	askText: ({ title, validate }) => {
		let reason: string | undefined

		// Asks again while the text is invalid, which is what the Obsidian dialog does by not submitting.
		while (true) {
			const input = globalThis.prompt(reason ? `${title}\n${reason}` : title)
			if (input == undefined) return Promise.resolve(undefined)

			reason = validate(input)
			if (reason == undefined) return Promise.resolve(input)
		}
	},
	askChoice: (question, choices) => Promise.resolve(globalThis.prompt(`${question}\n${choices.join('\n')}`, choices[0]) ?? undefined),
	setIcon
})

const tinyHabits = new TinyHabits(platform)
tinyHabits.watchHabitFiles()

// Each code block on the page, as a user would write it in a note.
for (const block of document.querySelectorAll<HTMLElement>('[data-habits-source]')) {
	const source = block.querySelector('script[type="text/plain"]')?.textContent ?? ''
	tinyHabits.renderCodeBlock(source, block)
}

// Habit names link to their note in Obsidian; there are no notes here.
document.addEventListener('click', (event) => {
	if (!(event.target instanceof Element)) return

	const link = event.target.closest('a.internal-link')
	if (link == undefined) return

	event.preventDefault()
	showNotice(`Would open ${link.getAttribute('href')} in Obsidian`)
})

document.querySelector('#add-habit')?.addEventListener('click', () => tinyHabits.addHabit())

const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle')
themeToggle?.addEventListener('click', () => {
	document.body.classList.toggle('theme-dark')
	document.body.classList.toggle('theme-light')
})

// For poking at the data from the browser console.
Object.assign(globalThis, { platform })
