import type { TDay } from "./TDay";

export type Status = "unstarted" | "completed" | "failed" | "skip";
export type StatusDisplay = "O" | "X" | "-" | "";
export type TEntry = {
  id: number;
  groupId: number;
  status: Status;
  day: TDay;
};
