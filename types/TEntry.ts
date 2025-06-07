import type { DateValue } from "models/DateValue";

// TODO: Should I just use the index value? Like Entry['Status'] and Entry['StatusDisplay']
export type Status = "unstarted" | "completed" | "failed" | "skip";
export type StatusDisplay = "O" | "X" | "-" | "";
export type TEntry = {
  id: number;
  habitId: string;
  status: Status;
  date: DateValue;
};
