// Relations
// A habit has many entries
// A habit belongs to one or more Habit Groups

import type { TFile } from "obsidian";
import type { THabit } from "types/THabit";

class Habit implements THabit {
  id: string;
  name: string;
  path: string

  constructor({ id, name, path }: THabit) {
    this.id = id
    this.name = name
    this.path = path
  }

  static validate(): boolean { return true }

  static fromFile(file: TFile): Habit {
    const id = file.basename;
    const name = file.basename.replace(/-/g, " ");
    const path = file.path;
    return new Habit({ id, name, path });
  }
}

export default Habit