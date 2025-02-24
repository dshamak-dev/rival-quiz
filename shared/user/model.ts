import { ID, DateType } from "../common/model";
import { USER_HISTORY_TYPE } from "./constants";

export type UserHistoryDTO = {
  id: ID;
  userId: ID;
  type: USER_HISTORY_TYPE;
  metadata?: any;
  data?: any;
  createdAt: DateType;
  updatedAt?: DateType;
};
