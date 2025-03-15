import { ID } from "../common/model";

export type InvoiceCreateDTO = {
  userId: ID;
  discount?: number;
  items?: InvoiceItem[];
  metadata?: any;
  total: number;
};

export type InvoiceDTO = InvoiceCreateDTO & {
  history?: Record<string, any>[];
  status?: InvoiceStatus;
  expireDate?: string;
  createdAt: string;
  updatedAt: string;
};

export enum InvoiceStatus {
  DRAFT = "draft",
  PAID = "paid",
  OVERDUE = "overdue",
}

export type InvoiceItem = {
  productId: ID;
  quantity: number;
  price?: number;
  name: string;
  description?: string;
  metadata?: any;
  total?: number;
  discount?: number;
};
