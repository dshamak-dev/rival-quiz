import { SessionStageType } from "src/models/session.model";

export function getSessionStageLabel(stage: SessionStageType): string {
  switch (stage) {
    case SessionStageType.Draft:
    case SessionStageType.Lobby: {
      return 'lobby'
    }
    case SessionStageType.Active: {
      return 'in progress'
    }
    case SessionStageType.Close: {
      return 'closed'
    }
  }
}