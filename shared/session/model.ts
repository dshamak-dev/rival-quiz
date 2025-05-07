import { QuestionDataDTO } from "@/question/quistion.model";
import { DateType, ID } from "../common/model";
import { SessionStateType, SessionTypes } from "./constants";
import { SessionSettingsDTO } from "./type";

export type SessionDTO = {
  id: ID;
  description?: string;
  state: SessionStateType;
  title: string;
  data?: Record<string, any>;
  ownerId: ID;
  createdAt: DateType;
  updatedAt?: DateType;
  questions: Record<string, any>[];
  image?: string;
  userActions?: Record<string, any>[];
  users?: ID[];
  type?: SessionTypes;
  settings?: SessionSettingsDTO;
  hasNextQuestion?: boolean;
  activeQuestionId?: ID;
  questionData?: Record<string, any>;
  history?: QuestionDataDTO[];
  hash: string;
};
