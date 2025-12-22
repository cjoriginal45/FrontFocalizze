import { ReportReason } from "./ReportReason";

export interface ReportRequest {
    reason: ReportReason;
    description?: string;
  }