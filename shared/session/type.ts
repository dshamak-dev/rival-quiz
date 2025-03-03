export enum SessionTypes {
  USER_BET = "user_bet",
  SPONSOR = "sponsor",
  SYSTEM_PRIZE = "system_prize",
  LOTTERY = "lottery",
}

export type SessionSettingsDTO = {
	pool?: number;
}