import { ID } from "@shared/common/model";
import { TransactionDTO } from "@shared/transaction/type";

export type TransactionParty = {
  id: ID;
  type: "session" | "user" | "system" | 'invoice';
};

export type TransactionPayload = {
  amount: number;
  type: TransactionDTO['type'];
  details: string;
  data?: Record<string, any>;
  reference?: string;
  unique?: boolean;
};
