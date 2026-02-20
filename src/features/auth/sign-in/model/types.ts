import type { USER_ROLES } from "@/entities/user/model/types";

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    role: USER_ROLES;
  };
}
