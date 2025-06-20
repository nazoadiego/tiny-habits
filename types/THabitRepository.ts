import type Habit from "models/Habit";
// import type { Habit } from "./habit";

export type THabitRepository = {
    allHabits(path: string): Promise<Habit[]>
    // getByPath(path: string): Promise<Habit | null>;
    // save(habit: Habit): Promise<void>;
}