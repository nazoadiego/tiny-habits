import type Habit from "models/Habit";
import { writable } from "svelte/store";

export const habitStore = writable<Habit[]>([]);