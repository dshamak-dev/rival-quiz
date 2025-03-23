import { ID } from "../common/model";
import { CurrencyTypeEnum } from "../payment/constant";

export type TransactionDTO = TransactionCreateDTO & {
  id: ID;
  status: TransactionStatusEnum;
  updatedAt: Date | string;
  createdAt: Date | string;
};

export type TransactionCreateDTO = {
  senderId: TransactionParty["id"];
  senderType: TransactionParty["type"];
  receiverId: TransactionParty["id"];
  receiverType: TransactionParty["type"];
  type: TransactionTypeEnum;
  amount: number;
  currency: CurrencyTypeEnum;
  data: Object;
  reference?: string;
  details: string;
};

export type TransactionType =
  | "prize"
  | "withdrawal"
  | "deposit"
  | "reserve"
  | "income"
  | "top-up";

export enum TransactionTypeEnum {
  Prize = "prize",
  Withdrawal = "withdrawal",
  Deposit = "deposit",
  Reserve = "reserve",
  Income = "income",
  TopUp = "top-up",
};

export type TransactionParty = {
  id: ID;
  type: "session" | "user" | "system" | "invoice";
};

export type TransactionPayload = {
  amount: number;
  type: "prize" | "withdrawal" | "deposit" | "reserve" | "income" | "top-up";
  details: string;
  data?: Record<string, any>;
  reference?: string;
  unique?: boolean;
};

export enum TransactionStatusEnum {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Canceled = 3,
  Refunded = 4,
  Deleted = 5,
}
