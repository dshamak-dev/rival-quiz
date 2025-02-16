import { ID, DateType } from "@/common/model";

export type UserHistoryDTO = {
  userId: ID;
  type: string;
  createdAt: DateType;
  updatedAt?: DateType;
};
