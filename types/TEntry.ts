import type { TDay } from "./TDay";

export type Status = "unstarted" | "completed" | "failed" | "skip";
export type StatusDisplay = "O" | "X" | "-" | "";
export type TEntry = {
  id: number;
  habitId: string;
  status: Status;
  day: TDay;
};
