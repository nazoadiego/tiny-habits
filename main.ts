import { type Editor, Plugin } from 'obsidian'
import ObsidianPlatform from 'platform/obsidian/ObsidianPlatform'
import TinyHabits from 'app/TinyHabits'

export default class TinyHabitsPlugin extends Plugin {
	async onload() {
		const tinyHabits = new TinyHabits(new ObsidianPlatform(this))

		this.registerCommands(tinyHabits)

		// * Why onLayoutReady? https://docs.obsidian.md/Plugins/Guides/Optimizing+plugin+load+time
		this.app.workspace.onLayoutReady(() => tinyHabits.watchHabitFiles())

		this.registerMarkdownCodeBlockProcessor('habits', (source, element) => {
			this.app.workspace.onLayoutReady(() => tinyHabits.renderCodeBlock(source, element))
		})
	}

	registerCommands(tinyHabits: TinyHabits) {
		this.addCommand({
			id: 'tiny-habits-add-table',
			name: 'Add Table',
			editorCallback: (editor: Editor) => {
				const newTableBlock = '```habits\n{\n\t"folderPath": "habits",\n\t"displayName": "My Habits"\n}\n```'

				editor.replaceRange(newTableBlock, editor.getCursor())
			}
		})

		this.addCommand({
			id: 'tiny-habits-add-habit',
			name: 'Add Habit',
			callback: () => tinyHabits.addHabit()
		})
	}

	onunload() {}
}
