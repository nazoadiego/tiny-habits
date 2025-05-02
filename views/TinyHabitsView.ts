import { type App, type MarkdownPostProcessorContext } from 'obsidian'
import { mount } from "svelte";
import NoResultsPlaceholder from 'components/NoResultsPlaceholder.svelte';
import HabitsTable from 'components/HabitsTable.svelte';

export default class TinyHabitsView {
  constructor(source: string, markdownBlockElement: HTMLElement, context: MarkdownPostProcessorContext, app: App) {
    const HABITS_FOLDER_PATH = "Tiny Habits"

    mount(HabitsTable, { target: markdownBlockElement });

    // TODO: Before getting any data, we should show a default table to avoid flickering. Then you pass down the habits.
    // TODO: This is a different concept from having NO results.
    const habitFiles = app.vault
      .getMarkdownFiles()
      .filter(file => file.path.includes(HABITS_FOLDER_PATH)) // TODO: This is not quite right, if the Index note is called the same as the path, it will pick it up as well. Example, "Tiny Habits.md" and a "Tiny Habits" folder. This can be avoided by setting the path to "Tiny Habits", but it's a brittle solution if we let the user write it manually.
      .sort((a, b) => a.name.localeCompare(b.name));

    const noHabitsFiles = habitFiles.length === 0

    if (noHabitsFiles) {
      mount(NoResultsPlaceholder, { target: markdownBlockElement });
      return
    }
  }
}
