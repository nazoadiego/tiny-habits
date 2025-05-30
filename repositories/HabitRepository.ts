import type { Vault } from "obsidian";
import type { THabitRepository } from '../types/THabitRepository';
import Habit from "models/Habit";
import type { TEntry } from "types/TEntry";
import Entry from "models/Entry";

class HabitRepository implements THabitRepository {
  private readonly HABITS_FOLDER_PATH = 'Tiny Habits';

  constructor(private vault: Vault) { this.vault = vault }

  async allFiles() {
    return this.vault
      .getMarkdownFiles()
      .filter(file => file.path.includes(this.HABITS_FOLDER_PATH)) // TODO: This is not quite right, if the Index note is called the same as the path, it will pick it up as well. Example, "Tiny Habits.md" and a "Tiny Habits" folder. This can be avoided by setting the path to "Tiny Habits", but it's a brittle solution if we let the user write it manually.
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async all() {
    const files = await this.allFiles()
    const habits = await Promise.all(files.map(async file => Habit.fromFile(file)));

    return habits
  }


  async allEntries() {
    const entries: TEntry[] = [
      { id: 1, habitId: "03 Code!", status: "failed", day: 1 },
      { id: 2, habitId: "03 Code!", status: "failed", day: 2 },
      { id: 3, habitId: "03 Code!", status: "failed", day: 3 },
      { id: 4, habitId: "03 Code!", status: "failed", day: 4 },
      { id: 5, habitId: "03 Code!", status: "failed", day: 5 },
      { id: 6, habitId: "03 Code!", status: "failed", day: 6 },
      { id: 7, habitId: "03 Code!", status: "failed", day: 7 },
      { id: 8, habitId: "04 Breakfast", status: "completed", day: 1 },
      { id: 8, habitId: "04 Breakfast", status: "completed", day: 2 },
    ];

    const entryList = await Promise.all(entries.map(async entry => {
      return new Entry(entry.id, entry.habitId, entry.status, entry.day)
    }))

    return entryList
  }

  async entriesGroupedByHabit() {
    const [habits, entries] = await Promise.all([
      this.all(),
      this.allEntries()
    ]);

    const groupedEntriesByHabit = Object.groupBy(entries, (entry) => entry.habitId);

    // * To ensure all habits have an entry array, even if empty
    const habitEntries: Record<string, Entry[]> = {};
    habits.forEach(habit => {
      habitEntries[habit.id] = groupedEntriesByHabit[habit.id] || [];
    });

    return habitEntries;
  }
}

export default HabitRepository