import type DateValue from "models/DateValue";

export type Status = "unstarted" | "completed" | "failed" | "skip";
export type TEntry = {
  habitId: string;
  status: Status;
  date: DateValue;
};
