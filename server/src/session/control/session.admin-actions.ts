import { QuestionDataDTO } from "@/question/quistion.model";
import { findQuestionDataAndSync } from "@/services/question-data/actions";
import { createTransaction } from "@/services/transaction/action";
import { expandResponse } from "@shared/async/helpers";
import { ID } from "@shared/common/model";
import { SessionStateType } from "@shared/session/constants";
import { SessionDTO } from "@shared/session/model";
import {
  TransactionPayload,
  TransactionTypeEnum,
} from "@shared/transaction/type";

export async function lockSessionQuestion(
  session: SessionDTO,
  questionId: ID
): Promise<SessionDTO> {
  // Validate question ID and session ID
  if (!session || !questionId) {
    return Promise.reject("Invalid session or question ID");
  }

  const updates = Object.assign({}, session);
  const sessionId = session.id;
  // Collect question data
  const [questionData, questionDataError] = await expandResponse(
    findQuestionDataAndSync({
      sessionId,
      questionId: questionId,
    })
  );

  if (!questionData) {
    return Promise.reject(
      questionDataError || "Failed to create question data"
    );
  }
  // Lock user bets, create transactions
  const transactions = await Promise.all(
    questionData.votes.map(
      ({ userId, answer, value, questionId, sessionId }) => {
        const payload: TransactionPayload = {
          amount: Number(value),
          type: TransactionTypeEnum.Bet,
          details: `Bet locked for question ${questionId}`,
          data: { questionId, answer, value, sessionId },
          reference: sessionId,
        };

        return createTransaction(
          { type: "user", id: userId },
          { type: "session", id: sessionId },
          payload
        ).catch((err) => {
          console.log("Failed to create bet transaction: ", err);
          return null;
        });
      }
    )
  ).catch(err => {
    console.log("Failed to create vote transactions: ", err);
    return null;
  });
  // TODO: Update question state to locked

  // Update session state to locked (deprecated, should not effect session state). Change to quistion locked.
  updates.state = SessionStateType.Locked;

  // Return updated session
  return updates;
}
