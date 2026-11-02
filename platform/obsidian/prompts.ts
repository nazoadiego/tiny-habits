import { type App, FuzzySuggestModal, Modal, Setting } from 'obsidian'

/**
 @returns What the user typed, or undefined when they dismissed the dialog.
 */
export function askText(app: App, question: string, placeholder?: string): Promise<string | undefined> {
	return new Promise((resolve) => {
		new TextPrompt(app, question, placeholder, resolve).open()
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
		private readonly question: string,
		private readonly placeholder: string | undefined,
		private readonly resolve: (answer: string | undefined) => void
	) {
		super(app)
	}

	onOpen() {
		this.setTitle(this.question)

		new Setting(this.contentEl).addText((text) => {
			if (this.placeholder != undefined) text.setPlaceholder(this.placeholder)

			text.inputEl.addEventListener('keydown', (event) => {
				if (event.key !== 'Enter' || event.isComposing) return

				event.preventDefault()
				this.answer = text.getValue()
				this.close()
			})

			text.inputEl.focus()
		})
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
