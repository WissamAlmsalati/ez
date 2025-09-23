import { apiInstance } from "@/shared/api";

export interface ResetRequestDto {
  email: string;
}

export interface ResetRequestResponse {
  message: string;
  data: {
    expiresAt: string; // ISO
    sentTo: string;
  };
}

export interface ResetConfirmDto {
  email: string;
  otp: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface ResetConfirmResponse {
  message: string;
}

export const requestPasswordReset = async (
  payload: ResetRequestDto
): Promise<ResetRequestResponse> => {
  const { data } = await apiInstance.post<ResetRequestResponse>(
    "/auth/password/reset-request",
    payload
  );
  return data;
};

export const confirmPasswordReset = async (
  payload: ResetConfirmDto
): Promise<ResetConfirmResponse> => {
  const { data } = await apiInstance.post<ResetConfirmResponse>(
    "/auth/password/reset-confirm",
    payload
  );
  return data;
};
