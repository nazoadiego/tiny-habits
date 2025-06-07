import type Entry from "models/Entry"

export type THabit = {
  id: string,
  name: string,
  path: string,
  entries: Entry[]
}