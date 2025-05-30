import { type App, type MarkdownPostProcessorContext } from 'obsidian'
import { mount } from "svelte";
import NoResultsPlaceholder from 'components/NoResultsPlaceholder.svelte';
import HabitsTable from 'components/HabitsTable.svelte';
import HabitRepository from 'repositories/HabitRepository';

export default class TinyHabitsView {
  markdownBlockElement: HTMLElement
  habitRepository: HabitRepository

  constructor(source: string, markdownBlockElement: HTMLElement, context: MarkdownPostProcessorContext, app: App) {
    this.habitRepository = new HabitRepository(app.vault)
    this.markdownBlockElement = markdownBlockElement

    this.mountHabits()
  }

  async mountHabits() {
    const habits = await this.habitRepository.all()
    const entriesByHabit = await this.habitRepository.entriesGroupedByHabit()
    const hasHabits = habits.length > 0

    // TODO: I should handle the mounting of the component more organized, specially if i have props. On the Svelte side.
    // TODO: Three possible scenarios: no habits, habits and the placeholder while it opens
    if (!hasHabits) {
      mount(NoResultsPlaceholder, { target: this.markdownBlockElement });
      return
    }
    mount(HabitsTable, {
      target: this.markdownBlockElement,
      props: { hasHabits, habits, entriesByHabit }
    });
  }
}
