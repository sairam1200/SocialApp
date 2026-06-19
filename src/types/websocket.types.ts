// Notifications
export interface Notification {
    id: string;
    title: string;
    body: string;
    type: string;
    link: string | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface NotificationReadEvent {
    notificationIds?: string[];
    readAt: string;
  }
  
  export interface MarkAsReadSuccessEvent {
    notificationId: string;
  }
  
  export interface MarkAllAsReadSuccessEvent {
    count: number;
  }
  
  // Imports
  export type ImportPlatform =
    | "facebook"
    | "youtube"
    | "instagram"
    | "twitter"
    | "spotify"
    | "pinterest"
    | "reddit"
    | "linkedin"
    | "tiktok";
  
  export interface ImportContent {
    id: string;
    title?: string;
    url?: string;
    thumbnail?: string;
    [key: string]: unknown;
  }
  
  export interface NewContentEvent {
  platform: ImportPlatform;

  id: string;
  title?: string;
  description?: string;
  type?: string;

  externalId?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
}