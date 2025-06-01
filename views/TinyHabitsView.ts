import { Vault, type App, type MarkdownPostProcessorContext } from 'obsidian'
import { mount } from "svelte";
// import NoResultsPlaceholder from 'components/NoResultsPlaceholder.svelte';
import HabitsTable from 'components/HabitsTable.svelte';
import HabitRepository from 'repositories/HabitRepository';

export default class TinyHabitsView {
  markdownBlockElement: HTMLElement
  habitRepository: HabitRepository
  vault: Vault

  constructor(
    source: string,
    markdownBlockElement: HTMLElement,
    context: MarkdownPostProcessorContext,
    app: App,
    habitRepository: HabitRepository
  ) {
    this.habitRepository = habitRepository
    this.markdownBlockElement = markdownBlockElement

    this.renderView()
  }

  async mountHabits() {

    // TODO: definitely don't do it here, read from the store in a svelte component
    // const hasHabits = habits.length > 0;

    // if (!hasHabits) {
    //   mount(NoResultsPlaceholder, {
    //     target: this.markdownBlockElement
    //   });
    //   return;
    // }

    mount(HabitsTable, {
      target: this.markdownBlockElement,
      props: { habitRepository: this.habitRepository }
    });
  }

  async renderView() {
    await this.mountHabits();
  }
}
