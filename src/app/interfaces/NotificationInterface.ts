export interface NotificationInterface {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    threadId: number | null;
    }