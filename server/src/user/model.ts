export type UserDTO = {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  photoUrl?: string;
  meta?: TelegramMetaDTO;
  authType: "email" | "telegram";
  role?: string;
  tag?: string;
};

export type TelegramMetaDTO = {
  id: string;
  name: string;
  photoUrl?: string;
  pin?: string;
};

export type UserTokenDTO =
  | { authType: "email"; email: string; password: string }
  | { authType: "telegram"; id: string; name: string };
