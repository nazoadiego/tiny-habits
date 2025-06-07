// Relations
// A habit has many entries
// A habit belongs to one or more Habit Groups

import type { TFile } from "obsidian";
import type { THabit } from "types/THabit";
import type Entry from "./Entry";

class Habit implements THabit {
  id: string;
  name: string;
  path: string
  entries: Entry[]

  constructor({ id, name, path, entries }: THabit) {
    this.id = id
    this.name = name
    this.path = path
    this.entries = entries
  }

  static validate(): boolean { return true }

  static fromFile(file: TFile, entries: Entry[]): Habit {
    const id = file.basename;
    const name = file.basename.replace(/-/g, " ");
    const path = file.path;
    return new Habit({ id, name, path, entries });
  }
}

export default Habit