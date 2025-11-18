import { NotificationTriggerUser } from "./NotificationTriggerUser";

export interface NotificationInterface {
    id: number;
    type: string;
    message: string; // Mensaje base, ej: "le ha gustado tu hilo"
    isRead: boolean;
    createdAt: string;
    threadId: number | null;
    threadPreview: string | null;
    triggerUser: NotificationTriggerUser | null;
    }