import { ID } from "@shared/common/model";

export type TransactionParty = {
  id: ID;
  type: "session" | "user" | "system" | 'invoice';
};

export type TransactionPayload = {
  amount: number;
  type: "prize" | "withdrawal" | "deposit" | 'reserve' | 'income' | 'top-up';
  details: string;
  data?: Record<string, any>;
  reference?: string;
  unique?: boolean;
};
