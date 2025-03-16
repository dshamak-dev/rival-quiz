import * as shared from "@shared/invoice/type";

export type InvoiceCreateDTO = shared.InvoiceCreateDTO;

export type InvoiceDTO = shared.InvoiceDTO;

export type InvoiceItem = shared.InvoiceItem;

export enum InvoiceStatus {
  DRAFT = shared.InvoiceStatus.DRAFT,
  PAID = shared.InvoiceStatus.PAID,
  OVERDUE = shared.InvoiceStatus.OVERDUE,
}
