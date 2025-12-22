export interface ReportResponse {
    id: number;
    reporterUsername: string;
    reporterAvatarUrl: string;
    reportedUsername: string;
    reportedAvatarUrl: string;
    reason: string;
    description: string;
    createdAt: string;
    reportedThreadId?: number;
    reportedThreadPreview?: string;
  }