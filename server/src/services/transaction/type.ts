import { ID } from "@shared/common/model";

export type TransactionParty = {
  id: ID;
  type: "session" | "user" | "system";
};

export type TransactionPayload = {
  amount: number;
  type: "prize" | "withdrawal" | "deposit" | 'income';
  details: string;
  data?: Record<string, any>;
  reference?: string;
};
