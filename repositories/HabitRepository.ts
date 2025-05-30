import type { Vault } from "obsidian";
import type { THabitRepository } from '../types/THabitRepository';
import Habit from "models/Habit";
import type { THabitGroup } from "types/THabitGroup";
import type { TEntry } from "types/TEntry";
import Entry from "models/Entry";

class HabitRepository implements THabitRepository {
  private readonly HABITS_FOLDER_PATH = 'Tiny Habits';

  constructor(private vault: Vault) { this.vault = vault }

  async allFiles() {
    // Convert to our data object
    return this.vault
      .getMarkdownFiles()
      .filter(file => file.path.includes(this.HABITS_FOLDER_PATH)) // TODO: This is not quite right, if the Index note is called the same as the path, it will pick it up as well. Example, "Tiny Habits.md" and a "Tiny Habits" folder. This can be avoided by setting the path to "Tiny Habits", but it's a brittle solution if we let the user write it manually.
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async all() {
    // Convert to our data object
    const files = await this.allFiles()
    const habits = await Promise.all(files.map(async file => Habit.fromFile(file)));

    return habits
  }


  async allEntries() {
    const entries: TEntry[] = [
      { id: 1, groupId: 1, status: "failed", day: 1 },
      { id: 2, groupId: 1, status: "failed", day: 2 },
      { id: 3, groupId: 1, status: "failed", day: 3 },
      { id: 4, groupId: 1, status: "failed", day: 4 },
      { id: 5, groupId: 1, status: "failed", day: 5 },
      { id: 6, groupId: 1, status: "failed", day: 6 },
      { id: 7, groupId: 1, status: "failed", day: 7 },
      { id: 8, groupId: 2, status: "completed", day: 1 },
      { id: 8, groupId: 2, status: "completed", day: 2 },
    ];

    const entryList = await Promise.all(entries.map(async entry => {
      return new Entry(entry.id, entry.groupId, entry.status, entry.day)
    }))

    return entryList
  }

  async allGroups() {
    const habitGroupList: THabitGroup[] = [
      { id: 1, name: "Study" },
      { id: 2, name: "Breakfast" },
    ];

    return habitGroupList
  }

  async allEntriesGrouped() {
    const entries = await this.allEntries()

    return Object.groupBy(entries, (entry) => entry.groupId);
  }
}

export default HabitRepository