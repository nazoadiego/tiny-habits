import type Habit from "models/Habit";
import { writable } from "svelte/store";

export type HabitStoreType = Record<string, Habit[]>;

export const habitStore = writable<HabitStoreType>({});