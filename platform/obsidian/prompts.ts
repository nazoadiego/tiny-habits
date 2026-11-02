import { type App, FuzzySuggestModal, Modal } from 'obsidian'
import type { TextQuestion } from 'platform/Platform'

/**
 @returns What the user typed, or undefined when they dismissed the dialog.
 */
export function askText(app: App, question: TextQuestion): Promise<string | undefined> {
	return new Promise((resolve) => {
		new TextPrompt(app, question, resolve).open()
	})
}

/**
 @returns The choice the user picked, or undefined when they dismissed the dialog.
 */
export function askChoice(app: App, question: string, choices: string[]): Promise<string | undefined> {
	return new Promise((resolve) => {
		new ChoicePrompt(app, question, choices, resolve).open()
	})
}

class TextPrompt extends Modal {
	private answer: string | undefined

	constructor(
		app: App,
		private readonly question: TextQuestion,
		private readonly resolve: (answer: string | undefined) => void
	) {
		super(app)
	}

	onOpen() {
		const { title, placeholder, submitLabel, validate } = this.question

		this.setTitle(title)
		this.modalEl.addClass('tiny-habits-prompt')

		const input = this.contentEl.createEl('input', { type: 'text', cls: 'tiny-habits-prompt-input' })
		if (placeholder != undefined) input.placeholder = placeholder

		const error = this.contentEl.createDiv({ cls: 'tiny-habits-prompt-error' })

		const buttons = this.contentEl.createDiv({ cls: 'modal-button-container' })
		buttons.createEl('button', { text: 'Cancel' }).addEventListener('click', () => this.close())
		const submitButton = buttons.createEl('button', { text: submitLabel, cls: 'mod-cta' })

		const submit = () => {
			if (validate(input.value) != undefined || input.value.trim() === '') return

			this.answer = input.value
			this.close()
		}

		// The error only appears once the user has typed something, so the empty dialog starts calm.
		const refresh = () => {
			const message = validate(input.value)
			const isEmpty = input.value.trim() === ''

			error.setText(isEmpty ? '' : (message ?? ''))
			submitButton.disabled = message != undefined
		}

		input.addEventListener('input', refresh)
		input.addEventListener('keydown', (event) => {
			if (event.key !== 'Enter' || event.isComposing) return

			event.preventDefault()
			submit()
		})
		submitButton.addEventListener('click', submit)

		refresh()
		input.focus()
	}

	onClose() {
		this.contentEl.empty()
		this.resolve(this.answer)
	}
}

class ChoicePrompt extends FuzzySuggestModal<string> {
	private answer: string | undefined

	constructor(
		app: App,
		question: string,
		private readonly choices: string[],
		private readonly resolve: (answer: string | undefined) => void
	) {
		super(app)
		this.setPlaceholder(question)
	}

	getItems() {
		return this.choices
	}

	getItemText(item: string) {
		return item
	}

	onChooseItem(item: string) {
		this.answer = item
	}

	onClose() {
		// onChooseItem runs after onClose, so give it a tick before reporting no answer.
		setTimeout(() => this.resolve(this.answer), 0)
	}
}
