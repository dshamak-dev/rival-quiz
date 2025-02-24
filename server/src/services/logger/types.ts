import { ID } from "@shared/common/model";

export type LogCreate = Omit<Log, "id" | "updatedAt" | "createdAt">;

export type Log = {
  id: ID;
  source: string;
  message: string;
  data: Record<string, any>;
  updatedAt: Date | string;
  createdAt: Date | string;
};
