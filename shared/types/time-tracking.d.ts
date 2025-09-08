import type { BaseViewModel } from "./base";

export interface TimeTrackingActivityViewModel extends BaseViewModel {
  user: string;
  from: string;
  to: string | null;
  duration: number;
  description: string | null;
  company: string | null;
  exportedAt: string | null;
}
