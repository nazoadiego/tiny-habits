import { FileManager, Notice, parseYaml, TFile, type Vault } from "obsidian";
import type { THabitRepository } from '../types/THabitRepository';
import Habit from "models/Habit";
import Entry from "models/Entry";
import { DateValue } from "models/DateValue";
import type { Status } from "types/TEntry";

class HabitRepository implements THabitRepository {
  private readonly HABITS_FOLDER_PATH = 'Tiny Habits';
  private readonly vault
  private readonly fileManager

  constructor(vault: Vault, fileManager: FileManager) {
    this.vault = vault
    this.fileManager = fileManager
  }

  async allHabitFiles() {
    const folder = this.vault.getFolderByPath(this.HABITS_FOLDER_PATH)

    if (folder == null) return []

    const files = folder.children as TFile[]
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  async allHabits() {
    const files = await this.allHabitFiles()

    // Get it? Build habits haha
    const buildHabits = async (file: TFile) => {
      // TODO: handle reading file errors
      const data = await this.vault.read(file);

      // TODO: Extract Frontmatter to an object
      const frontmatter = data.split('---')[1]

      // * If the Habit file has no frontmatter, we return an empty entries array 
      if (!frontmatter) return Habit.fromFile(file, [])

      // TODO: handle parsing yaml errors
      const rawEntryData = parseYaml(frontmatter);
      const entries: Entry[] = [];

      for (const [date, status] of Object.entries(rawEntryData)) {
        if (!DateValue.validate(date)) {
          console.warn(`Invalid date format for habit ${file.basename}: ${date}`);
          continue;
        }

        const dateValue = new DateValue(date);
        const entry = new Entry(dateValue, status as Status);
        entries.push(entry);
      }

      return Habit.fromFile(file, entries)
    }

    const habits = await Promise.all(
      files.map(file => buildHabits(file))
    );

    return habits
  }

  addEntry(habitPath: Habit['path'], date: DateValue) {
    const file = this.vault.getFileByPath(habitPath)

    if (!file || !(file instanceof TFile)) {
      new Notice("Couldn't update the habit entry!")
      return
    }

    const entry = new Entry(date, Entry.STATUS.unstarted);
    entry.cycleStatus()
    const isoDate = entry.date.toISODateString()
    this.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter[isoDate] = entry.status;
    });
  }

}

export default HabitRepository