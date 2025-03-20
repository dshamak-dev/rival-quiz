import database from "./database";
import { normalize } from "./helper";
import { InvoiceCreateDTO, InvoiceDTO } from "./type";

export async function createInvoice(
  invoice: InvoiceCreateDTO
): Promise<InvoiceDTO> {
  return database.create(invoice).then(normalize);
}

export async function getInvoiceById(id): Promise<InvoiceDTO | null> {
  return database.findById(id).then(normalize);
}

export async function getInvoices(query): Promise<InvoiceDTO[]> {
  return database.find(query).then((res) => res.map(normalize));
}

export async function updateInvoice(
  id,
  payload: InvoiceDTO
): Promise<InvoiceDTO> {
  return database.findByIdAndUpdate(id, payload, { new: true }).then(normalize);
}
