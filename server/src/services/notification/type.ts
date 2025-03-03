export type NotificationCreatePayload = Omit<
  Notification,
  "id" | "updatedAt" | "createdAt"
>;

export type Notification = {
  id: string;
  target: {
    id?: string;
    type: "user" | "session" | "system";
  };
  type?: "info" | "warning" | "error" | "success";
  title: string;
  content?: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  isRead?: boolean;
};
