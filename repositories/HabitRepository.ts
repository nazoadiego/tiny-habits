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

  addEntry(path: Habit['path'], value = "FIXME") {
    // * It needs to be the full path, with the folder and extension on it. Like this:
    // * "Tiny Habits/03 Code!.md"
    // TODO: Create a template literal function for the full path, maybe inside a model or something
    const fullPath = `${this.HABITS_FOLDER_PATH}/${path}.md`
    const file = this.vault.getFileByPath(fullPath)

    if (!file || !(file instanceof TFile)) {
      new Notice("Couldn't update the habit entry!")
      return
    }

    // TODO: Handle errors
    // TODO: fromFrontMatter method when reading the frontmatter
    // this.vault.read(file).then((data) => {
    //   const frontmatter = data.split('---')[1]

    //   if (!frontmatter) return {}

    //   return parseYaml(frontmatter)
    // })


    // TODO: Replace day with an actual date
    const day = 1 // New Entry -> entry.cycleState -> entry.date

    return
    // TODO: Handle errors
    this.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter[day] = value;
    });
  }

}

export default HabitRepository