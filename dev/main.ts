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
	// A stand-in for Obsidian's modal: a backdrop and a dialog that close on Escape or a click outside.
	openModal: (title, render) => {
		const container = document.createElement('div')
		container.className = 'modal-container'
		container.innerHTML = '<div class="modal-bg"></div><div class="modal"><div class="modal-title"></div><div class="modal-content"></div></div>'

		const content = container.querySelector<HTMLElement>('.modal-content')
		const heading = container.querySelector<HTMLElement>('.modal-title')
		if (content == undefined || heading == undefined) return

		heading.textContent = title
		document.body.append(container)

		let teardown: (() => void) | void = undefined
		const close = () => {
			document.removeEventListener('keydown', handleKeydown)
			teardown?.()
			container.remove()
		}
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') close()
		}

		container.querySelector('.modal-bg')?.addEventListener('click', close)
		document.addEventListener('keydown', handleKeydown)
		teardown = render(content, close)
	},
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
